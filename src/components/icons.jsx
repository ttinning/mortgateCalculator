/**
 * Minimal set of inline SVG icons used across the app's header/navigation.
 * Kept dependency-free (no icon library) to avoid bundle bloat — each icon
 * is a tiny stroke-based SVG in the Heroicons-outline style.
 */

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.8,
  stroke: 'currentColor',
}

export function HouseIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 9.75V19.5a1.5 1.5 0 0 0 1.5 1.5h3.75v-6.75h4.5V21H18a1.5 1.5 0 0 0 1.5-1.5V9.75"
      />
    </svg>
  )
}

export function ScaleIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v18m0-18-3.75 3.75M12 3l3.75 3.75M4.5 8.25h5.25m-5.25 0L2.25 13.5a2.625 2.625 0 0 0 5.007 1.128M9.75 8.25 7.257 14.628M14.25 8.25h5.25m-5.25 0 2.243 6.378a2.625 2.625 0 0 0 5.007-1.128L19.5 8.25M14.25 8.25 16.743 14.628M9 21h6"
      />
    </svg>
  )
}

export function LandmarkIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M4.5 21V10.5m3.75 10.5V10.5m3.75 10.5V10.5m3.75 10.5V10.5M19.5 21V10.5M2.25 10.5 12 3.75l9.75 6.75H2.25Z"
      />
    </svg>
  )
}

export function PiggyBankIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6a7.5 7.5 0 0 0-7.5 7.5c0 1.61.52 3.1 1.402 4.31L4.5 21h3.19l1.06-1.417A7.47 7.47 0 0 0 12 20.25c1.107 0 2.15-.257 3.078-.714L16.5 21h3l-1.5-3a7.47 7.47 0 0 0 1.5-4.5c0-.51-.052-1.008-.15-1.49M12 6a7.48 7.48 0 0 1 4.35 1.402M12 6c.5-1.5 1.5-2.25 2.25-2.25.621 0 .75.5.75 1.125 0 .414-.168.75-.375 1.125"
      />
      <circle cx="9.75" cy="12.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RefreshIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  )
}

export function SunIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  )
}

export function MoonIcon({ className }) {
  return (
    <svg {...defaultProps} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  )
}
