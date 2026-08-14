/**
 * Pure CSV formatting for an amortization schedule (no DOM/browser APIs),
 * so it can be unit tested in isolation. The download itself is triggered
 * separately from the UI layer.
 */

const HEADERS = ['Month', 'Payment', 'Principal', 'Interest', 'Extra', 'Balance']

/**
 * Convert an amortization schedule into a CSV string (including header row).
 *
 * @param {Array<{month:number, payment:number, principalPaid:number, interestPaid:number, extraPaid:number, balance:number}>} schedule
 * @returns {string}
 */
export function scheduleToCsv(schedule) {
  const rows = schedule.map((row) =>
    [row.month, row.payment, row.principalPaid, row.interestPaid, row.extraPaid, row.balance].join(','),
  )
  return [HEADERS.join(','), ...rows].join('\n')
}
