import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Shopee-style floating promo widget, pinned to the bottom-right corner.
// Clickable (routes to the shop) with a close button. Dismissal is remembered
// for the session so it doesn't nag on every page.
//
// NOTE: filenames/paths deliberately avoid the words "ad"/"ads"/"pop-up" —
// ad-blocker extensions block those URLs (ERR_BLOCKED_BY_CLIENT), which would
// break the whole page.
const PROMO_IMG = '/images/promo-widget.jpg'
const PROMO_HREF = '/shop'
const STORAGE_KEY = 'ecomify-promo-widget-dismissed'

function dismissedThisSession() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function PromoWidget() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // Slide in shortly after load, unless already dismissed this session.
  useEffect(() => {
    if (dismissedThisSession()) return
    const t = setTimeout(() => setOpen(true), 1400)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 48 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-1/4 right-10 z-40 w-28 sm:w-36"
        >
          {/* Inner wrapper does the continuous "breathing" pulse — grows and
              shrinks a little on a loop (kept separate from the outer slide-in
              so the transforms don't fight). */}
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Close (X) — red badge on the corner, like Shopee */}
            <button
              onClick={dismiss}
              aria-label="Close promotion"
              className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md ring-2 ring-white transition-colors hover:bg-red-600 dark:ring-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Promo image (clickable) */}
            <button
              onClick={() => navigate(PROMO_HREF)}
              aria-label="View promotion"
              className="block w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10 transition-transform hover:scale-[1.03]"
            >
              <img src={PROMO_IMG} alt="Ecomify promotion" className="block w-full" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
