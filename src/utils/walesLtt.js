/**
 * Wales Land Transaction Tax (LTT) calculator for residential property.
 *
 * Pure calculation logic, decoupled from UI. Rates reflect those published
 * at https://www.gov.wales/land-transaction-tax-rates-and-bands at the time
 * this calculator was built — always check gov.wales for the current rates
 * before relying on this for a real transaction.
 *
 * Note: Wales does not offer a first-time buyer relief for LTT, and the
 * "higher residential rates" for additional properties use their own
 * distinct band thresholds (not a flat surcharge added to the main rates).
 */

import { BUYER_TYPES } from './lbtt'

// Main residential LTT bands (single property, incl. first-time buyers —
// there is no separate relief).
const STANDARD_BANDS = [
  { upTo: 225000, rate: 0 },
  { upTo: 400000, rate: 0.06 },
  { upTo: 750000, rate: 0.075 },
  { upTo: 1500000, rate: 0.1 },
  { upTo: Infinity, rate: 0.12 },
]

// Higher residential rates for additional properties/second homes — a
// separate band structure, not the standard bands plus a flat addition.
const HIGHER_RATE_BANDS = [
  { upTo: 180000, rate: 0.05 },
  { upTo: 250000, rate: 0.085 },
  { upTo: 400000, rate: 0.1 },
  { upTo: 750000, rate: 0.125 },
  { upTo: 1500000, rate: 0.15 },
  { upTo: Infinity, rate: 0.17 },
]

const HIGHER_RATE_THRESHOLD = 40000

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
 * Calculate LTT due for a residential purchase in Wales.
 *
 * @param {number} price - Purchase price in GBP.
 * @param {'standard'|'first-time-buyer'|'additional-property'} buyerType
 *   ('first-time-buyer' is treated identically to 'standard' — Wales has no
 *   first-time buyer relief for LTT.)
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
export function calculateWalesLTT(price, buyerType = BUYER_TYPES.STANDARD) {
  const safePrice = Math.max(0, price || 0)
  const adsApplies = buyerType === BUYER_TYPES.ADDITIONAL_PROPERTY && safePrice > HIGHER_RATE_THRESHOLD

  const standardBreakdown = calculateBandedTax(safePrice, STANDARD_BANDS)
  const standardTax = round2(standardBreakdown.reduce((sum, band) => sum + band.tax, 0))

  if (!adsApplies) {
    return {
      price: safePrice,
      buyerType,
      breakdown: standardBreakdown,
      standardTax,
      ads: 0,
      adsApplies: false,
      total: standardTax,
    }
  }

  const higherBreakdown = calculateBandedTax(safePrice, HIGHER_RATE_BANDS)
  const total = round2(higherBreakdown.reduce((sum, band) => sum + band.tax, 0))

  return {
    price: safePrice,
    buyerType,
    breakdown: higherBreakdown,
    standardTax,
    // The "supplement" implied by being charged the higher-rate bands
    // instead of the main rates, for display purposes.
    ads: round2(total - standardTax),
    adsApplies: true,
    total,
  }
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
