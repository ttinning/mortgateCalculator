import { generateAmortizationSchedule } from '../utils/amortization'
import { formatCurrency } from '../utils/format'
import { useLocalStorageState } from '../utils/useLocalStorageState'
import { validateField, FIELD_LIMITS } from '../utils/validation'

const MIN_SCENARIOS = 2
const MAX_SCENARIOS = 3

function createScenario(name, overrides = {}) {
  return {
    name,
    principal: 200000,
    annualRatePercent: 5,
    termYears: 25,
    ...overrides,
  }
}

const inputClasses =
  'w-full rounded-md border px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1'
const validInputClasses = 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
const invalidInputClasses = 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'

/**
 * Lets the user configure 2-3 loan scenarios (e.g. different terms/rates)
 * and compares monthly payment and total interest side by side.
 */
export default function ComparisonPanel() {
  const [scenarios, setScenarios] = useLocalStorageState('mortgage-calculator:comparison', [
    createScenario('Scenario A'),
    createScenario('Scenario B', { termYears: 20, annualRatePercent: 4.5 }),
  ])

  const updateScenario = (index, field, rawValue) => {
    setScenarios((prev) =>
      prev.map((scenario, i) => (i === index ? { ...scenario, [field]: rawValue === '' ? '' : Number(rawValue) } : scenario)),
    )
  }

  const renameScenario = (index, name) => {
    setScenarios((prev) => prev.map((scenario, i) => (i === index ? { ...scenario, name } : scenario)))
  }

  const addScenario = () => {
    if (scenarios.length >= MAX_SCENARIOS) return
    setScenarios((prev) => [...prev, createScenario(`Scenario ${String.fromCharCode(65 + prev.length)}`)])
  }

  const removeScenario = (index) => {
    if (scenarios.length <= MIN_SCENARIOS) return
    setScenarios((prev) => prev.filter((_, i) => i !== index))
  }

  const results = scenarios.map((scenario) => ({
    ...scenario,
    ...generateAmortizationSchedule(scenario),
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {scenarios.map((scenario, index) => (
          <div key={index} className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-2 py-1 text-sm font-semibold"
                value={scenario.name}
                onChange={(e) => renameScenario(index, e.target.value)}
              />
              {scenarios.length > MIN_SCENARIOS && (
                <button
                  type="button"
                  onClick={() => removeScenario(index)}
                  className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Loan amount (£)</label>
            <input
              type="number"
              className={`${inputClasses} ${
                validateField(scenario.principal, FIELD_LIMITS.principal) ? invalidInputClasses : validInputClasses
              }`}
              value={scenario.principal}
              onChange={(e) => updateScenario(index, 'principal', e.target.value)}
            />
            {validateField(scenario.principal, FIELD_LIMITS.principal) && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validateField(scenario.principal, FIELD_LIMITS.principal)}</p>
            )}

            <label className="mb-1 mt-2 block text-xs font-medium text-slate-600 dark:text-slate-400">Rate (% / year)</label>
            <input
              type="number"
              step="0.01"
              className={`${inputClasses} ${
                validateField(scenario.annualRatePercent, FIELD_LIMITS.annualRatePercent)
                  ? invalidInputClasses
                  : validInputClasses
              }`}
              value={scenario.annualRatePercent}
              onChange={(e) => updateScenario(index, 'annualRatePercent', e.target.value)}
            />
            {validateField(scenario.annualRatePercent, FIELD_LIMITS.annualRatePercent) && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {validateField(scenario.annualRatePercent, FIELD_LIMITS.annualRatePercent)}
              </p>
            )}

            <label className="mb-1 mt-2 block text-xs font-medium text-slate-600 dark:text-slate-400">Term (years)</label>
            <input
              type="number"
              className={`${inputClasses} ${
                validateField(scenario.termYears, FIELD_LIMITS.termYears) ? invalidInputClasses : validInputClasses
              }`}
              value={scenario.termYears}
              onChange={(e) => updateScenario(index, 'termYears', e.target.value)}
            />
            {validateField(scenario.termYears, FIELD_LIMITS.termYears) && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validateField(scenario.termYears, FIELD_LIMITS.termYears)}</p>
            )}
          </div>
        ))}
      </div>

      {scenarios.length < MAX_SCENARIOS && (
        <button
          type="button"
          onClick={addScenario}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          + Add scenario
        </button>
      )}

      <div className="overflow-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Monthly payment</th>
              <th className="px-3 py-2">Total interest</th>
              <th className="px-3 py-2">Total paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {results.map((result, index) => (
              <tr key={index} className="odd:bg-white dark:odd:bg-slate-800 even:bg-slate-50 dark:even:bg-slate-900">
                <td className="px-3 py-2 font-medium">{result.name}</td>
                <td className="px-3 py-2">{formatCurrency(result.monthlyPayment, { precise: true })}</td>
                <td className="px-3 py-2">{formatCurrency(result.totalInterest)}</td>
                <td className="px-3 py-2">{formatCurrency(result.totalPaid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
