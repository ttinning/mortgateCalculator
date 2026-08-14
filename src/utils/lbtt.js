/**
 * Scotland Land and Buildings Transaction Tax (LBTT) calculator.
 *
 * Pure calculation logic, decoupled from UI, so the bands can be updated in
 * one place if the Scottish Budget changes them and so the UI can render a
 * full band-by-band breakdown (not just a single total).
 *
 * IMPORTANT: The bands/rates below reflect the rates supplied at the time
 * this calculator was built. Always check https://revenue.scot for the
 * current rates before relying on this for a real transaction.
 */

export const BUYER_TYPES = {
  STANDARD: 'standard',
  FIRST_TIME_BUYER: 'first-time-buyer',
  ADDITIONAL_PROPERTY: 'additional-property',
}

// Standard residential LBTT bands.
const STANDARD_BANDS = [
  { upTo: 145000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 325000, rate: 0.05 },
  { upTo: 750000, rate: 0.1 },
  { upTo: Infinity, rate: 0.12 },
]

// First-time buyer relief raises the nil-rate band from £145,000 to
// £175,000; every band above that is unchanged. This naturally caps the
// relief saving at £600 (the extra £30,000 of 0%-band at the 2% rate it
// would otherwise have attracted).
const FIRST_TIME_BUYER_BANDS = [
  { upTo: 175000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 325000, rate: 0.05 },
  { upTo: 750000, rate: 0.1 },
  { upTo: Infinity, rate: 0.12 },
]

const ADS_RATE = 0.08
const ADS_THRESHOLD = 40000
export const MAX_FIRST_TIME_BUYER_RELIEF = 600

/**
 * Apply a set of ascending bands to a price and return the per-band
 * breakdown of taxable amount and tax due.
 *
 * @param {number} price
 * @param {Array<{upTo:number, rate:number}>} bands
 * @returns {Array<{from:number, to:number|null, rate:number, taxableAmount:number, tax:number}>}
 */
function calculateBandedTax(price, bands) {
  const breakdown = []
  let remaining = price
  let lowerBound = 0

  for (const band of bands) {
    if (remaining <= 0) break

    const bandWidth = band.upTo - lowerBound
    const taxableAmount = Math.min(remaining, bandWidth)

    if (taxableAmount > 0) {
      breakdown.push({
        from: lowerBound,
        to: band.upTo === Infinity ? null : band.upTo,
        rate: band.rate,
        taxableAmount: round2(taxableAmount),
        tax: round2(taxableAmount * band.rate),
      })
      remaining -= taxableAmount
    }

    lowerBound = band.upTo
  }

  return breakdown
}

/**
 * Calculate LBTT due for a residential purchase in Scotland.
 *
 * @param {number} price - Purchase price in GBP.
 * @param {'standard'|'first-time-buyer'|'additional-property'} buyerType
 * @returns {{
 *   price: number,
 *   buyerType: string,
 *   breakdown: Array<{from:number, to:number|null, rate:number, taxableAmount:number, tax:number}>,
 *   standardTax: number,
 *   ads: number,
 *   adsApplies: boolean,
 *   total: number
 * }}
 */
export function calculateLBTT(price, buyerType = BUYER_TYPES.STANDARD) {
  const safePrice = Math.max(0, price || 0)
  const bands = buyerType === BUYER_TYPES.FIRST_TIME_BUYER ? FIRST_TIME_BUYER_BANDS : STANDARD_BANDS

  const breakdown = calculateBandedTax(safePrice, bands)
  const standardTax = round2(breakdown.reduce((sum, band) => sum + band.tax, 0))

  // ADS is a flat rate on the FULL price (not banded), applying only to
  // additional-property purchases over the £40,000 threshold.
  const adsApplies = buyerType === BUYER_TYPES.ADDITIONAL_PROPERTY && safePrice > ADS_THRESHOLD
  const ads = adsApplies ? round2(safePrice * ADS_RATE) : 0

  return {
    price: safePrice,
    buyerType,
    breakdown,
    standardTax,
    ads,
    adsApplies,
    total: round2(standardTax + ads),
  }
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
