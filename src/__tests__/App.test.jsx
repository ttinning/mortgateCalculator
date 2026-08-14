import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/')
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('shows the Mortgage Calculator tab by default', () => {
    render(<App />)
    expect(screen.getByText('Loan details')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  it('switches to the Compare Scenarios tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /compare scenarios/i }))

    expect(await screen.findByText('Compare 2-3 scenarios')).toBeInTheDocument()
    expect(screen.queryByText('Loan details')).not.toBeInTheDocument()
  })

  it('switches to the Stamp Duty / LBTT tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /stamp duty/i }))

    expect(await screen.findByText('Stamp Duty / Land Transaction Tax')).toBeInTheDocument()
  })

  it('switches to the Affordability tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /affordability/i }))

    expect(await screen.findByText('How much could you afford to borrow?')).toBeInTheDocument()
  })

  it('switches to the Rate Switch tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /rate switch/i }))

    expect(await screen.findByText('Fixed deal → follow-on rate switch')).toBeInTheDocument()
  })

  it('toggles dark mode and applies the dark class to the document root', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await user.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
