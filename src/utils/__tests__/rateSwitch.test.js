import { describe, expect, it } from 'vitest'
import { calculateMonthlyPayment } from '../amortization'
import { calculateRateSwitchSchedule } from '../rateSwitch'

describe('calculateRateSwitchSchedule', () => {
  it('uses the initial rate payment (amortized over the full term) during the deal period', () => {
    const result = calculateRateSwitchSchedule({
      principal: 200000,
      termYears: 25,
      initialRatePercent: 4,
      initialPeriodYears: 5,
      followOnRatePercent: 7,
    })

    const expectedInitialPayment = calculateMonthlyPayment(200000, 4, 25)
    expect(result.initialMonthlyPayment).toBeCloseTo(expectedInitialPayment, 2)
    expect(result.schedule.slice(0, 60).every((row) => row.phase === 'initial')).toBe(true)
  })

  it('recalculates a new (typically higher) payment over the remaining term once the deal ends', () => {
    const result = calculateRateSwitchSchedule({
      principal: 200000,
      termYears: 25,
      initialRatePercent: 4,
      initialPeriodYears: 5,
      followOnRatePercent: 7,
    })

    expect(result.followOnMonthlyPayment).toBeGreaterThan(result.initialMonthlyPayment)
    expect(result.monthlyPaymentChange).toBeCloseTo(
      result.followOnMonthlyPayment - result.initialMonthlyPayment,
      2,
    )
    expect(result.schedule.length).toBe(300)
    expect(result.schedule.slice(60).every((row) => row.phase === 'followOn')).toBe(true)
  })

  it('fully amortizes the balance to zero by the end of the term', () => {
    const result = calculateRateSwitchSchedule({
      principal: 200000,
      termYears: 25,
      initialRatePercent: 4,
      initialPeriodYears: 5,
      followOnRatePercent: 7,
    })

    const lastRow = result.schedule[result.schedule.length - 1]
    expect(lastRow.balance).toBe(0)
  })

  it('results in a lower payment if the follow-on rate is lower than the initial rate', () => {
    const result = calculateRateSwitchSchedule({
      principal: 150000,
      termYears: 20,
      initialRatePercent: 6,
      initialPeriodYears: 2,
      followOnRatePercent: 3,
    })

    expect(result.followOnMonthlyPayment).toBeLessThan(result.initialMonthlyPayment)
    expect(result.monthlyPaymentChange).toBeLessThan(0)
  })

  it('has no follow-on period when the initial deal covers the whole term', () => {
    const result = calculateRateSwitchSchedule({
      principal: 100000,
      termYears: 5,
      initialRatePercent: 4,
      initialPeriodYears: 5,
      followOnRatePercent: 8,
    })

    expect(result.followOnMonthlyPayment).toBe(0)
    expect(result.followOnTotalInterest).toBe(0)
    expect(result.schedule.every((row) => row.phase === 'initial')).toBe(true)
  })

  it('handles a zero/invalid principal gracefully', () => {
    const result = calculateRateSwitchSchedule({
      principal: 0,
      termYears: 25,
      initialRatePercent: 4,
      initialPeriodYears: 5,
      followOnRatePercent: 7,
    })

    expect(result.schedule).toEqual([])
    expect(result.totalInterest).toBe(0)
  })
})
