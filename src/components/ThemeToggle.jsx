import { useEffect, useState } from 'react'

// Initial value mirrors the class the pre-paint script in index.html already set.
function getInitialDark() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

function SunIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  )
}

/**
 * Light/dark theme switch — a sliding pill with sun/moon affordances, styled
 * to sit on the dark navbar. Persists the choice and toggles the `dark` class
 * on <html> (which the pre-paint script in index.html already primed).
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('ecomify-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-slate-600 bg-slate-800 transition-colors hover:border-slate-500"
    >
      {/* Track affordances behind the knob. */}
      <SunIcon className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-amber-400/80" />
      <MoonIcon className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
      {/* Sliding knob showing the current mode. */}
      <span
        className={`z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition-transform duration-300 ${
          dark ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {dark ? <MoonIcon className="h-3 w-3" /> : <SunIcon className="h-3 w-3" />}
      </span>
    </button>
  )
}
