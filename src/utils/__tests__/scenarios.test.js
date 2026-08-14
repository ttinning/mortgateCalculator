import { describe, expect, it } from 'vitest'
import { addScenario, removeScenario, renameScenario } from '../scenarios'

const sampleValues = { principal: 200000, annualRatePercent: 5, termYears: 25 }

describe('addScenario', () => {
  it('appends a new scenario with the given name and a snapshot of the values', () => {
    const result = addScenario([], 'First home', sampleValues)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('First home')
    expect(result[0].values).toEqual(sampleValues)
    expect(result[0].id).toBeTruthy()
    expect(result[0].savedAt).toBeTypeOf('number')
  })

  it('trims whitespace from the name', () => {
    const result = addScenario([], '  Buy-to-let  ', sampleValues)
    expect(result[0].name).toBe('Buy-to-let')
  })

  it('falls back to "Untitled scenario" for a blank name', () => {
    const result = addScenario([], '   ', sampleValues)
    expect(result[0].name).toBe('Untitled scenario')
  })

  it('does not mutate the original array', () => {
    const original = []
    addScenario(original, 'A', sampleValues)
    expect(original).toHaveLength(0)
  })

  it('assigns unique ids to scenarios saved in sequence', () => {
    let list = addScenario([], 'A', sampleValues)
    list = addScenario(list, 'B', sampleValues)
    expect(list[0].id).not.toBe(list[1].id)
  })
})

describe('removeScenario', () => {
  it('removes the scenario with the matching id', () => {
    const list = addScenario([], 'A', sampleValues)
    const id = list[0].id
    const result = removeScenario(list, id)
    expect(result).toHaveLength(0)
  })

  it('is a no-op when the id does not exist', () => {
    const list = addScenario([], 'A', sampleValues)
    const result = removeScenario(list, 'nonexistent-id')
    expect(result).toHaveLength(1)
  })
})

describe('renameScenario', () => {
  it('renames the scenario with the matching id', () => {
    const list = addScenario([], 'A', sampleValues)
    const id = list[0].id
    const result = renameScenario(list, id, 'B')
    expect(result[0].name).toBe('B')
  })

  it('falls back to "Untitled scenario" for a blank new name', () => {
    const list = addScenario([], 'A', sampleValues)
    const id = list[0].id
    const result = renameScenario(list, id, '   ')
    expect(result[0].name).toBe('Untitled scenario')
  })
})
