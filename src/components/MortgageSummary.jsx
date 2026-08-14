import { formatCurrency, formatMonthsAsYearsMonths } from '../utils/format'

/**
 * Summary card: monthly payment, total interest, total paid, payoff time.
 */
export default function MortgageSummary({ monthlyPayment, totalInterest, totalPaid, payoffMonth }) {
  const stats = [
    { label: 'Monthly payment', value: formatCurrency(monthlyPayment, { precise: true }) },
    { label: 'Total interest paid', value: formatCurrency(totalInterest) },
    { label: 'Total paid over term', value: formatCurrency(totalPaid) },
    { label: 'Payoff time', value: formatMonthsAsYearsMonths(payoffMonth) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
