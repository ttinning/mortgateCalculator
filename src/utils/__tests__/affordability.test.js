import { describe, expect, it } from 'vitest'
import { calculateAffordability } from '../affordability'

describe('calculateAffordability', () => {
  it('caps the loan at the income multiple when affordability headroom is generous', () => {
    const result = calculateAffordability({
      annualIncome: 60000,
      monthlyDebts: 0,
      deposit: 20000,
      interestRate: 4,
      termYears: 30,
      incomeMultiple: 4.5,
      stressMarginPercent: 3,
      maxDti: 0.45,
    })

    expect(result.maxLoanByIncomeMultiple).toBeCloseTo(270000, 2)
    // Affordability headroom (45% of £5,000/mo stress-tested at 7%) comfortably exceeds 4.5x income.
    expect(result.limitingFactor).toBe('incomeMultiple')
    expect(result.recommendedMaxLoan).toBeCloseTo(270000, 2)
    expect(result.maxPropertyPrice).toBeCloseTo(290000, 2)
  })

  it('caps the loan at the stress-tested affordability limit when income multiple is generous', () => {
    const result = calculateAffordability({
      annualIncome: 40000,
      monthlyDebts: 800,
      deposit: 10000,
      interestRate: 5,
      termYears: 25,
      incomeMultiple: 6,
      stressMarginPercent: 3,
      maxDti: 0.45,
    })

    expect(result.limitingFactor).toBe('affordability')
    expect(result.recommendedMaxLoan).toBeLessThan(result.maxLoanByIncomeMultiple)
    expect(result.recommendedMaxLoan).toBeGreaterThan(0)
  })

  it('reduces the affordability cap as existing monthly debts increase', () => {
    const base = calculateAffordability({
      annualIncome: 45000,
      monthlyDebts: 0,
      deposit: 0,
      interestRate: 5,
      termYears: 25,
    })
    const withDebts = calculateAffordability({
      annualIncome: 45000,
      monthlyDebts: 500,
      deposit: 0,
      interestRate: 5,
      termYears: 25,
    })

    expect(withDebts.maxLoanByAffordability).toBeLessThan(base.maxLoanByAffordability)
  })

  it('returns zero affordability loan when debts exceed the max payment share', () => {
    const result = calculateAffordability({
      annualIncome: 20000,
      monthlyDebts: 5000,
      deposit: 5000,
      interestRate: 5,
      termYears: 25,
    })

    expect(result.maxMonthlyPayment).toBe(0)
    expect(result.maxLoanByAffordability).toBe(0)
    expect(result.recommendedMaxLoan).toBe(0)
    expect(result.maxPropertyPrice).toBe(5000)
  })

  it('handles zero income gracefully without throwing', () => {
    const result = calculateAffordability({
      annualIncome: 0,
      interestRate: 5,
      termYears: 25,
    })

    expect(result.maxLoanByIncomeMultiple).toBe(0)
    expect(result.recommendedMaxLoan).toBe(0)
  })

  it('computes an estimated monthly payment consistent with standard amortization', () => {
    const result = calculateAffordability({
      annualIncome: 50000,
      deposit: 0,
      interestRate: 5,
      termYears: 25,
      incomeMultiple: 4,
    })

    // Recommended loan is capped by 4x income = 200,000 in this generous scenario.
    expect(result.recommendedMaxLoan).toBeCloseTo(200000, 2)
    expect(result.estimatedMonthlyPayment).toBeGreaterThan(0)
    expect(result.estimatedMonthlyPaymentStressed).toBeGreaterThan(result.estimatedMonthlyPayment)
  })
})
