/**
 * Pure validation helpers for numeric form fields used across the loan,
 * comparison, and LBTT calculators. Kept UI-agnostic so components just
 * render whatever error message is returned.
 */

export const FIELD_LIMITS = {
  principal: { min: 1, max: 20_000_000, label: 'Loan amount' },
  annualRatePercent: { min: 0, max: 25, label: 'Interest rate' },
  termYears: { min: 1, max: 40, label: 'Term' },
  extraMonthly: { min: 0, max: 100_000, label: 'Recurring overpayment' },
  lumpSum: { min: 0, max: 20_000_000, label: 'Lump sum' },
  lumpSumMonth: { min: 1, max: 600, label: 'Lump sum month' },
  price: { min: 0, max: 50_000_000, label: 'Property price' },
}

/**
 * Validate a single numeric field against its configured min/max.
 *
 * @param {number|string} rawValue
 * @param {{min:number, max:number, label:string}} limits
 * @returns {string|null} An error message, or null if the value is valid.
 */
export function validateField(rawValue, limits) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return `${limits.label} is required`
  }

  const value = Number(rawValue)

  if (Number.isNaN(value)) {
    return `${limits.label} must be a number`
  }
  if (value < limits.min) {
    return `${limits.label} must be at least ${limits.min.toLocaleString()}`
  }
  if (value > limits.max) {
    return `${limits.label} must be at most ${limits.max.toLocaleString()}`
  }
  return null
}

/**
 * Validate an object of loan-form-shaped values against FIELD_LIMITS.
 * Only checks the keys present in `values` and present in FIELD_LIMITS.
 *
 * @param {Record<string, number|string>} values
 * @returns {Record<string, string|null>} Map of field name -> error message (or null).
 */
export function validateLoanInputs(values) {
  const errors = {}
  for (const field of Object.keys(values)) {
    if (FIELD_LIMITS[field]) {
      errors[field] = validateField(values[field], FIELD_LIMITS[field])
    }
  }
  return errors
}

/**
 * @param {Record<string, string|null>} errors
 * @returns {boolean} true if every field is error-free.
 */
export function hasNoErrors(errors) {
  return Object.values(errors).every((error) => !error)
}

/**
 * Clamp a numeric value between the given min/max, defaulting to min when
 * the value is not a finite number.
 */
export function clamp(value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.min(max, Math.max(min, number))
}
