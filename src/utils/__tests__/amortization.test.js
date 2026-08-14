import { describe, it, expect } from 'vitest'
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateOverpaymentImpact,
} from '../amortization'

describe('calculateMonthlyPayment', () => {
  it('calculates the standard monthly payment for a typical loan', () => {
    // £200,000 at 5% over 25 years -> ~£1,169.18/month (standard formula)
    const payment = calculateMonthlyPayment(200000, 5, 25)
    expect(payment).toBeCloseTo(1169.18, 1)
  })

  it('handles a 0% interest rate as a simple principal / term split', () => {
    const payment = calculateMonthlyPayment(120000, 0, 10)
    expect(payment).toBeCloseTo(120000 / 120, 6)
  })

  it('returns 0 for a non-positive principal or term', () => {
    expect(calculateMonthlyPayment(0, 5, 25)).toBe(0)
    expect(calculateMonthlyPayment(200000, 5, 0)).toBe(0)
  })
})

describe('generateAmortizationSchedule', () => {
  it('fully amortizes a standard loan to a zero balance by the final month', () => {
    const { schedule, payoffMonth } = generateAmortizationSchedule({
      principal: 200000,
      annualRatePercent: 5,
      termYears: 25,
    })

    expect(payoffMonth).toBe(300) // 25 years * 12
    expect(schedule).toHaveLength(300)
    expect(schedule[schedule.length - 1].balance).toBe(0)
  })

  it('produces an unchanged schedule when overpayment is zero', () => {
    const base = generateAmortizationSchedule({ principal: 150000, annualRatePercent: 4, termYears: 20 })
    const zeroOverpayment = generateAmortizationSchedule({
      principal: 150000,
      annualRatePercent: 4,
      termYears: 20,
      extraMonthly: 0,
      lumpSum: 0,
    })

    expect(zeroOverpayment.payoffMonth).toBe(base.payoffMonth)
    expect(zeroOverpayment.totalInterest).toBe(base.totalInterest)
    expect(zeroOverpayment.schedule).toEqual(base.schedule)
  })

  it('pays the loan off early when a recurring monthly overpayment is applied', () => {
    const { payoffMonth, schedule } = generateAmortizationSchedule({
      principal: 150000,
      annualRatePercent: 4,
      termYears: 20,
      extraMonthly: 500,
    })

    expect(payoffMonth).toBeLessThan(240) // 20 years * 12
    expect(schedule[schedule.length - 1].balance).toBe(0)
  })

  it('pays the loan off early when a one-off lump sum is applied', () => {
    const base = generateAmortizationSchedule({ principal: 150000, annualRatePercent: 4, termYears: 20 })
    const withLumpSum = generateAmortizationSchedule({
      principal: 150000,
      annualRatePercent: 4,
      termYears: 20,
      lumpSum: 20000,
      lumpSumMonth: 1,
    })

    expect(withLumpSum.payoffMonth).toBeLessThan(base.payoffMonth)
    expect(withLumpSum.totalInterest).toBeLessThan(base.totalInterest)
  })

  it('never overpays past the remaining balance on the final payment', () => {
    const { schedule } = generateAmortizationSchedule({
      principal: 10000,
      annualRatePercent: 3,
      termYears: 1,
      extraMonthly: 2000, // large enough to pay off well before term end
    })

    const balances = schedule.map((row) => row.balance)
    expect(balances.every((balance) => balance >= 0)).toBe(true)
    expect(schedule[schedule.length - 1].balance).toBe(0)
  })
})

describe('calculateOverpaymentImpact', () => {
  it('reports zero months/interest saved when there is no overpayment', () => {
    const result = calculateOverpaymentImpact({
      principal: 180000,
      annualRatePercent: 4.5,
      termYears: 25,
    })

    expect(result.monthsSaved).toBe(0)
    expect(result.interestSaved).toBe(0)
  })

  it('reports positive months and interest saved with a recurring overpayment', () => {
    const result = calculateOverpaymentImpact({
      principal: 180000,
      annualRatePercent: 4.5,
      termYears: 25,
      extraMonthly: 300,
    })

    expect(result.monthsSaved).toBeGreaterThan(0)
    expect(result.interestSaved).toBeGreaterThan(0)
  })

  it('reports positive months and interest saved with a lump sum overpayment', () => {
    const result = calculateOverpaymentImpact({
      principal: 180000,
      annualRatePercent: 4.5,
      termYears: 25,
      lumpSum: 15000,
      lumpSumMonth: 6,
    })

    expect(result.monthsSaved).toBeGreaterThan(0)
    expect(result.interestSaved).toBeGreaterThan(0)
  })
})
