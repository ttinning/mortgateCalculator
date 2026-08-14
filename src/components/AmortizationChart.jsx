import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/format'
import { useDarkMode } from '../utils/useDarkMode'

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
  const [isDark] = useDarkMode()
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const tickColor = isDark ? '#94a3b8' : '#475569'

  if (data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No schedule data to chart.</p>
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: tickColor }}
            tick={{ fill: tickColor }}
          />
          <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} tick={{ fill: tickColor }} />
          <Tooltip
            formatter={(value) => formatCurrency(value, { precise: true })}
            labelFormatter={(year) => `Year ${year}`}
            contentStyle={
              isDark ? { backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' } : undefined
            }
          />
          <Legend />
          <Area type="monotone" dataKey="principal" stackId="1" name="Principal" stroke="#2563eb" fill="#93c5fd" />
          <Area type="monotone" dataKey="interest" stackId="1" name="Interest" stroke="#dc2626" fill="#fca5a5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
