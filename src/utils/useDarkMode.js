import { useEffect } from 'react'
import { useLocalStorageState } from './useLocalStorageState'

/**
 * Tracks dark/light theme preference, persisted to localStorage and
 * defaulting to the user's OS-level preference on first visit. Applies the
 * `dark` class to the <html> element so Tailwind's `dark:` variants apply.
 */
export function useDarkMode() {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false

  const [isDark, setIsDark] = useLocalStorageState('mortgage-calculator:dark-mode', prefersDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return [isDark, setIsDark]
}
