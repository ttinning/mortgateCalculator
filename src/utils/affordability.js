/**
 * Affordability calculator.
 *
 * Estimates how much someone could realistically borrow, combining two
 * common UK lender checks:
 *  1. Income multiple cap — loan capped at a multiple of gross annual income
 *     (commonly 4-4.5x, sometimes higher for specific lenders/professions).
 *  2. Stress-tested affordability — the monthly payment must stay under a
 *     share of gross monthly income (after existing debts) *even if* the
 *     rate rose by a margin (typically ~3 percentage points), which is how
 *     UK lenders "stress test" applications.
 *
 * The lower of the two caps is the more conservative, realistic estimate.
 */

export const DEFAULT_INCOME_MULTIPLE = 4.5
export const DEFAULT_STRESS_MARGIN_PERCENT = 3
export const DEFAULT_MAX_DTI = 0.45

/**
 * Solve for the loan principal that produces a given monthly payment,
 * i.e. the inverse of the standard amortization payment formula.
 */
function loanAmountForPayment(monthlyPayment, annualRatePercent, termYears) {
  const n = Math.round(termYears * 12)
  if (n <= 0 || monthlyPayment <= 0) return 0

  const monthlyRate = annualRatePercent / 100 / 12
  if (monthlyRate === 0) return monthlyPayment * n

  return (monthlyPayment * (1 - (1 + monthlyRate) ** -n)) / monthlyRate
}

function monthlyPaymentForLoan(principal, annualRatePercent, termYears) {
  const n = Math.round(termYears * 12)
  if (n <= 0 || principal <= 0) return 0

  const monthlyRate = annualRatePercent / 100 / 12
  if (monthlyRate === 0) return principal / n

  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -n)
}

/**
 * @param {object} params
 * @param {number} params.annualIncome - Combined gross annual income.
 * @param {number} [params.monthlyDebts] - Existing monthly debt repayments (loans, car finance, etc.).
 * @param {number} [params.deposit] - Cash deposit available.
 * @param {number} params.interestRate - Expected mortgage rate (annual %, e.g. 5).
 * @param {number} params.termYears - Mortgage term in years.
 * @param {number} [params.incomeMultiple] - Lender income multiple cap (default 4.5x).
 * @param {number} [params.stressMarginPercent] - Percentage points added to the rate for stress testing (default 3).
 * @param {number} [params.maxDti] - Max share of gross monthly income (post existing debts) usable for the mortgage payment (default 0.45).
 */
export function calculateAffordability({
  annualIncome,
  monthlyDebts = 0,
  deposit = 0,
  interestRate,
  termYears,
  incomeMultiple = DEFAULT_INCOME_MULTIPLE,
  stressMarginPercent = DEFAULT_STRESS_MARGIN_PERCENT,
  maxDti = DEFAULT_MAX_DTI,
}) {
  const safeIncome = Math.max(0, annualIncome || 0)
  const safeDebts = Math.max(0, monthlyDebts || 0)
  const safeDeposit = Math.max(0, deposit || 0)

  const grossMonthlyIncome = safeIncome / 12
  const maxLoanByIncomeMultiple = safeIncome * incomeMultiple

  const maxMonthlyPayment = Math.max(0, grossMonthlyIncome * maxDti - safeDebts)
  const stressRate = (interestRate || 0) + stressMarginPercent
  const maxLoanByAffordability = loanAmountForPayment(maxMonthlyPayment, stressRate, termYears)

  const recommendedMaxLoan = Math.min(maxLoanByIncomeMultiple, maxLoanByAffordability)
  const limitingFactor =
    maxLoanByIncomeMultiple <= maxLoanByAffordability ? 'incomeMultiple' : 'affordability'

  const maxPropertyPrice = recommendedMaxLoan + safeDeposit
  const estimatedMonthlyPayment = monthlyPaymentForLoan(recommendedMaxLoan, interestRate || 0, termYears)
  const estimatedMonthlyPaymentStressed = monthlyPaymentForLoan(recommendedMaxLoan, stressRate, termYears)

  return {
    maxLoanByIncomeMultiple,
    maxLoanByAffordability,
    recommendedMaxLoan,
    limitingFactor,
    maxPropertyPrice,
    estimatedMonthlyPayment,
    estimatedMonthlyPaymentStressed,
    stressRate,
    maxMonthlyPayment,
  }
}
