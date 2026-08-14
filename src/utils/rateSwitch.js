import { calculateMonthlyPayment } from './amortization'

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Models a common UK mortgage structure: an initial deal period (fixed or
 * discounted rate) followed by a "follow-on"/reversion rate (e.g. lender's
 * SVR) for the remainder of the term. The monthly payment is recalculated
 * at the switch point so it fully amortizes the remaining balance over the
 * remaining term at the new rate — mirroring how lenders actually
 * recalculate payments when a fixed deal ends.
 *
 * @param {object} params
 * @param {number} params.principal - Loan amount.
 * @param {number} params.termYears - Total mortgage term in years.
 * @param {number} params.initialRatePercent - Annual rate during the initial deal period (e.g. 4.5).
 * @param {number} params.initialPeriodYears - Length of the initial deal period, in years (e.g. 2 or 5).
 * @param {number} params.followOnRatePercent - Annual rate that applies after the initial period ends (e.g. lender SVR).
 * @returns {{
 *   schedule: Array<{month:number, phase:'initial'|'followOn', payment:number, principalPaid:number, interestPaid:number, balance:number}>,
 *   initialMonthlyPayment:number,
 *   followOnMonthlyPayment:number,
 *   monthlyPaymentChange:number,
 *   balanceAtSwitch:number,
 *   totalInterest:number,
 *   totalPaid:number,
 *   initialTotalInterest:number,
 *   followOnTotalInterest:number
 * }}
 */
export function calculateRateSwitchSchedule({
  principal,
  termYears,
  initialRatePercent,
  initialPeriodYears,
  followOnRatePercent,
}) {
  const totalMonths = Math.round(termYears * 12)
  const initialMonths = Math.min(Math.round(initialPeriodYears * 12), totalMonths)

  if (principal <= 0 || totalMonths <= 0 || initialMonths <= 0) {
    return {
      schedule: [],
      initialMonthlyPayment: 0,
      followOnMonthlyPayment: 0,
      monthlyPaymentChange: 0,
      balanceAtSwitch: principal,
      totalInterest: 0,
      totalPaid: 0,
      initialTotalInterest: 0,
      followOnTotalInterest: 0,
    }
  }

  // Initial period: payment amortizes over the *full* term at the initial rate.
  const initialMonthlyPayment = calculateMonthlyPayment(principal, initialRatePercent, termYears)
  const initialMonthlyRate = initialRatePercent / 100 / 12

  const schedule = []
  let balance = principal
  let initialTotalInterest = 0

  for (let month = 1; month <= initialMonths; month += 1) {
    const interestPaid = balance * initialMonthlyRate
    let principalPaid = initialMonthlyPayment - interestPaid
    let payment = initialMonthlyPayment

    if (principalPaid >= balance) {
      principalPaid = balance
      payment = principalPaid + interestPaid
      balance = 0
    } else {
      balance -= principalPaid
    }

    initialTotalInterest += interestPaid
    schedule.push({
      month,
      phase: 'initial',
      payment: round2(payment),
      principalPaid: round2(principalPaid),
      interestPaid: round2(interestPaid),
      balance: round2(balance),
    })
  }

  const balanceAtSwitch = balance
  const remainingMonths = totalMonths - initialMonths

  let followOnMonthlyPayment = 0
  let followOnTotalInterest = 0

  if (remainingMonths > 0 && balance > 0.005) {
    const remainingTermYears = remainingMonths / 12
    followOnMonthlyPayment = calculateMonthlyPayment(balance, followOnRatePercent, remainingTermYears)
    const followOnMonthlyRate = followOnRatePercent / 100 / 12

    for (let i = 0; i < remainingMonths && balance > 0.005; i += 1) {
      const month = initialMonths + i + 1
      const interestPaid = balance * followOnMonthlyRate
      let principalPaid = followOnMonthlyPayment - interestPaid
      let payment = followOnMonthlyPayment

      if (principalPaid >= balance) {
        principalPaid = balance
        payment = principalPaid + interestPaid
        balance = 0
      } else {
        balance -= principalPaid
      }

      followOnTotalInterest += interestPaid
      schedule.push({
        month,
        phase: 'followOn',
        payment: round2(payment),
        principalPaid: round2(principalPaid),
        interestPaid: round2(interestPaid),
        balance: round2(balance),
      })
    }
  }

  const totalInterest = initialTotalInterest + followOnTotalInterest
  const totalPaid = principal + totalInterest

  return {
    schedule,
    initialMonthlyPayment: round2(initialMonthlyPayment),
    followOnMonthlyPayment: round2(followOnMonthlyPayment),
    monthlyPaymentChange: round2(followOnMonthlyPayment - initialMonthlyPayment),
    balanceAtSwitch: round2(balanceAtSwitch),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    initialTotalInterest: round2(initialTotalInterest),
    followOnTotalInterest: round2(followOnTotalInterest),
  }
}
