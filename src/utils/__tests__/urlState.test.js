import { describe, it, expect } from 'vitest'
import { encodeLoanParams, decodeLoanParams } from '../urlState'

describe('encodeLoanParams', () => {
  it('encodes all recognised loan fields into short query keys', () => {
    const query = encodeLoanParams({
      principal: 200000,
      annualRatePercent: 5,
      termYears: 25,
      extraMonthly: 100,
      lumpSum: 5000,
      lumpSumMonth: 3,
    })
    const params = new URLSearchParams(query)
    expect(params.get('p')).toBe('200000')
    expect(params.get('r')).toBe('5')
    expect(params.get('t')).toBe('25')
    expect(params.get('em')).toBe('100')
    expect(params.get('ls')).toBe('5000')
    expect(params.get('lsm')).toBe('3')
  })

  it('omits fields that are missing or empty', () => {
    const query = encodeLoanParams({ principal: 200000, annualRatePercent: '' })
    const params = new URLSearchParams(query)
    expect(params.get('p')).toBe('200000')
    expect(params.has('r')).toBe(false)
  })
})

describe('decodeLoanParams', () => {
  it('decodes a query string back into a loan values object', () => {
    const values = decodeLoanParams('p=200000&r=5&t=25&em=100&ls=5000&lsm=3')
    expect(values).toEqual({
      principal: 200000,
      annualRatePercent: 5,
      termYears: 25,
      extraMonthly: 100,
      lumpSum: 5000,
      lumpSumMonth: 3,
    })
  })

  it('accepts a URLSearchParams instance directly', () => {
    const params = new URLSearchParams('p=150000&t=20')
    const values = decodeLoanParams(params)
    expect(values).toEqual({ principal: 150000, termYears: 20 })
  })

  it('returns null when no recognised keys are present', () => {
    expect(decodeLoanParams('foo=bar')).toBeNull()
    expect(decodeLoanParams('')).toBeNull()
  })

  it('ignores non-numeric values for recognised keys', () => {
    const values = decodeLoanParams('p=abc&t=25')
    expect(values).toEqual({ termYears: 25 })
  })

  it('round-trips encode -> decode', () => {
    const original = { principal: 180000, annualRatePercent: 4.5, termYears: 30 }
    const decoded = decodeLoanParams(encodeLoanParams(original))
    expect(decoded).toEqual(original)
  })
})
