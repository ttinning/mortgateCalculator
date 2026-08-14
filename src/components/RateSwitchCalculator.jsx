import { useId } from 'react'
import { calculateRateSwitchSchedule } from '../utils/rateSwitch'
import { formatCurrency } from '../utils/format'
import { useLocalStorageState } from '../utils/useLocalStorageState'
import { validateField, FIELD_LIMITS } from '../utils/validation'

const inputClasses =
  'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1'
const validInputClasses =
  'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
const invalidInputClasses = 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

const DEFAULT_INPUTS = {
  principal: 200000,
  termYears: 25,
  initialRatePercent: 4.5,
  initialPeriodYears: 5,
  followOnRatePercent: 7.5,
}

const initialPeriodLimits = { min: 1, max: 40, label: 'Initial deal period' }

function Field({ label, value, onChange, error, step, suffix }) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div>
      <label className={labelClasses} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          step={step}
          className={`${inputClasses} ${error ? invalidInputClasses : validInputClasses} ${suffix ? 'pr-8' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Models a fixed/discounted introductory rate followed by a "follow-on"
 * (e.g. lender SVR) rate for the rest of the term, showing how the monthly
 * payment changes at the switch point — a common source of payment shock
 * for UK mortgage holders.
 */
export default function RateSwitchCalculator() {
  const [inputs, setInputs] = useLocalStorageState('mortgage-calculator:rate-switch', DEFAULT_INPUTS)

  const set = (field) => (value) => setInputs((prev) => ({ ...prev, [field]: value }))

  const errors = {
    principal: validateField(inputs.principal, FIELD_LIMITS.principal),
    termYears: validateField(inputs.termYears, FIELD_LIMITS.termYears),
    initialRatePercent: validateField(inputs.initialRatePercent, FIELD_LIMITS.annualRatePercent),
    followOnRatePercent: validateField(inputs.followOnRatePercent, FIELD_LIMITS.annualRatePercent),
    initialPeriodYears: validateField(inputs.initialPeriodYears, initialPeriodLimits),
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const result =
    hasErrors || Number(inputs.initialPeriodYears) > Number(inputs.termYears)
      ? null
      : calculateRateSwitchSchedule({
          principal: inputs.principal || 0,
          termYears: inputs.termYears || 0,
          initialRatePercent: inputs.initialRatePercent || 0,
          initialPeriodYears: inputs.initialPeriodYears || 0,
          followOnRatePercent: inputs.followOnRatePercent || 0,
        })

  const periodExceedsTerm = Number(inputs.initialPeriodYears) > Number(inputs.termYears)
  const isIncrease = result && result.monthlyPaymentChange > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Loan amount (£)"
          value={inputs.principal}
          onChange={set('principal')}
          error={errors.principal}
          step="1000"
        />
        <Field
          label="Total term (years)"
          value={inputs.termYears}
          onChange={set('termYears')}
          error={errors.termYears}
        />
        <Field
          label="Initial deal rate"
          value={inputs.initialRatePercent}
          onChange={set('initialRatePercent')}
          error={errors.initialRatePercent}
          step="0.01"
          suffix="%"
        />
        <Field
          label="Initial deal period (years)"
          value={inputs.initialPeriodYears}
          onChange={set('initialPeriodYears')}
          error={errors.initialPeriodYears || (periodExceedsTerm ? 'Cannot exceed total term' : null)}
          step="1"
        />
        <Field
          label="Follow-on rate (e.g. lender SVR)"
          value={inputs.followOnRatePercent}
          onChange={set('followOnRatePercent')}
          error={errors.followOnRatePercent}
          step="0.01"
          suffix="%"
        />
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950 p-6 ring-1 ring-blue-200 dark:ring-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Monthly payment: initial {inputs.initialPeriodYears}-year deal
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">
                {formatCurrency(result.initialMonthlyPayment, { precise: true })}
              </p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                Total interest during this period: {formatCurrency(result.initialTotalInterest)}
              </p>
            </div>

            <div
              className={`rounded-xl p-6 ring-1 ${
                isIncrease
                  ? 'bg-red-50 dark:bg-red-950 ring-red-200 dark:ring-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-950 ring-emerald-200 dark:ring-emerald-800'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isIncrease ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                Monthly payment: after switch to follow-on rate
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  isIncrease ? 'text-red-900 dark:text-red-200' : 'text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {result.followOnMonthlyPayment > 0
                  ? formatCurrency(result.followOnMonthlyPayment, { precise: true })
                  : 'N/A — deal covers full term'}
              </p>
              {result.followOnMonthlyPayment > 0 && (
                <p
                  className={`mt-1 text-xs ${
                    isIncrease ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {isIncrease ? '+' : ''}
                  {formatCurrency(result.monthlyPaymentChange, { precise: true })} vs. the initial payment, on a
                  remaining balance of {formatCurrency(result.balanceAtSwitch)}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Over the full term</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total interest paid</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalInterest)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total paid (principal + interest)</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Interest after the switch</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.followOnTotalInterest)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Assumes the payment is fully recalculated at the switch point to repay the remaining balance over the
        remaining term at the new rate — the standard behavior for UK fixed/discount deals reverting to a
        lender's follow-on rate (e.g. SVR).
      </p>
    </div>
  )
}
