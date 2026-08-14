import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import LoanForm from './components/LoanForm'
import MortgageSummary from './components/MortgageSummary'
import AmortizationTable from './components/AmortizationTable'
import OverpaymentSavings from './components/OverpaymentSavings'
import InvestmentComparison from './components/InvestmentComparison'
import SavedScenarios from './components/SavedScenarios'
import { HouseIcon, ScaleIcon, LandmarkIcon, PiggyBankIcon, RefreshIcon, SunIcon, MoonIcon } from './components/icons'
import { calculateOverpaymentImpact } from './utils/amortization'
import { useLocalStorageState } from './utils/useLocalStorageState'
import { useDarkMode } from './utils/useDarkMode'
import { encodeLoanParams, decodeLoanParams } from './utils/urlState'

// Code-split heavier/less-frequently-visited views into separate chunks so
// the initial bundle only includes what's needed for the default tab.
// AmortizationChart pulls in Recharts (the single largest dependency), and
// the other tabs aren't visible until the user switches to them.
const AmortizationChart = lazy(() => import('./components/AmortizationChart'))
const ComparisonPanel = lazy(() => import('./components/ComparisonPanel'))
const LBTTCalculator = lazy(() => import('./components/LBTTCalculator'))
const AffordabilityCalculator = lazy(() => import('./components/AffordabilityCalculator'))
const RateSwitchCalculator = lazy(() => import('./components/RateSwitchCalculator'))

function TabFallback() {
  return (
    <div className="animate-pulse rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 h-32 rounded bg-slate-100 dark:bg-slate-700" />
    </div>
  )
}

const TABS = [
  { id: 'calculator', label: 'Mortgage Calculator', icon: HouseIcon },
  { id: 'comparison', label: 'Compare Scenarios', icon: ScaleIcon },
  { id: 'lbtt', label: 'Stamp Duty / LBTT', icon: LandmarkIcon },
  { id: 'affordability', label: 'Affordability', icon: PiggyBankIcon },
  { id: 'rateswitch', label: 'Rate Switch', icon: RefreshIcon },
]

const DEFAULT_LOAN = {
  principal: 200000,
  annualRatePercent: 5,
  termYears: 25,
  extraMonthly: 0,
  lumpSum: 0,
  lumpSumMonth: 1,
}

function Section({ title, children, actions }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700/70 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-200">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

function CopyLinkButton({ getUrl }) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable/denied — silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shrink-0 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
    >
      {copied ? 'Link copied!' : 'Copy shareable link'}
    </button>
  )
}

function CalculatorTab() {
  const [values, setValues] = useLocalStorageState('mortgage-calculator:loan', DEFAULT_LOAN)

  // On mount, a shared link's query params take priority over whatever was
  // previously saved to localStorage.
  useEffect(() => {
    const fromUrl = decodeLoanParams(window.location.search)
    if (fromUrl) {
      setValues((prev) => ({ ...prev, ...fromUrl }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL query string in sync with the current values (without
  // adding a new history entry per keystroke), so the current URL is always
  // a valid shareable link.
  useEffect(() => {
    const query = encodeLoanParams(values)
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`
    window.history.replaceState(null, '', newUrl)
  }, [values])

  const impact = useMemo(
    () =>
      calculateOverpaymentImpact({
        principal: Number(values.principal) || 0,
        annualRatePercent: Number(values.annualRatePercent) || 0,
        termYears: Number(values.termYears) || 0,
        extraMonthly: Number(values.extraMonthly) || 0,
        lumpSum: Number(values.lumpSum) || 0,
        lumpSumMonth: Number(values.lumpSumMonth) || 1,
      }),
    [values],
  )

  const hasOverpayment = (Number(values.extraMonthly) || 0) > 0 || (Number(values.lumpSum) || 0) > 0
  const active = hasOverpayment ? impact.withOverpayment : impact.base

  return (
    <div className="space-y-6">
      <Section title="Loan details" actions={<CopyLinkButton getUrl={() => window.location.href} />}>
        <LoanForm values={values} onChange={setValues} showOverpaymentFields />
      </Section>

      <Section title="Saved scenarios">
        <SavedScenarios currentValues={values} onLoad={(loaded) => setValues((prev) => ({ ...prev, ...loaded }))} />
      </Section>

      <Section title="Summary">
        <MortgageSummary
          monthlyPayment={active.monthlyPayment}
          totalInterest={active.totalInterest}
          totalPaid={active.totalPaid}
          payoffMonth={active.payoffMonth}
        />
      </Section>

      <OverpaymentSavings monthsSaved={impact.monthsSaved} interestSaved={impact.interestSaved} />

      {hasOverpayment && (
        <InvestmentComparison
          lumpSum={Number(values.lumpSum) || 0}
          monthlyContribution={Number(values.extraMonthly) || 0}
          months={impact.withOverpayment.payoffMonth}
          interestSaved={impact.interestSaved}
        />
      )}

      <Section title="Principal vs. interest over time">
        <Suspense fallback={<TabFallback />}>
          <AmortizationChart schedule={active.schedule} />
        </Suspense>
      </Section>

      <Section title="Amortization schedule">
        <AmortizationTable schedule={active.schedule} />
      </Section>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [isDark, setIsDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/60 sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <HouseIcon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mortgage Calculator</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Estimate monthly payments, model overpayments, compare scenarios, and calculate Stamp Duty/LBTT/LTT.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <nav className="mx-auto max-w-5xl px-4 pt-4">
        <div className="flex flex-wrap gap-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 p-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'comparison' && (
          <Section title="Compare 2-3 scenarios">
            <Suspense fallback={<TabFallback />}>
              <ComparisonPanel />
            </Suspense>
          </Section>
        )}
        {activeTab === 'lbtt' && (
          <Section title="Stamp Duty / Land Transaction Tax">
            <Suspense fallback={<TabFallback />}>
              <LBTTCalculator />
            </Suspense>
          </Section>
        )}
        {activeTab === 'affordability' && (
          <Section title="How much could you afford to borrow?">
            <Suspense fallback={<TabFallback />}>
              <AffordabilityCalculator />
            </Suspense>
          </Section>
        )}
        {activeTab === 'rateswitch' && (
          <Section title="Fixed deal → follow-on rate switch">
            <Suspense fallback={<TabFallback />}>
              <RateSwitchCalculator />
            </Suspense>
          </Section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-4 text-xs text-slate-400 dark:text-slate-500">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          Figures are estimates for guidance only. Always check current rates at{' '}
          <a
            className="font-medium text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
            href="https://revenue.scot"
            target="_blank"
            rel="noreferrer"
          >
            revenue.scot
          </a>{' '}
          before making financial decisions.
        </div>
      </footer>
    </div>
  )
}

export default App
