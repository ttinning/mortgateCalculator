import { useEffect, useMemo, useState } from 'react'
import LoanForm from './components/LoanForm'
import MortgageSummary from './components/MortgageSummary'
import AmortizationChart from './components/AmortizationChart'
import AmortizationTable from './components/AmortizationTable'
import OverpaymentSavings from './components/OverpaymentSavings'
import ComparisonPanel from './components/ComparisonPanel'
import LBTTCalculator from './components/LBTTCalculator'
import { calculateOverpaymentImpact } from './utils/amortization'
import { useLocalStorageState } from './utils/useLocalStorageState'
import { encodeLoanParams, decodeLoanParams } from './utils/urlState'

const TABS = [
  { id: 'calculator', label: 'Mortgage Calculator' },
  { id: 'comparison', label: 'Compare Scenarios' },
  { id: 'lbtt', label: 'Scotland LBTT' },
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
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
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
      className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold">Mortgage Calculator</h1>
          <p className="mt-1 text-sm text-slate-500">
            Estimate monthly payments, model overpayments, compare scenarios, and calculate Scotland LBTT.
          </p>
        </div>
      </header>

      <nav className="mx-auto max-w-5xl px-4 pt-4">
        <div className="flex gap-2 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
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
          <Section title="Scotland Land and Buildings Transaction Tax (LBTT)">
            <LBTTCalculator />
          </Section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-400">
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
