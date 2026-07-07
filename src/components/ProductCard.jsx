import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getPrimaryImage, getStartingPrice, getActiveVariants } from '../utils/productHelpers'
import { getRating } from '../utils/rating'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useFly } from '../context/FlyContext'
import StarRating from './StarRating'
import QuickViewModal from './QuickViewModal'

export default function ProductCard({ product, index = 0 }) {
  const price = getStartingPrice(product)
  const rating = getRating(product)
  const { isWished, toggleWishlist, addToWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { flyToNavIcon } = useFly()
  const imageRef = useRef(null)
  // Locks out extra clicks while an add-fly is in the air, so a rapid burst
  // launches ONE flight / ONE add instead of many.
  const addingRef = useRef(false)
  const addingCartRef = useRef(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const wished = isWished(product.id)

  function handleWishlist(e) {
    // Keep the heart from triggering the card's product link.
    e.preventDefault()
    e.stopPropagation()

    // Not logged in, or removing a favorite: no fly, just toggle.
    if (!user || wished) {
      toggleWishlist(product)
      return
    }
    // Ignore repeat clicks until the current add-fly lands.
    if (addingRef.current) return
    addingRef.current = true
    // Adding: fly the whole product image to the navbar heart, then add on land.
    const startRect = (imageRef.current ?? e.currentTarget).getBoundingClientRect()
    flyToNavIcon({
      product,
      startRect,
      targetType: 'wishlist',
      onArrive: () => {
        addToWishlist(product)
        addingRef.current = false
      },
    })
  }

  // Add to Cart straight from the card. If the product has exactly one variant
  // we can add it directly (with the fly animation); otherwise the shopper must
  // pick size/color, so we open Quick View instead.
  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    const variants = getActiveVariants(product)
    if (variants.length !== 1) {
      setQuickOpen(true)
      return
    }
    if (addingCartRef.current) return
    addingCartRef.current = true
    const variant = variants[0]
    const startRect = (imageRef.current ?? e.currentTarget).getBoundingClientRect()
    flyToNavIcon({
      product,
      startRect,
      targetType: 'cart',
      onArrive: () => {
        addToCart(product, variant, 1)
        toast.success('Added to cart', { id: 'cart' })
        addingCartRef.current = false
      },
    })
  }

  function openQuickView(e) {
    e.preventDefault()
    e.stopPropagation()
    setQuickOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(index, 11) * 0.06 }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:border-orange-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-orange-500/40 dark:hover:shadow-black/40"
    >
      <button
        onClick={handleWishlist}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wished}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition-transform hover:scale-110 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wished ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.8}
          className={`h-5 w-5 transition-colors ${wished ? 'text-orange-500' : 'text-gray-500 dark:text-slate-400'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div ref={imageRef} className="aspect-square overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={getPrimaryImage(product)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1.5 p-4 pb-2">
          <h3 className="line-clamp-1 text-base font-medium text-gray-900 sm:text-lg dark:text-slate-100">{product.name}</h3>
          <StarRating value={rating.value} count={rating.count} />
          <p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-slate-100">
            {price !== null ? `From $${price.toFixed(2)}` : 'Unavailable'}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-1">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          disabled={price === null}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Add to Cart
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openQuickView}
          aria-label="Quick view"
          title="Quick view"
          className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      </div>

      <QuickViewModal open={quickOpen} product={product} onClose={() => setQuickOpen(false)} />
    </motion.div>
  )
}
