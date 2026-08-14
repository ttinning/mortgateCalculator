import { formatCurrency, formatMonthsAsYearsMonths } from '../utils/format'

/**
 * Summary card: monthly payment, total interest, total paid, payoff time.
 * The monthly payment is visually emphasized as the headline figure.
 */
export default function MortgageSummary({ monthlyPayment, totalInterest, totalPaid, payoffMonth }) {
  const secondaryStats = [
    { label: 'Total interest paid', value: formatCurrency(totalInterest) },
    { label: 'Total paid over term', value: formatCurrency(totalPaid) },
    { label: 'Payoff time', value: formatMonthsAsYearsMonths(payoffMonth) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 p-4 text-white shadow-sm sm:col-span-1">
        <div className="text-xs font-medium uppercase tracking-wide text-blue-100">Monthly payment</div>
        <div className="mt-1 text-2xl font-bold">{formatCurrency(monthlyPayment, { precise: true })}</div>
      </div>
      {secondaryStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700/70"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {stat.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
