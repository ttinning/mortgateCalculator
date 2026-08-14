/**
 * Pure calculation functions for mortgage amortization.
 * No UI/framework dependencies — safe to unit test in isolation.
 */

/**
 * Calculate the fixed monthly payment for a repayment mortgage using the
 * standard amortization formula:
 *
 *   M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
 *
 * where P = principal, r = monthly interest rate, n = number of payments.
 * When the annual rate is 0%, this degrades to a simple P / n split.
 *
 * @param {number} principal - Loan amount.
 * @param {number} annualRatePercent - Annual interest rate as a percentage (e.g. 5.5 for 5.5%).
 * @param {number} termYears - Loan term in years.
 * @returns {number} Fixed monthly payment amount.
 */
export function calculateMonthlyPayment(principal, annualRatePercent, termYears) {
  const n = Math.round(termYears * 12)
  if (principal <= 0 || n <= 0) return 0

  const r = annualRatePercent / 100 / 12
  if (r === 0) {
    return principal / n
  }

  const factor = Math.pow(1 + r, n)
  return (principal * r * factor) / (factor - 1)
}

/**
 * Generate a full month-by-month amortization schedule, optionally applying
 * a one-off lump sum overpayment and/or a recurring monthly overpayment.
 * The schedule stops early if the balance is paid off before the original
 * term (as a result of overpayments).
 *
 * @param {object} params
 * @param {number} params.principal - Loan amount.
 * @param {number} params.annualRatePercent - Annual interest rate as a percentage.
 * @param {number} params.termYears - Loan term in years.
 * @param {number} [params.extraMonthly=0] - Recurring extra amount paid every month, in addition to the base payment.
 * @param {number} [params.lumpSum=0] - One-off extra amount applied to the principal.
 * @param {number} [params.lumpSumMonth=1] - The payment number (1-indexed) at which the lump sum is applied.
 * @returns {{
 *   schedule: Array<{month:number, payment:number, principalPaid:number, interestPaid:number, extraPaid:number, balance:number}>,
 *   monthlyPayment:number,
 *   totalInterest:number,
 *   totalPaid:number,
 *   payoffMonth:number
 * }}
 */
export function generateAmortizationSchedule({
  principal,
  annualRatePercent,
  termYears,
  extraMonthly = 0,
  lumpSum = 0,
  lumpSumMonth = 1,
}) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRatePercent, termYears)
  const n = Math.round(termYears * 12)
  const r = annualRatePercent / 100 / 12

  const schedule = []
  let balance = principal
  let totalInterest = 0
  let totalPaid = 0
  let month = 0

  // Cap iterations at the original term to guard against pathological inputs
  // (e.g. extraMonthly so small it would never reasonably pay off the loan).
  const maxMonths = Math.max(n, 1)

  while (balance > 0.005 && month < maxMonths) {
    month += 1
    const interestPaid = balance * r
    let extraPaid = extraMonthly
    if (month === lumpSumMonth) {
      extraPaid += lumpSum
    }

    let principalPaid = monthlyPayment - interestPaid
    let payment = monthlyPayment

    // Don't overpay past the remaining balance on the final month.
    if (principalPaid + extraPaid >= balance) {
      principalPaid = Math.min(principalPaid, balance)
      extraPaid = Math.max(0, balance - principalPaid)
      payment = principalPaid + interestPaid
      balance = 0
    } else {
      balance -= principalPaid + extraPaid
    }

    totalInterest += interestPaid
    totalPaid += payment + extraPaid

    schedule.push({
      month,
      payment: round2(payment),
      principalPaid: round2(principalPaid),
      interestPaid: round2(interestPaid),
      extraPaid: round2(extraPaid),
      balance: round2(balance),
    })
  }

  return {
    schedule,
    monthlyPayment: round2(monthlyPayment),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    payoffMonth: month,
  }
}

/**
 * Compare a base scenario against one with overpayments applied, returning
 * the time saved (in months) and interest saved.
 *
 * @param {object} params
 * @param {number} params.principal
 * @param {number} params.annualRatePercent
 * @param {number} params.termYears
 * @param {number} [params.extraMonthly=0]
 * @param {number} [params.lumpSum=0]
 * @param {number} [params.lumpSumMonth=1]
 * @returns {{
 *   base: ReturnType<typeof generateAmortizationSchedule>,
 *   withOverpayment: ReturnType<typeof generateAmortizationSchedule>,
 *   monthsSaved: number,
 *   interestSaved: number
 * }}
 */
export function calculateOverpaymentImpact({
  principal,
  annualRatePercent,
  termYears,
  extraMonthly = 0,
  lumpSum = 0,
  lumpSumMonth = 1,
}) {
  const base = generateAmortizationSchedule({ principal, annualRatePercent, termYears })
  const withOverpayment = generateAmortizationSchedule({
    principal,
    annualRatePercent,
    termYears,
    extraMonthly,
    lumpSum,
    lumpSumMonth,
  })

  return {
    base,
    withOverpayment,
    monthsSaved: base.payoffMonth - withOverpayment.payoffMonth,
    interestSaved: round2(base.totalInterest - withOverpayment.totalInterest),
  }
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
