import { useEffect, useState } from 'react'

/**
 * Like useState, but persists the value to localStorage under `key` and
 * restores it on mount. Falls back silently to `defaultValue` if
 * localStorage is unavailable (e.g. private browsing) or the stored value
 * fails to parse.
 */
export function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures (e.g. storage disabled/full) — state still
      // works for the current session, it just won't persist.
    }
  }, [key, value])

  return [value, setValue]
}
