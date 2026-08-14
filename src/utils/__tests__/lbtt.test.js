import { describe, it, expect } from 'vitest'
import { calculateLBTT, BUYER_TYPES, MAX_FIRST_TIME_BUYER_RELIEF } from '../lbtt'

describe('calculateLBTT — standard buyer', () => {
  it('charges nothing at or below the £145,000 nil-rate threshold', () => {
    const result = calculateLBTT(145000, BUYER_TYPES.STANDARD)
    expect(result.standardTax).toBe(0)
    expect(result.total).toBe(0)
  })

  it('charges 2% only on the portion just above £145,000', () => {
    const result = calculateLBTT(145001, BUYER_TYPES.STANDARD)
    expect(result.standardTax).toBeCloseTo(0.02, 2)
  })

  it('is exact at the £250,000 band boundary (2% band fully used)', () => {
    const result = calculateLBTT(250000, BUYER_TYPES.STANDARD)
    // (250000 - 145000) * 2% = 2100
    expect(result.standardTax).toBeCloseTo(2100, 2)
  })

  it('is exact at the £325,000 band boundary', () => {
    const result = calculateLBTT(325000, BUYER_TYPES.STANDARD)
    // 2100 + (325000-250000)*5% = 2100 + 3750 = 5850
    expect(result.standardTax).toBeCloseTo(5850, 2)
  })

  it('is exact at the £750,000 band boundary', () => {
    const result = calculateLBTT(750000, BUYER_TYPES.STANDARD)
    // 5850 + (750000-325000)*10% = 5850 + 42500 = 48350
    expect(result.standardTax).toBeCloseTo(48350, 2)
  })

  it('charges 12% on the portion above £750,000', () => {
    const result = calculateLBTT(800000, BUYER_TYPES.STANDARD)
    // 48350 + (800000-750000)*12% = 48350 + 6000 = 54350
    expect(result.standardTax).toBeCloseTo(54350, 2)
  })

  it('returns a per-band breakdown that sums to the standard tax', () => {
    const result = calculateLBTT(400000, BUYER_TYPES.STANDARD)
    const sum = result.breakdown.reduce((acc, band) => acc + band.tax, 0)
    expect(sum).toBeCloseTo(result.standardTax, 2)
    expect(result.breakdown.length).toBeGreaterThan(0)
  })

  it('does not apply ADS for a standard buyer', () => {
    const result = calculateLBTT(500000, BUYER_TYPES.STANDARD)
    expect(result.ads).toBe(0)
    expect(result.adsApplies).toBe(false)
  })
})

describe('calculateLBTT — first-time buyer', () => {
  it('charges nothing at or below the raised £175,000 nil-rate threshold', () => {
    const result = calculateLBTT(175000, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(result.standardTax).toBe(0)
  })

  it('charges 2% just above the £175,000 threshold', () => {
    const result = calculateLBTT(175001, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(result.standardTax).toBeCloseTo(0.02, 2)
  })

  it('gives the maximum £600 relief saving for prices at/above £175,000', () => {
    const price = 200000
    const standard = calculateLBTT(price, BUYER_TYPES.STANDARD)
    const ftb = calculateLBTT(price, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(standard.standardTax - ftb.standardTax).toBeCloseTo(MAX_FIRST_TIME_BUYER_RELIEF, 2)
  })

  it('gives a partial relief saving for a price below £175,000 but above £145,000', () => {
    const price = 160000
    const standard = calculateLBTT(price, BUYER_TYPES.STANDARD)
    const ftb = calculateLBTT(price, BUYER_TYPES.FIRST_TIME_BUYER)
    // Only the 145,001-160,000 portion (15,000 * 2% = 300) is saved.
    expect(standard.standardTax - ftb.standardTax).toBeCloseTo(300, 2)
    expect(ftb.standardTax).toBe(0)
  })

  it('matches the standard calculation above £175,000 (bands beyond relief unchanged)', () => {
    const price = 500000
    const standard = calculateLBTT(price, BUYER_TYPES.STANDARD)
    const ftb = calculateLBTT(price, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(standard.standardTax - ftb.standardTax).toBeCloseTo(MAX_FIRST_TIME_BUYER_RELIEF, 2)
  })
})

describe('calculateLBTT — additional dwelling supplement (ADS)', () => {
  it('does not apply ADS exactly at the £40,000 threshold', () => {
    const result = calculateLBTT(40000, BUYER_TYPES.ADDITIONAL_PROPERTY)
    expect(result.adsApplies).toBe(false)
    expect(result.ads).toBe(0)
  })

  it('applies ADS just above the £40,000 threshold', () => {
    const result = calculateLBTT(40001, BUYER_TYPES.ADDITIONAL_PROPERTY)
    expect(result.adsApplies).toBe(true)
    expect(result.ads).toBeCloseTo(40001 * 0.08, 2)
  })

  it('applies ADS as a flat 8% of the full price, on top of standard LBTT', () => {
    const price = 300000
    const result = calculateLBTT(price, BUYER_TYPES.ADDITIONAL_PROPERTY)
    const expectedAds = price * 0.08
    const expectedStandard = calculateLBTT(price, BUYER_TYPES.STANDARD).standardTax

    expect(result.ads).toBeCloseTo(expectedAds, 2)
    expect(result.standardTax).toBeCloseTo(expectedStandard, 2)
    expect(result.total).toBeCloseTo(expectedStandard + expectedAds, 2)
  })
})

describe('calculateLBTT — misc edge cases', () => {
  it('handles a zero or negative price gracefully', () => {
    expect(calculateLBTT(0, BUYER_TYPES.STANDARD).total).toBe(0)
    expect(calculateLBTT(-100, BUYER_TYPES.STANDARD).total).toBe(0)
  })
})
