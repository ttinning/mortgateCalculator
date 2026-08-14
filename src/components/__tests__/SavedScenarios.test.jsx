import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SavedScenarios from '../SavedScenarios'

const sampleValues = { principal: 150000, annualRatePercent: 4.5, termYears: 20 }

describe('SavedScenarios', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty state when there are no saved scenarios', () => {
    render(<SavedScenarios currentValues={sampleValues} onLoad={() => {}} />)
    expect(screen.getByText(/no saved scenarios yet/i)).toBeInTheDocument()
  })

  it('saves the current values under the given name and lists it', async () => {
    const user = userEvent.setup()
    render(<SavedScenarios currentValues={sampleValues} onLoad={() => {}} />)

    await user.type(screen.getByPlaceholderText(/scenario name/i), 'First home')
    await user.click(screen.getByRole('button', { name: /save current inputs/i }))

    expect(await screen.findByText('First home')).toBeInTheDocument()
    expect(screen.getByText(/150,000/)).toBeInTheDocument()
    expect(screen.queryByText(/no saved scenarios yet/i)).not.toBeInTheDocument()
  })

  it('calls onLoad with the saved values when Load is clicked', async () => {
    const user = userEvent.setup()
    const onLoad = vi.fn()
    render(<SavedScenarios currentValues={sampleValues} onLoad={onLoad} />)

    await user.type(screen.getByPlaceholderText(/scenario name/i), 'First home')
    await user.click(screen.getByRole('button', { name: /save current inputs/i }))
    await user.click(await screen.findByRole('button', { name: /load/i }))

    expect(onLoad).toHaveBeenCalledWith(sampleValues)
  })

  it('removes a scenario when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(<SavedScenarios currentValues={sampleValues} onLoad={() => {}} />)

    await user.type(screen.getByPlaceholderText(/scenario name/i), 'First home')
    await user.click(screen.getByRole('button', { name: /save current inputs/i }))
    expect(await screen.findByText('First home')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.queryByText('First home')).not.toBeInTheDocument()
    expect(screen.getByText(/no saved scenarios yet/i)).toBeInTheDocument()
  })

  it('persists saved scenarios to localStorage', async () => {
    const user = userEvent.setup()
    render(<SavedScenarios currentValues={sampleValues} onLoad={() => {}} />)

    await user.type(screen.getByPlaceholderText(/scenario name/i), 'First home')
    await user.click(screen.getByRole('button', { name: /save current inputs/i }))

    const stored = JSON.parse(window.localStorage.getItem('mortgage-calculator:saved-scenarios'))
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('First home')
    expect(stored[0].values).toEqual(sampleValues)
  })
})
