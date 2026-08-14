const inputClasses =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700'

/**
 * Core loan input form: amount, rate, term, plus optional overpayment fields.
 */
export default function LoanForm({ values, onChange, showOverpaymentFields = false }) {
  const handleField = (field) => (event) => {
    const raw = event.target.value
    onChange({ ...values, [field]: raw === '' ? '' : Number(raw) })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClasses} htmlFor="principal">
          Loan amount (£)
        </label>
        <input
          id="principal"
          type="number"
          min="0"
          step="1000"
          className={inputClasses}
          value={values.principal}
          onChange={handleField('principal')}
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="rate">
          Interest rate (% per year)
        </label>
        <input
          id="rate"
          type="number"
          min="0"
          step="0.01"
          className={inputClasses}
          value={values.annualRatePercent}
          onChange={handleField('annualRatePercent')}
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="term">
          Term (years)
        </label>
        <input
          id="term"
          type="number"
          min="1"
          step="1"
          className={inputClasses}
          value={values.termYears}
          onChange={handleField('termYears')}
        />
      </div>

      {showOverpaymentFields && (
        <>
          <div>
            <label className={labelClasses} htmlFor="extraMonthly">
              Recurring monthly overpayment (£)
            </label>
            <input
              id="extraMonthly"
              type="number"
              min="0"
              step="10"
              className={inputClasses}
              value={values.extraMonthly ?? 0}
              onChange={handleField('extraMonthly')}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="lumpSum">
              One-off lump sum (£)
            </label>
            <input
              id="lumpSum"
              type="number"
              min="0"
              step="100"
              className={inputClasses}
              value={values.lumpSum ?? 0}
              onChange={handleField('lumpSum')}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="lumpSumMonth">
              Lump sum applied at month #
            </label>
            <input
              id="lumpSumMonth"
              type="number"
              min="1"
              step="1"
              className={inputClasses}
              value={values.lumpSumMonth ?? 1}
              onChange={handleField('lumpSumMonth')}
            />
          </div>
        </>
      )}
    </div>
  )
}
