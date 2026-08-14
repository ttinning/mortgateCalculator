import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoanForm from '../LoanForm'

function ControlledLoanForm({ initialValues, showOverpaymentFields }) {
  const [values, setValues] = useState(initialValues)
  return <LoanForm values={values} onChange={setValues} showOverpaymentFields={showOverpaymentFields} />
}

describe('LoanForm', () => {
  it('renders the core loan fields with their current values', () => {
    render(<ControlledLoanForm initialValues={{ principal: 200000, annualRatePercent: 5, termYears: 25 }} />)

    expect(screen.getByLabelText(/loan amount/i)).toHaveValue(200000)
    expect(screen.getByLabelText(/interest rate/i)).toHaveValue(5)
    expect(screen.getByLabelText(/term \(years\)/i)).toHaveValue(25)
  })

  it('shows an inline validation error when the loan amount is below the minimum', async () => {
    const user = userEvent.setup()
    render(<ControlledLoanForm initialValues={{ principal: 200000, annualRatePercent: 5, termYears: 25 }} />)

    const principalInput = screen.getByLabelText(/loan amount/i)
    await user.clear(principalInput)
    await user.type(principalInput, '0')

    expect(await screen.findByText(/loan amount must be at least/i)).toBeInTheDocument()
  })

  it('shows an inline validation error when a required field is cleared', async () => {
    const user = userEvent.setup()
    render(<ControlledLoanForm initialValues={{ principal: 200000, annualRatePercent: 5, termYears: 25 }} />)

    const termInput = screen.getByLabelText(/term \(years\)/i)
    await user.clear(termInput)

    expect(await screen.findByText(/term is required/i)).toBeInTheDocument()
  })

  it('does not render overpayment fields unless explicitly enabled', () => {
    render(<ControlledLoanForm initialValues={{ principal: 200000, annualRatePercent: 5, termYears: 25 }} />)
    expect(screen.queryByLabelText(/recurring monthly overpayment/i)).not.toBeInTheDocument()
  })

  it('renders overpayment fields when showOverpaymentFields is true', () => {
    render(
      <ControlledLoanForm
        initialValues={{ principal: 200000, annualRatePercent: 5, termYears: 25, extraMonthly: 0, lumpSum: 0, lumpSumMonth: 1 }}
        showOverpaymentFields
      />,
    )
    expect(screen.getByLabelText(/recurring monthly overpayment/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/one-off lump sum/i)).toBeInTheDocument()
  })
})
