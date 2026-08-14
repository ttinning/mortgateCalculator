import { describe, it, expect } from 'vitest'
import { scheduleToCsv } from '../csv'

describe('scheduleToCsv', () => {
  it('includes a header row', () => {
    const csv = scheduleToCsv([])
    expect(csv).toBe('Month,Payment,Principal,Interest,Extra,Balance')
  })

  it('formats each schedule row as a comma-separated line', () => {
    const csv = scheduleToCsv([
      { month: 1, payment: 1169.18, principalPaid: 335.85, interestPaid: 833.33, extraPaid: 0, balance: 199664.15 },
    ])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('1,1169.18,335.85,833.33,0,199664.15')
  })

  it('handles multiple rows in order', () => {
    const csv = scheduleToCsv([
      { month: 1, payment: 100, principalPaid: 80, interestPaid: 20, extraPaid: 0, balance: 900 },
      { month: 2, payment: 100, principalPaid: 81, interestPaid: 19, extraPaid: 0, balance: 819 },
    ])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('1,100,80,20,0,900')
    expect(lines[2]).toBe('2,100,81,19,0,819')
  })
})
