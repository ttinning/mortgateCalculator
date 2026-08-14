import { formatCurrency, formatMonthsAsYearsMonths } from '../utils/format'

/**
 * Shows the time and interest saved from an overpayment scenario compared to
 * the base (no-overpayment) schedule.
 */
export default function OverpaymentSavings({ monthsSaved, interestSaved }) {
  const hasSavings = monthsSaved > 0 || interestSaved > 0

  return (
    <div className="rounded-lg bg-green-50 p-4 ring-1 ring-green-200">
      <h3 className="text-sm font-semibold text-green-900">Overpayment impact</h3>
      {hasSavings ? (
        <p className="mt-1 text-sm text-green-800">
          Paying off <strong>{formatMonthsAsYearsMonths(monthsSaved)}</strong> early and saving{' '}
          <strong>{formatCurrency(interestSaved)}</strong> in interest.
        </p>
      ) : (
        <p className="mt-1 text-sm text-green-800">
          Add a recurring overpayment or lump sum above to see how much time and interest you could save.
        </p>
      )}
    </div>
  )
}
