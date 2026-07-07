import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const PROMO_IMG = '/images/promos/ecomify-daily-deals-popup.png'
const PROMO_HREF = '/shop?promo=daily-deals'
const STORAGE_KEY = 'ecomify-promo-seen'

// Show once per SESSION. sessionStorage clears when the tab/browser is closed,
// so the popup reappears on the next visit — but not on a plain refresh within
// the same session.
function seenThisSession() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function PromoPopup() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // Show 1s after the page loads (unless already seen this session).
  useEffect(() => {
    if (seenThisSession()) return
    const t = setTimeout(() => setOpen(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function remember() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  function dismiss() {
    remember()
    setOpen(false)
  }

  function go() {
    remember()
    setOpen(false)
    navigate(PROMO_HREF)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dark, blurred backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />

          {/* Popup */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ecomify promotion"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-[90%] max-w-sm overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-orange-500/30 sm:max-w-md"
          >
            {/* Close X */}
            <button
              onClick={dismiss}
              aria-label="Close promotion"
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Promo image (clickable) */}
            <button onClick={go} className="block w-full" aria-label="Shop the daily deals">
              <img
                src={PROMO_IMG}
                alt="Ecomify daily deals"
                className="block max-h-[70vh] w-full object-contain"
              />
            </button>

            {/* CTA overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black/70 via-black/20 to-transparent p-4">
              <button
                onClick={go}
                className="pointer-events-auto rounded-full bg-orange-500 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-orange-600"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
