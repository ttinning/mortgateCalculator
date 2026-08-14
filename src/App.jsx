import { useEffect, useMemo, useState } from 'react'
import LoanForm from './components/LoanForm'
import MortgageSummary from './components/MortgageSummary'
import AmortizationChart from './components/AmortizationChart'
import AmortizationTable from './components/AmortizationTable'
import OverpaymentSavings from './components/OverpaymentSavings'
import InvestmentComparison from './components/InvestmentComparison'
import ComparisonPanel from './components/ComparisonPanel'
import LBTTCalculator from './components/LBTTCalculator'
import AffordabilityCalculator from './components/AffordabilityCalculator'
import RateSwitchCalculator from './components/RateSwitchCalculator'
import { calculateOverpaymentImpact } from './utils/amortization'
import { useLocalStorageState } from './utils/useLocalStorageState'
import { useDarkMode } from './utils/useDarkMode'
import { encodeLoanParams, decodeLoanParams } from './utils/urlState'

const TABS = [
  { id: 'calculator', label: 'Mortgage Calculator' },
  { id: 'comparison', label: 'Compare Scenarios' },
  { id: 'lbtt', label: 'Stamp Duty / LBTT' },
  { id: 'affordability', label: 'Affordability' },
  { id: 'rateswitch', label: 'Rate Switch' },
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
    <section className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
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
        <AmortizationChart schedule={active.schedule} />
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold">Mortgage Calculator</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Estimate monthly payments, model overpayments, compare scenarios, and calculate Stamp Duty/LBTT/LTT.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle dark mode"
            className="shrink-0 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <nav className="mx-auto max-w-5xl px-4 pt-4">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'comparison' && (
          <Section title="Compare 2-3 scenarios">
            <ComparisonPanel />
          </Section>
        )}
        {activeTab === 'lbtt' && (
          <Section title="Stamp Duty / Land Transaction Tax">
            <LBTTCalculator />
          </Section>
        )}
        {activeTab === 'affordability' && (
          <Section title="How much could you afford to borrow?">
            <AffordabilityCalculator />
          </Section>
        )}
        {activeTab === 'rateswitch' && (
          <Section title="Fixed deal → follow-on rate switch">
            <RateSwitchCalculator />
          </Section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-400 dark:text-slate-500">
        Figures are estimates for guidance only. Always check current rates at{' '}
        <a className="underline" href="https://revenue.scot" target="_blank" rel="noreferrer">
          revenue.scot
        </a>{' '}
        before making financial decisions.
      </footer>
    </div>
  )
}

export default App
