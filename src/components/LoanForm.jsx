import { validateLoanInputs, FIELD_LIMITS } from '../utils/validation'

const baseInputClasses =
  'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1'
const validInputClasses = 'border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
const invalidInputClasses = 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400'
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'
const errorClasses = 'mt-1 text-xs text-red-600 dark:text-red-400'

function Field({ id, label, value, onChange, error, min, step }) {
  return (
    <div>
      <label className={labelClasses} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        className={`${baseInputClasses} ${error ? invalidInputClasses : validInputClasses}`}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className={errorClasses}>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Core loan input form: amount, rate, term, plus optional overpayment fields.
 * Validates each field against sensible min/max bounds and shows inline
 * errors, without blocking typing (calculations elsewhere fall back to 0
 * for invalid/empty values).
 */
export default function LoanForm({ values, onChange, showOverpaymentFields = false }) {
  const errors = validateLoanInputs(values)

  const handleField = (field) => (event) => {
    const raw = event.target.value
    onChange({ ...values, [field]: raw === '' ? '' : Number(raw) })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        id="principal"
        label="Loan amount (£)"
        min={FIELD_LIMITS.principal.min}
        step="1000"
        value={values.principal}
        onChange={handleField('principal')}
        error={errors.principal}
      />

      <Field
        id="rate"
        label="Interest rate (% per year)"
        min={FIELD_LIMITS.annualRatePercent.min}
        step="0.01"
        value={values.annualRatePercent}
        onChange={handleField('annualRatePercent')}
        error={errors.annualRatePercent}
      />

      <Field
        id="term"
        label="Term (years)"
        min={FIELD_LIMITS.termYears.min}
        step="1"
        value={values.termYears}
        onChange={handleField('termYears')}
        error={errors.termYears}
      />

      {showOverpaymentFields && (
        <>
          <Field
            id="extraMonthly"
            label="Recurring monthly overpayment (£)"
            min={FIELD_LIMITS.extraMonthly.min}
            step="10"
            value={values.extraMonthly ?? 0}
            onChange={handleField('extraMonthly')}
            error={errors.extraMonthly}
          />

          <Field
            id="lumpSum"
            label="One-off lump sum (£)"
            min={FIELD_LIMITS.lumpSum.min}
            step="100"
            value={values.lumpSum ?? 0}
            onChange={handleField('lumpSum')}
            error={errors.lumpSum}
          />

          <Field
            id="lumpSumMonth"
            label="Lump sum applied at month #"
            min={FIELD_LIMITS.lumpSumMonth.min}
            step="1"
            value={values.lumpSumMonth ?? 1}
            onChange={handleField('lumpSumMonth')}
            error={errors.lumpSumMonth}
          />
        </>
      )}
    </div>
  )
}
