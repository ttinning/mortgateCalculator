/**
 * Pure helpers for managing a list of named, saved loan scenarios
 * (beyond the fixed 2-3 comparison slots) — e.g. "First home", "5yr fix
 * remortgage", etc. Kept UI-agnostic and framework-free for easy testing.
 */

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Add a new named scenario snapshot to the list.
 *
 * @param {Array<object>} scenarios - Existing saved scenarios.
 * @param {string} name - Display name for the scenario (trimmed; falls back to "Untitled scenario" if blank).
 * @param {object} values - The loan input values to snapshot (principal, annualRatePercent, termYears, etc.).
 * @returns {Array<object>} A new array with the scenario appended.
 */
export function addScenario(scenarios, name, values) {
  const trimmedName = (name || '').trim() || 'Untitled scenario'
  const scenario = {
    id: generateId(),
    name: trimmedName,
    savedAt: Date.now(),
    values: { ...values },
  }
  return [...scenarios, scenario]
}

/**
 * Remove a scenario by id.
 *
 * @param {Array<object>} scenarios
 * @param {string} id
 * @returns {Array<object>} A new array without the matching scenario.
 */
export function removeScenario(scenarios, id) {
  return scenarios.filter((scenario) => scenario.id !== id)
}

/**
 * Rename an existing scenario.
 *
 * @param {Array<object>} scenarios
 * @param {string} id
 * @param {string} newName
 * @returns {Array<object>} A new array with the matching scenario renamed.
 */
export function renameScenario(scenarios, id, newName) {
  const trimmedName = (newName || '').trim() || 'Untitled scenario'
  return scenarios.map((scenario) => (scenario.id === id ? { ...scenario, name: trimmedName } : scenario))
}
