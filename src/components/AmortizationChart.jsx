import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/format'

/**
 * Aggregates a monthly amortization schedule into yearly principal/interest
 * totals so the chart stays readable over long terms.
 */
function toYearlyData(schedule) {
  const years = new Map()

  for (const row of schedule) {
    const year = Math.ceil(row.month / 12)
    const existing = years.get(year) || { year, principal: 0, interest: 0, balance: row.balance }
    existing.principal += row.principalPaid + row.extraPaid
    existing.interest += row.interestPaid
    existing.balance = row.balance
    years.set(year, existing)
  }

  return Array.from(years.values())
}

export default function AmortizationChart({ schedule }) {
  const data = toYearlyData(schedule)

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No schedule data to chart.</p>
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -4 }} />
          <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} />
          <Tooltip formatter={(value) => formatCurrency(value, { precise: true })} labelFormatter={(year) => `Year ${year}`} />
          <Legend />
          <Area type="monotone" dataKey="principal" stackId="1" name="Principal" stroke="#2563eb" fill="#93c5fd" />
          <Area type="monotone" dataKey="interest" stackId="1" name="Interest" stroke="#dc2626" fill="#fca5a5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
