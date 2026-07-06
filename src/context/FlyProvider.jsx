import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FlyContext } from './FlyContext'
import { getPrimaryImage } from '../utils/productHelpers'

let flightId = 0

/**
 * A single floating product preview. It starts as a full-size copy of the
 * product image (startRect), then glides to the nav icon while shrinking,
 * rotating slightly, and fading near the end — a smooth "whole product flies
 * into the icon" effect. onDone runs the side effect + bumps the icon.
 */
function FlyingPreview({ flight, onDone }) {
  const { product, startRect, targetRect } = flight

  // Translate the image's center onto the icon's center.
  const dx = targetRect.left + targetRect.width / 2 - (startRect.left + startRect.width / 2)
  const dy = targetRect.top + targetRect.height / 2 - (startRect.top + startRect.height / 2)
  // Shrink from the product's own size down to roughly the nav icon size.
  const endScale = Math.min(0.35, Math.max(0.08, (targetRect.width * 1.4) / startRect.width))

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
      animate={{ x: dx, y: dy, scale: endScale, opacity: [1, 1, 0], rotate: 8 }}
      transition={{
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1], // smooth ease-out, no bounce
        opacity: { duration: 0.85, times: [0, 0.72, 1] }, // stay solid, fade at the end
      }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed',
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        transformOrigin: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
    >
      {/* getPrimaryImage falls back to the "No image" placeholder automatically. */}
      <img src={getPrimaryImage(product)} alt="" className="h-full w-full object-cover" />
    </motion.div>
  )
}

export function FlyProvider({ children }) {
  // DOM nodes of the navbar icons, keyed by target type ('wishlist' | 'cart').
  const targets = useRef({ wishlist: null, cart: null })
  const [flights, setFlights] = useState([])
  // Counters the navbar watches to pop/bounce an icon when an item lands.
  const [bump, setBump] = useState({ wishlist: 0, cart: 0 })

  // Navbar calls this to register (or clear) its icon nodes.
  const registerTarget = useCallback((type, node) => {
    targets.current[type] = node
  }, [])

  /**
   * Fly a product preview from startRect to the navbar icon for targetType,
   * then run onArrive. If the target isn't visible (e.g. hidden on mobile),
   * skip the animation and run onArrive immediately so nothing is lost.
   */
  const flyToNavIcon = useCallback(({ product, startRect, targetType, onArrive }) => {
    const node = targets.current[targetType]
    const targetRect = node?.getBoundingClientRect()
    if (!targetRect || targetRect.width === 0 || !startRect) {
      onArrive?.()
      setBump((b) => ({ ...b, [targetType]: b[targetType] + 1 }))
      return
    }
    const id = ++flightId
    setFlights((f) => [...f, { id, product, startRect, targetRect, targetType, onArrive }])
  }, [])

  const handleDone = useCallback((flight) => {
    flight.onArrive?.()
    setBump((b) => ({ ...b, [flight.targetType]: b[flight.targetType] + 1 }))
    setFlights((f) => f.filter((x) => x.id !== flight.id))
  }, [])

  return (
    <FlyContext.Provider value={{ flyToNavIcon, registerTarget, bump }}>
      {children}
      <AnimatePresence>
        {flights.map((flight) => (
          <FlyingPreview key={flight.id} flight={flight} onDone={() => handleDone(flight)} />
        ))}
      </AnimatePresence>
    </FlyContext.Provider>
  )
}
