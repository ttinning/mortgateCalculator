/**
 * Pure helpers for encoding/decoding the mortgage calculator's loan inputs
 * to/from a URL query string, so a scenario can be shared via link.
 */

// Short param keys keep the shared URL compact.
const PARAM_KEYS = {
  principal: 'p',
  annualRatePercent: 'r',
  termYears: 't',
  extraMonthly: 'em',
  lumpSum: 'ls',
  lumpSumMonth: 'lsm',
}

/**
 * Build a query string (without the leading "?") representing the given
 * loan values.
 *
 * @param {Record<string, number|string>} values
 * @returns {string}
 */
export function encodeLoanParams(values) {
  const params = new URLSearchParams()
  for (const [field, key] of Object.entries(PARAM_KEYS)) {
    if (values[field] !== undefined && values[field] !== '') {
      params.set(key, String(values[field]))
    }
  }
  return params.toString()
}

/**
 * Parse loan values out of a URLSearchParams (or query string). Returns
 * null if none of the recognised keys are present, so callers can fall
 * back to defaults/localStorage.
 *
 * @param {URLSearchParams|string} search
 * @returns {Record<string, number>|null}
 */
export function decodeLoanParams(search) {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const values = {}
  let found = false

  for (const [field, key] of Object.entries(PARAM_KEYS)) {
    const raw = params.get(key)
    if (raw !== null && raw !== '') {
      const number = Number(raw)
      if (!Number.isNaN(number)) {
        values[field] = number
        found = true
      }
    }
  }

  return found ? values : null
}
