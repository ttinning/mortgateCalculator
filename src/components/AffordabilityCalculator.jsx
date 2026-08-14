import { useId, useState } from 'react'
import {
  calculateAffordability,
  DEFAULT_INCOME_MULTIPLE,
  DEFAULT_STRESS_MARGIN_PERCENT,
  DEFAULT_MAX_DTI,
} from '../utils/affordability'
import { formatCurrency } from '../utils/format'
import { useLocalStorageState } from '../utils/useLocalStorageState'
import { validateField, FIELD_LIMITS } from '../utils/validation'

const inputClasses =
  'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1'
const validInputClasses = 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
const invalidInputClasses = 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

const DEFAULT_INPUTS = {
  annualIncome: 45000,
  monthlyDebts: 0,
  deposit: 30000,
  interestRate: 5,
  termYears: 25,
  incomeMultiple: DEFAULT_INCOME_MULTIPLE,
  stressMarginPercent: DEFAULT_STRESS_MARGIN_PERCENT,
  maxDti: DEFAULT_MAX_DTI,
}

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
 * Estimates how much someone could realistically borrow, based on an income
 * multiple cap and a stress-tested affordability check (rate + margin),
 * mirroring how UK mortgage lenders typically assess applications.
 */
export default function AffordabilityCalculator() {
  const [inputs, setInputs] = useLocalStorageState('mortgage-calculator:affordability', DEFAULT_INPUTS)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (field) => (value) => setInputs((prev) => ({ ...prev, [field]: value }))

  const errors = {
    annualIncome: validateField(inputs.annualIncome, FIELD_LIMITS.principal),
    interestRate: validateField(inputs.interestRate, FIELD_LIMITS.annualRatePercent),
    termYears: validateField(inputs.termYears, FIELD_LIMITS.termYears),
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const result = hasErrors
    ? null
    : calculateAffordability({
        annualIncome: inputs.annualIncome || 0,
        monthlyDebts: inputs.monthlyDebts || 0,
        deposit: inputs.deposit || 0,
        interestRate: inputs.interestRate || 0,
        termYears: inputs.termYears || 0,
        incomeMultiple: inputs.incomeMultiple || DEFAULT_INCOME_MULTIPLE,
        stressMarginPercent: inputs.stressMarginPercent ?? DEFAULT_STRESS_MARGIN_PERCENT,
        maxDti: inputs.maxDti || DEFAULT_MAX_DTI,
      })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Combined gross annual income (£)"
          value={inputs.annualIncome}
          onChange={set('annualIncome')}
          error={errors.annualIncome}
        />
        <Field
          label="Existing monthly debt repayments (£)"
          value={inputs.monthlyDebts}
          onChange={set('monthlyDebts')}
        />
        <Field label="Deposit available (£)" value={inputs.deposit} onChange={set('deposit')} />
        <Field
          label="Expected mortgage rate"
          value={inputs.interestRate}
          onChange={set('interestRate')}
          error={errors.interestRate}
          step="0.01"
          suffix="%"
        />
        <Field
          label="Mortgage term (years)"
          value={inputs.termYears}
          onChange={set('termYears')}
          error={errors.termYears}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {showAdvanced ? '- Hide' : '+ Show'} advanced assumptions
        </button>
        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-4 ring-1 ring-slate-200 dark:ring-slate-700 md:grid-cols-3">
            <Field
              label="Income multiple cap"
              value={inputs.incomeMultiple}
              onChange={set('incomeMultiple')}
              step="0.1"
              suffix="x"
            />
            <Field
              label="Stress test margin"
              value={inputs.stressMarginPercent}
              onChange={set('stressMarginPercent')}
              step="0.1"
              suffix="pp"
            />
            <Field
              label="Max payment share of income"
              value={inputs.maxDti}
              onChange={set('maxDti')}
              step="0.01"
            />
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 p-6 ring-1 ring-emerald-200 dark:ring-emerald-800">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Estimated maximum property price</p>
          <p className="mt-1 text-3xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(result.maxPropertyPrice)}</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            Based on a max loan of {formatCurrency(result.recommendedMaxLoan)} plus your{' '}
            {formatCurrency(inputs.deposit || 0)} deposit.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-emerald-200 dark:border-emerald-800 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Income multiple cap</p>
              <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(result.maxLoanByIncomeMultiple)}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{inputs.incomeMultiple || DEFAULT_INCOME_MULTIPLE}x annual income</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Stress-tested affordability</p>
              <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(result.maxLoanByAffordability)}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">at {result.stressRate.toFixed(2)}% (rate + stress margin)</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-emerald-700 dark:text-emerald-300">
            The{' '}
            <span className="font-semibold">
              {result.limitingFactor === 'incomeMultiple' ? 'income multiple' : 'stress-tested affordability'}
            </span>{' '}
            check is the limiting factor here. Estimated monthly payment on the recommended loan at your quoted rate:{' '}
            <span className="font-semibold">{formatCurrency(result.estimatedMonthlyPayment, { precise: true })}</span>{' '}
            (rising to {formatCurrency(result.estimatedMonthlyPaymentStressed, { precise: true })} if stress-tested).
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        This is a rough estimate for guidance only, not a mortgage offer or financial advice. Actual lending
        criteria vary by lender and depend on credit history, employment status, and other factors.
      </p>
    </div>
  )
}
