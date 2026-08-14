import { describe, it, expect } from 'vitest'
import { validateField, validateLoanInputs, hasNoErrors, clamp, FIELD_LIMITS } from '../validation'

describe('validateField', () => {
  it('rejects an empty value', () => {
    expect(validateField('', FIELD_LIMITS.principal)).toMatch(/required/i)
  })

  it('rejects a non-numeric value', () => {
    expect(validateField('abc', FIELD_LIMITS.principal)).toMatch(/number/i)
  })

  it('rejects a value below the minimum', () => {
    expect(validateField(0, FIELD_LIMITS.principal)).toMatch(/at least/i)
  })

  it('rejects a value above the maximum', () => {
    expect(validateField(50_000_000, FIELD_LIMITS.principal)).toMatch(/at most/i)
  })

  it('accepts a value within range', () => {
    expect(validateField(200000, FIELD_LIMITS.principal)).toBeNull()
  })

  it('accepts a value exactly at the boundaries', () => {
    expect(validateField(FIELD_LIMITS.termYears.min, FIELD_LIMITS.termYears)).toBeNull()
    expect(validateField(FIELD_LIMITS.termYears.max, FIELD_LIMITS.termYears)).toBeNull()
  })
})

describe('validateLoanInputs', () => {
  it('returns null errors for a fully valid set of inputs', () => {
    const errors = validateLoanInputs({ principal: 200000, annualRatePercent: 5, termYears: 25 })
    expect(hasNoErrors(errors)).toBe(true)
  })

  it('flags an invalid field while leaving valid fields untouched', () => {
    const errors = validateLoanInputs({ principal: -10, annualRatePercent: 5, termYears: 25 })
    expect(errors.principal).not.toBeNull()
    expect(errors.annualRatePercent).toBeNull()
    expect(hasNoErrors(errors)).toBe(false)
  })

  it('ignores keys that are not part of FIELD_LIMITS', () => {
    const errors = validateLoanInputs({ principal: 200000, someUnknownField: 'x' })
    expect(errors.someUnknownField).toBeUndefined()
  })
})

describe('clamp', () => {
  it('clamps a value below the minimum', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })

  it('clamps a value above the maximum', () => {
    expect(clamp(500, 0, 100)).toBe(100)
  })

  it('leaves an in-range value unchanged', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it('falls back to the minimum for a non-finite value', () => {
    expect(clamp(NaN, 10, 100)).toBe(10)
    expect(clamp('abc', 10, 100)).toBe(10)
  })
})
