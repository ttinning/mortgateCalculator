import { useState } from 'react'
import { generateAmortizationSchedule } from '../utils/amortization'
import { formatCurrency } from '../utils/format'

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
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

/**
 * Lets the user configure 2-3 loan scenarios (e.g. different terms/rates)
 * and compares monthly payment and total interest side by side.
 */
export default function ComparisonPanel() {
  const [scenarios, setScenarios] = useState([
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
          <div key={index} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 flex items-center justify-between gap-2">
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold"
                value={scenario.name}
                onChange={(e) => renameScenario(index, e.target.value)}
              />
              {scenarios.length > MIN_SCENARIOS && (
                <button
                  type="button"
                  onClick={() => removeScenario(index)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="mb-1 block text-xs font-medium text-slate-600">Loan amount (£)</label>
            <input
              type="number"
              className={inputClasses}
              value={scenario.principal}
              onChange={(e) => updateScenario(index, 'principal', e.target.value)}
            />

            <label className="mb-1 mt-2 block text-xs font-medium text-slate-600">Rate (% / year)</label>
            <input
              type="number"
              step="0.01"
              className={inputClasses}
              value={scenario.annualRatePercent}
              onChange={(e) => updateScenario(index, 'annualRatePercent', e.target.value)}
            />

            <label className="mb-1 mt-2 block text-xs font-medium text-slate-600">Term (years)</label>
            <input
              type="number"
              className={inputClasses}
              value={scenario.termYears}
              onChange={(e) => updateScenario(index, 'termYears', e.target.value)}
            />
          </div>
        ))}
      </div>

      {scenarios.length < MAX_SCENARIOS && (
        <button
          type="button"
          onClick={addScenario}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Add scenario
        </button>
      )}

      <div className="overflow-auto rounded-lg ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Monthly payment</th>
              <th className="px-3 py-2">Total interest</th>
              <th className="px-3 py-2">Total paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((result, index) => (
              <tr key={index} className="odd:bg-white even:bg-slate-50">
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
