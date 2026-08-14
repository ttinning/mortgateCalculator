/**
 * England & Northern Ireland Stamp Duty Land Tax (SDLT) calculator for
 * residential property.
 *
 * Pure calculation logic, decoupled from UI. Rates reflect those published
 * at https://www.gov.uk/stamp-duty-land-tax/residential-property-rates at
 * the time this calculator was built — always check gov.uk for the current
 * rates before relying on this for a real transaction.
 */

import { BUYER_TYPES } from './lbtt'

// Standard residential SDLT bands (single property).
const STANDARD_BANDS = [
  { upTo: 125000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 925000, rate: 0.05 },
  { upTo: 1500000, rate: 0.1 },
  { upTo: Infinity, rate: 0.12 },
]

// First-time buyer relief only applies while the price is at/below £500,000;
// above that, standard rates apply from £0 instead.
const FIRST_TIME_BUYER_BANDS = [
  { upTo: 300000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
]
const FIRST_TIME_BUYER_PRICE_CAP = 500000

// Higher rates for additional properties add a flat 5 percentage points to
// every standard band's rate (not a single flat charge on the full price).
const ADDITIONAL_PROPERTY_SURCHARGE_RATE = 0.05
const ADDITIONAL_PROPERTY_THRESHOLD = 40000

function calculateBandedTax(price, bands, surchargeRate = 0) {
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
        surchargeRate,
        taxableAmount: round2(taxableAmount),
        tax: round2(taxableAmount * band.rate),
        surchargeTax: round2(taxableAmount * surchargeRate),
      })
      remaining -= taxableAmount
    }

    lowerBound = band.upTo
  }

  return breakdown
}

/**
 * Calculate SDLT due for a residential purchase in England or Northern
 * Ireland.
 *
 * @param {number} price - Purchase price in GBP.
 * @param {'standard'|'first-time-buyer'|'additional-property'} buyerType
 * @returns {{
 *   price: number,
 *   buyerType: string,
 *   breakdown: Array<{from:number, to:number|null, rate:number, surchargeRate:number, taxableAmount:number, tax:number, surchargeTax:number}>,
 *   standardTax: number,
 *   ads: number,
 *   adsApplies: boolean,
 *   total: number
 * }}
 */
export function calculateSDLT(price, buyerType = BUYER_TYPES.STANDARD) {
  const safePrice = Math.max(0, price || 0)

  const usesFirstTimeBuyerRelief = buyerType === BUYER_TYPES.FIRST_TIME_BUYER && safePrice <= FIRST_TIME_BUYER_PRICE_CAP
  const bands = usesFirstTimeBuyerRelief ? FIRST_TIME_BUYER_BANDS : STANDARD_BANDS

  const adsApplies = buyerType === BUYER_TYPES.ADDITIONAL_PROPERTY && safePrice > ADDITIONAL_PROPERTY_THRESHOLD
  const surchargeRate = adsApplies ? ADDITIONAL_PROPERTY_SURCHARGE_RATE : 0

  const breakdown = calculateBandedTax(safePrice, bands, surchargeRate)
  const standardTax = round2(breakdown.reduce((sum, band) => sum + band.tax, 0))
  const ads = round2(breakdown.reduce((sum, band) => sum + band.surchargeTax, 0))

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
