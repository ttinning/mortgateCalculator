import { useState } from 'react'
import { addScenario, removeScenario } from '../utils/scenarios'
import { useLocalStorageState } from '../utils/useLocalStorageState'
import { formatCurrency } from '../utils/format'

/**
 * Lets the user save the current "Loan details" inputs under a name, then
 * browse and reload previously saved scenarios later. Unlike the fixed
 * 2-3 slot comparison tab, this is an open-ended, persisted list.
 */
export default function SavedScenarios({ currentValues, onLoad }) {
  const [scenarios, setScenarios] = useLocalStorageState('mortgage-calculator:saved-scenarios', [])
  const [name, setName] = useState('')

  const handleSave = () => {
    setScenarios((prev) => addScenario(prev, name, currentValues))
    setName('')
  }

  const handleDelete = (id) => {
    setScenarios((prev) => removeScenario(prev, id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Scenario name (e.g. First home, Remortgage 2027)"
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          className="shrink-0 rounded-md bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Save current inputs
        </button>
      </div>

      {scenarios.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No saved scenarios yet. Save your current loan details above to come back to them later.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
          {scenarios.map((scenario) => (
            <li key={scenario.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{scenario.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatCurrency(scenario.values.principal)} at {scenario.values.annualRatePercent}% over{' '}
                  {scenario.values.termYears} yrs
                  {' · '}
                  saved {new Date(scenario.savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onLoad(scenario.values)}
                  className="rounded-md border border-blue-300 dark:border-blue-700 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(scenario.id)}
                  className="rounded-md border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
