import { describe, it, expect } from 'vitest'
import { calculateWalesLTT } from '../walesLtt'
import { BUYER_TYPES } from '../lbtt'

describe('calculateWalesLTT — standard buyer', () => {
  it('charges nothing at or below the £225,000 nil-rate threshold', () => {
    expect(calculateWalesLTT(225000, BUYER_TYPES.STANDARD).standardTax).toBe(0)
  })

  it('is exact at the £400,000 band boundary', () => {
    // (400000-225000)*6% = 10500
    expect(calculateWalesLTT(400000, BUYER_TYPES.STANDARD).standardTax).toBeCloseTo(10500, 2)
  })

  it('is exact at the £750,000 band boundary', () => {
    // 10500 + (750000-400000)*7.5% = 10500 + 26250 = 36750
    expect(calculateWalesLTT(750000, BUYER_TYPES.STANDARD).standardTax).toBeCloseTo(36750, 2)
  })

  it('charges 12% above £1,500,000', () => {
    const result = calculateWalesLTT(1600000, BUYER_TYPES.STANDARD)
    // 36750 + (1500000-750000)*10% + (1600000-1500000)*12% = 36750+75000+12000 = 123750
    expect(result.standardTax).toBeCloseTo(123750, 2)
  })
})

describe('calculateWalesLTT — first-time buyer (no relief)', () => {
  it('is identical to the standard calculation (Wales has no LTT first-time buyer relief)', () => {
    const price = 260000
    const standard = calculateWalesLTT(price, BUYER_TYPES.STANDARD)
    const ftb = calculateWalesLTT(price, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(ftb.standardTax).toBe(standard.standardTax)
    expect(ftb.total).toBe(standard.total)
  })
})

describe('calculateWalesLTT — higher rates for additional property', () => {
  it('does not apply higher rates at/below the £40,000 threshold', () => {
    const result = calculateWalesLTT(40000, BUYER_TYPES.ADDITIONAL_PROPERTY)
    expect(result.adsApplies).toBe(false)
    expect(result.total).toBe(result.standardTax)
  })

  it('applies the higher-rate bands (own thresholds, not standard + flat %) above £40,000', () => {
    const result = calculateWalesLTT(200000, BUYER_TYPES.ADDITIONAL_PROPERTY)
    // 180000*5% + (200000-180000)*8.5% = 9000 + 1700 = 10700
    expect(result.total).toBeCloseTo(10700, 2)
    expect(result.adsApplies).toBe(true)
  })

  it('always charges more under higher rates than standard rates for the same price', () => {
    const price = 500000
    const result = calculateWalesLTT(price, BUYER_TYPES.ADDITIONAL_PROPERTY)
    expect(result.total).toBeGreaterThan(result.standardTax)
  })
})
