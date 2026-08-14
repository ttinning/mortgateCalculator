import { calculateLBTT, BUYER_TYPES } from '../utils/lbtt'
import { formatCurrency } from '../utils/format'
import { useLocalStorageState } from '../utils/useLocalStorageState'

const BUYER_TYPE_LABELS = {
  [BUYER_TYPES.STANDARD]: 'Standard buyer',
  [BUYER_TYPES.FIRST_TIME_BUYER]: 'First-time buyer',
  [BUYER_TYPES.ADDITIONAL_PROPERTY]: 'Additional property (buy-to-let / second home)',
}

export default function LBTTCalculator() {
  const [price, setPrice] = useLocalStorageState('mortgage-calculator:lbtt-price', 250000)
  const [buyerType, setBuyerType] = useLocalStorageState('mortgage-calculator:lbtt-buyer-type', BUYER_TYPES.STANDARD)

  const result = calculateLBTT(Number(price) || 0, buyerType)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="lbtt-price">
            Property price (£)
          </label>
          <input
            id="lbtt-price"
            type="number"
            min="0"
            step="1000"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="lbtt-buyer-type">
            Buyer type
          </label>
          <select
            id="lbtt-buyer-type"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={buyerType}
            onChange={(e) => setBuyerType(e.target.value)}
          >
            {Object.entries(BUYER_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Standard LBTT</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(result.standardTax, { precise: true })}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Additional Dwelling Supplement
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(result.ads, { precise: true })}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm ring-1 ring-blue-200">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Total tax due</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">{formatCurrency(result.total, { precise: true })}</div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Band-by-band breakdown</h3>
        <div className="overflow-auto rounded-lg ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-3 py-2">Band</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Taxable amount</th>
                <th className="px-3 py-2">Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.breakdown.map((band, index) => (
                <tr key={index} className="odd:bg-white even:bg-slate-50">
                  <td className="px-3 py-1.5">
                    {formatCurrency(band.from)} – {band.to === null ? 'and above' : formatCurrency(band.to)}
                  </td>
                  <td className="px-3 py-1.5">{(band.rate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-1.5">{formatCurrency(band.taxableAmount, { precise: true })}</td>
                  <td className="px-3 py-1.5">{formatCurrency(band.tax, { precise: true })}</td>
                </tr>
              ))}
              {result.adsApplies && (
                <tr className="bg-blue-50 font-medium">
                  <td className="px-3 py-1.5" colSpan={2}>
                    ADS (flat 8% of full price)
                  </td>
                  <td className="px-3 py-1.5">{formatCurrency(result.price, { precise: true })}</td>
                  <td className="px-3 py-1.5">{formatCurrency(result.ads, { precise: true })}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
