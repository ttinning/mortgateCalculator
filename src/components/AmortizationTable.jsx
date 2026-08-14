import { useState } from 'react'
import { formatCurrency } from '../utils/format'
import { scheduleToCsv } from '../utils/csv'

function downloadCsv(schedule) {
  const csv = scheduleToCsv(schedule)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'amortization-schedule.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Scrollable amortization table. Renders the full monthly schedule but only
 * shows a limited number of rows at a time to keep long terms performant,
 * with a toggle to reveal the rest.
 */
export default function AmortizationTable({ schedule }) {
  const [showAll, setShowAll] = useState(false)
  const PREVIEW_ROWS = 12

  const rows = showAll ? schedule : schedule.slice(0, PREVIEW_ROWS)

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => downloadCsv(schedule)}
          disabled={schedule.length === 0}
          className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="max-h-96 overflow-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">Month</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Principal</th>
              <th className="px-3 py-2">Interest</th>
              <th className="px-3 py-2">Extra</th>
              <th className="px-3 py-2">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.month} className="odd:bg-white dark:odd:bg-slate-800 even:bg-slate-50 dark:even:bg-slate-900">
                <td className="px-3 py-1.5">{row.month}</td>
                <td className="px-3 py-1.5">{formatCurrency(row.payment, { precise: true })}</td>
                <td className="px-3 py-1.5">{formatCurrency(row.principalPaid, { precise: true })}</td>
                <td className="px-3 py-1.5">{formatCurrency(row.interestPaid, { precise: true })}</td>
                <td className="px-3 py-1.5">{formatCurrency(row.extraPaid, { precise: true })}</td>
                <td className="px-3 py-1.5">{formatCurrency(row.balance, { precise: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > PREVIEW_ROWS && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {showAll ? 'Show fewer rows' : `Show all ${schedule.length} payments`}
        </button>
      )}
    </div>
  )
}
