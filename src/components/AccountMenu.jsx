import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

// Menu entries live in one array so desktop + (future) reuse stay in sync.
const ITEMS = [
  {
    to: '/profile',
    label: 'Profile',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    to: '/orders',
    label: 'My Orders',
    icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z',
  },
  {
    to: '/addresses',
    label: 'Addresses',
    icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

function MenuIcon({ d }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
      className="h-5 w-5 shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

/**
 * Account dropdown for the (authenticated) desktop navbar.
 * Replaces the old standalone Logout button: shows Profile / My Orders /
 * Addresses / Settings and Logout. Closes on outside-click, Escape, or when
 * an item is chosen. `onLogout` reuses the navbar's confirm-then-logout flow.
 */
export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Initial for the avatar placeholder: first letter of name, else email.
  const initial = (user?.full_name || user?.name || user?.email || 'U').trim().charAt(0).toUpperCase()

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    // Close on scroll — the panel is anchored to the button, so it shouldn't
    // drift with the page.
    function onScroll() {
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  const itemClass =
    'flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:hover:text-orange-400'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-gray-200 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-sm font-bold text-white">
          {initial}
        </span>
        <span className="text-sm font-medium">My Account</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-800"
          >
            {/* Header: who's signed in. */}
            <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">My Account</p>
              {user?.email && (
                <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
              )}
            </div>

            <div className="py-1">
              {ITEMS.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                  <MenuIcon d={item.icon} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Appearance — theme toggle lives here instead of the navbar. */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 dark:border-slate-700">
              <span className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <MenuIcon d="M12 3v18M12 3a9 9 0 010 18 9 9 0 010-18z" />
                Appearance
              </span>
              <ThemeToggle />
            </div>

            <div className="border-t border-gray-100 py-1 dark:border-slate-700">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-5 w-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
