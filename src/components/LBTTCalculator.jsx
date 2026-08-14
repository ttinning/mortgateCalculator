import { useEffect } from 'react'
import { calculateLBTT, BUYER_TYPES } from '../utils/lbtt'
import { calculateSDLT } from '../utils/sdlt'
import { calculateWalesLTT } from '../utils/walesLtt'
import { formatCurrency } from '../utils/format'
import { useLocalStorageState } from '../utils/useLocalStorageState'
import { validateField, FIELD_LIMITS } from '../utils/validation'

const BUYER_TYPE_LABELS = {
  [BUYER_TYPES.STANDARD]: 'Standard buyer',
  [BUYER_TYPES.FIRST_TIME_BUYER]: 'First-time buyer',
  [BUYER_TYPES.ADDITIONAL_PROPERTY]: 'Additional property (buy-to-let / second home)',
}

// Region configuration: which pure calculator to call, which buyer types
// are supported (Wales has no first-time buyer relief), and labelling for
// the "supplement" figure (ADS in Scotland, surcharge in England/NI, higher
// rates in Wales).
const REGIONS = {
  scotland: {
    label: 'Scotland (LBTT)',
    calculate: calculateLBTT,
    standardLabel: 'Standard LBTT',
    supplementLabel: 'Additional Dwelling Supplement (ADS)',
    buyerTypes: [BUYER_TYPES.STANDARD, BUYER_TYPES.FIRST_TIME_BUYER, BUYER_TYPES.ADDITIONAL_PROPERTY],
    officialUrl: 'https://revenue.scot',
    officialLabel: 'revenue.scot',
  },
  england: {
    label: 'England & Northern Ireland (SDLT)',
    calculate: calculateSDLT,
    standardLabel: 'Standard SDLT',
    supplementLabel: 'Additional property surcharge',
    buyerTypes: [BUYER_TYPES.STANDARD, BUYER_TYPES.FIRST_TIME_BUYER, BUYER_TYPES.ADDITIONAL_PROPERTY],
    officialUrl: 'https://www.gov.uk/stamp-duty-land-tax',
    officialLabel: 'gov.uk',
  },
  wales: {
    label: 'Wales (LTT)',
    calculate: calculateWalesLTT,
    standardLabel: 'Standard LTT',
    supplementLabel: 'Higher residential rates supplement',
    buyerTypes: [BUYER_TYPES.STANDARD, BUYER_TYPES.ADDITIONAL_PROPERTY],
    officialUrl: 'https://www.gov.wales/land-transaction-tax-rates-and-bands',
    officialLabel: 'gov.wales',
  },
}

export default function LBTTCalculator() {
  const [region, setRegion] = useLocalStorageState('mortgage-calculator:tax-region', 'scotland')
  const [price, setPrice] = useLocalStorageState('mortgage-calculator:lbtt-price', 250000)
  const [buyerType, setBuyerType] = useLocalStorageState('mortgage-calculator:lbtt-buyer-type', BUYER_TYPES.STANDARD)

  const config = REGIONS[region] ?? REGIONS.scotland

  // If switching region drops support for the currently selected buyer type
  // (e.g. Wales has no first-time buyer relief), fall back to standard.
  useEffect(() => {
    if (!config.buyerTypes.includes(buyerType)) {
      setBuyerType(BUYER_TYPES.STANDARD)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region])

  const priceError = validateField(price, FIELD_LIMITS.price)
  const result = config.calculate(Number(price) || 0, buyerType)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="tax-region">
            Region
          </label>
          <select
            id="tax-region"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {Object.entries(REGIONS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="lbtt-price">
            Property price (£)
          </label>
          <input
            id="lbtt-price"
            type="number"
            min="0"
            step="1000"
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              priceError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            aria-invalid={Boolean(priceError)}
          />
          {priceError && <p className="mt-1 text-xs text-red-600">{priceError}</p>}
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
            {config.buyerTypes.map((value) => (
              <option key={value} value={value}>
                {BUYER_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{config.standardLabel}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(result.standardTax, { precise: true })}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{config.supplementLabel}</div>
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
              {result.breakdown.map((band, index) => {
                const effectiveRate = band.rate + (band.surchargeRate || 0)
                const bandTax = band.tax + (band.surchargeTax || 0)
                return (
                  <tr key={index} className="odd:bg-white even:bg-slate-50">
                    <td className="px-3 py-1.5">
                      {formatCurrency(band.from)} – {band.to === null ? 'and above' : formatCurrency(band.to)}
                    </td>
                    <td className="px-3 py-1.5">{(effectiveRate * 100).toFixed(1).replace(/\.0$/, '')}%</td>
                    <td className="px-3 py-1.5">{formatCurrency(band.taxableAmount, { precise: true })}</td>
                    <td className="px-3 py-1.5">{formatCurrency(bandTax, { precise: true })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {result.adsApplies && (
          <p className="mt-2 text-xs text-slate-500">
            Includes {config.supplementLabel.toLowerCase()} of {formatCurrency(result.ads, { precise: true })}.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Rates shown are for guidance only and may change. Always check{' '}
        <a className="underline" href={config.officialUrl} target="_blank" rel="noreferrer">
          {config.officialLabel}
        </a>{' '}
        for the current rates before relying on this for a real transaction.
      </p>
    </div>
  )
}
