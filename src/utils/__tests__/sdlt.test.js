import { describe, it, expect } from 'vitest'
import { calculateSDLT } from '../sdlt'
import { BUYER_TYPES } from '../lbtt'

describe('calculateSDLT — standard buyer', () => {
  it('charges nothing at or below the £125,000 nil-rate threshold', () => {
    expect(calculateSDLT(125000, BUYER_TYPES.STANDARD).standardTax).toBe(0)
  })

  it('matches the official gov.uk worked example for £295,000', () => {
    // 0% on first £125,000 + 2% on next £125,000 (£2,500) + 5% on final £45,000 (£2,250) = £4,750
    const result = calculateSDLT(295000, BUYER_TYPES.STANDARD)
    expect(result.standardTax).toBeCloseTo(4750, 2)
  })

  it('is exact at the £250,000 and £925,000 band boundaries', () => {
    // (250000-125000)*2% = 2500
    expect(calculateSDLT(250000, BUYER_TYPES.STANDARD).standardTax).toBeCloseTo(2500, 2)
    // 2500 + (925000-250000)*5% = 2500 + 33750 = 36250
    expect(calculateSDLT(925000, BUYER_TYPES.STANDARD).standardTax).toBeCloseTo(36250, 2)
  })

  it('does not apply the additional-property surcharge', () => {
    const result = calculateSDLT(400000, BUYER_TYPES.STANDARD)
    expect(result.ads).toBe(0)
    expect(result.adsApplies).toBe(false)
  })
})

describe('calculateSDLT — first-time buyer', () => {
  it('charges nothing up to £300,000', () => {
    expect(calculateSDLT(300000, BUYER_TYPES.FIRST_TIME_BUYER).standardTax).toBe(0)
  })

  it('matches the official gov.uk worked example for £500,000', () => {
    // 0% on first £300,000 + 5% on remaining £200,000 = £10,000
    const result = calculateSDLT(500000, BUYER_TYPES.FIRST_TIME_BUYER)
    expect(result.standardTax).toBeCloseTo(10000, 2)
  })

  it('loses relief entirely above £500,000 and falls back to standard bands', () => {
    const ftb = calculateSDLT(500001, BUYER_TYPES.FIRST_TIME_BUYER)
    const standard = calculateSDLT(500001, BUYER_TYPES.STANDARD)
    expect(ftb.standardTax).toBeCloseTo(standard.standardTax, 2)
  })
})

describe('calculateSDLT — additional property surcharge', () => {
  it('does not apply the surcharge at/below the £40,000 threshold', () => {
    const result = calculateSDLT(40000, BUYER_TYPES.ADDITIONAL_PROPERTY)
    expect(result.adsApplies).toBe(false)
    expect(result.ads).toBe(0)
  })

  it('applies a flat 5 percentage point surcharge on every band above £40,000', () => {
    const price = 300000
    const additional = calculateSDLT(price, BUYER_TYPES.ADDITIONAL_PROPERTY)
    const standard = calculateSDLT(price, BUYER_TYPES.STANDARD)

    expect(additional.adsApplies).toBe(true)
    // Surcharge = 5% of the full price since it's added to every band.
    expect(additional.ads).toBeCloseTo(price * 0.05, 2)
    expect(additional.standardTax).toBeCloseTo(standard.standardTax, 2)
    expect(additional.total).toBeCloseTo(standard.standardTax + price * 0.05, 2)
  })
})
