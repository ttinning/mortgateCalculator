import { useState } from 'react'
import { calculateInvestmentAlternative } from '../utils/investment'
import { formatCurrency } from '../utils/format'

/**
 * "What if I invested instead of overpaying?" comparison. Lets the user
 * enter an expected annual investment return and shows what the same
 * lump sum + recurring monthly amount would grow to over the same period,
 * next to the mortgage interest saved by overpaying instead.
 */
export default function InvestmentComparison({ lumpSum, monthlyContribution, months, interestSaved }) {
  const [annualReturnPercent, setAnnualReturnPercent] = useState(5)

  const investment = calculateInvestmentAlternative({
    lumpSum,
    monthlyContribution,
    months,
    annualReturnPercent: Number(annualReturnPercent) || 0,
  })

  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 ring-1 ring-amber-200 dark:ring-amber-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Overpaying vs. investing instead</h3>
        <label className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          Expected annual return (%)
          <input
            type="number"
            min="0"
            step="0.1"
            className="w-20 rounded-md border border-amber-300 dark:border-amber-700 px-2 py-1 text-sm focus:border-amber-500 dark:focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-500"
            value={annualReturnPercent}
            onChange={(e) => setAnnualReturnPercent(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
      </div>

      <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
        Investing that same money instead (over the {months} months you'd be overpaying) could grow to{' '}
        <strong>{formatCurrency(investment.futureValue)}</strong> ({formatCurrency(investment.growth)} in growth), compared
        to <strong>{formatCurrency(interestSaved)}</strong> saved in mortgage interest by overpaying.
      </p>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
        This is a simplified estimate — it ignores tax, fees, and investment risk/volatility. Mortgage interest
        savings are guaranteed; investment returns are not.
      </p>
    </div>
  )
}
