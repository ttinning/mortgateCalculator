import '@testing-library/jest-dom'

// jsdom doesn't implement ResizeObserver, but Recharts' ResponsiveContainer
// requires it to measure its container — provide a harmless no-op mock.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement matchMedia, but useDarkMode() (and any
// prefers-color-scheme detection) relies on it — provide a minimal mock.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
