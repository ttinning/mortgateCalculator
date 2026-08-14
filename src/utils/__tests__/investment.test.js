import { describe, it, expect } from 'vitest'
import { calculateInvestmentAlternative } from '../investment'

describe('calculateInvestmentAlternative', () => {
  it('returns zero growth when there are no contributions', () => {
    const result = calculateInvestmentAlternative({ months: 12, annualReturnPercent: 5 })
    expect(result.contributions).toBe(0)
    expect(result.growth).toBe(0)
  })

  it('returns zero growth over zero months', () => {
    const result = calculateInvestmentAlternative({ lumpSum: 1000, monthlyContribution: 50, months: 0, annualReturnPercent: 5 })
    expect(result.futureValue).toBe(1000)
    expect(result.growth).toBe(0)
  })

  it('matches simple contributions total at a 0% return rate', () => {
    const result = calculateInvestmentAlternative({
      lumpSum: 5000,
      monthlyContribution: 100,
      months: 24,
      annualReturnPercent: 0,
    })
    expect(result.contributions).toBe(5000 + 100 * 24)
    expect(result.futureValue).toBe(result.contributions)
    expect(result.growth).toBe(0)
  })

  it('produces positive growth with a positive return rate', () => {
    const result = calculateInvestmentAlternative({
      lumpSum: 5000,
      monthlyContribution: 200,
      months: 60,
      annualReturnPercent: 6,
    })
    expect(result.futureValue).toBeGreaterThan(result.contributions)
    expect(result.growth).toBeGreaterThan(0)
  })

  it('grows a lump sum only investment compounding monthly', () => {
    // £10,000 at 12%/yr (1%/month) for 12 months -> 10000 * 1.01^12
    const result = calculateInvestmentAlternative({ lumpSum: 10000, months: 12, annualReturnPercent: 12 })
    expect(result.futureValue).toBeCloseTo(10000 * Math.pow(1.01, 12), 1)
  })
})
