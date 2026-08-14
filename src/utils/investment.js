/**
 * Pure calculation for the classic "overpay the mortgage vs. invest instead"
 * comparison: if the same lump sum and recurring monthly amount were
 * invested (at a compounding monthly return) instead of used to overpay
 * the mortgage, what would it grow to over the same period?
 */

/**
 * @param {object} params
 * @param {number} [params.lumpSum=0] - One-off amount invested at the start.
 * @param {number} [params.monthlyContribution=0] - Recurring monthly investment.
 * @param {number} params.months - Number of months invested for.
 * @param {number} params.annualReturnPercent - Expected annual investment return as a percentage.
 * @returns {{ contributions: number, futureValue: number, growth: number }}
 */
export function calculateInvestmentAlternative({
  lumpSum = 0,
  monthlyContribution = 0,
  months,
  annualReturnPercent,
}) {
  const safeMonths = Math.max(0, Math.round(months) || 0)
  const r = (annualReturnPercent || 0) / 100 / 12
  const contributions = lumpSum + monthlyContribution * safeMonths

  if (safeMonths === 0) {
    return { contributions: round2(contributions), futureValue: round2(contributions), growth: 0 }
  }

  let lumpSumFutureValue
  let monthlyFutureValue

  if (r === 0) {
    lumpSumFutureValue = lumpSum
    monthlyFutureValue = monthlyContribution * safeMonths
  } else {
    const growthFactor = Math.pow(1 + r, safeMonths)
    lumpSumFutureValue = lumpSum * growthFactor
    monthlyFutureValue = monthlyContribution * ((growthFactor - 1) / r)
  }

  const futureValue = lumpSumFutureValue + monthlyFutureValue

  return {
    contributions: round2(contributions),
    futureValue: round2(futureValue),
    growth: round2(futureValue - contributions),
  }
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
