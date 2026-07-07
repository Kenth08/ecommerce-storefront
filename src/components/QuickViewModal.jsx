import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getPrimaryImage, getActiveVariants } from '../utils/productHelpers'
import { getRating } from '../utils/rating'
import StarRating from './StarRating'

/**
 * Quick View modal — a lightweight preview of a product without leaving the
 * grid. Opens instantly with the list data we already have, then fetches the
 * full product (description / gallery) in the background. Mirrors the
 * ProductDetail add-to-cart / buy-now logic so behaviour stays consistent.
 */
export default function QuickViewModal({ open, product, onClose }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isWished, toggleWishlist } = useWishlist()

  // Start from the passed product; enrich with full detail once fetched.
  const [detail, setDetail] = useState(product)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [added, setAdded] = useState(false)
  const [buying, setBuying] = useState(false)
  const [wasOpen, setWasOpen] = useState(false)

  // Reset selections each time the modal opens. Done during render (React's
  // recommended pattern) rather than in an effect, so state stays in sync
  // without an extra commit.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDetail(product)
      setSelectedSize(null)
      setSelectedColor(null)
      setAdded(false)
    }
  }

  // Fetch the full product (description / gallery) in the background on open.
  useEffect(() => {
    if (!open || !product?.slug) return
    getProduct(product.slug)
      .then(setDetail)
      .catch(() => {}) // keep the list data on failure
  }, [open, product?.slug])

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!product) return null

  const activeVariants = getActiveVariants(detail)
  const sizes = [...new Set(activeVariants.map((v) => v.size).filter(Boolean))]
  const colors = [
    ...new Set(
      activeVariants
        .filter((v) => !selectedSize || v.size === selectedSize)
        .map((v) => v.color)
        .filter(Boolean)
    ),
  ]
  // Single variant (or no size/color axes) -> auto-select so the buttons work.
  const selectedVariant =
    activeVariants.length === 1
      ? activeVariants[0]
      : activeVariants.find(
          (v) => (!sizes.length || v.size === selectedSize) && (!colors.length || v.color === selectedColor)
        )

  const rating = getRating(detail)
  const image = getPrimaryImage(detail)
  const wished = isWished(detail.id)

  function confirmToast() {
    toast.custom(
      (t) => (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm text-green-600 dark:bg-green-500/15 dark:text-green-400">
            ✓
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Added to cart</p>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/cart')
              }}
              className="text-left text-xs font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400"
            >
              View Cart
            </button>
          </div>
        </div>
      ),
      { id: 'cart', duration: 4000 }
    )
  }

  function handleAddToCart() {
    if (!selectedVariant) return
    addToCart(detail, selectedVariant, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    confirmToast()
  }

  async function handleBuyNow() {
    if (!selectedVariant || buying) return
    setBuying(true)
    try {
      await addToCart(detail, selectedVariant, 1)
      onClose()
      navigate('/cart', { state: { buyNowVariantId: selectedVariant.id } })
    } finally {
      setBuying(false)
    }
  }

  const chip = (active) =>
    `rounded-md border px-3 py-1 text-sm transition-colors ${
      active
        ? 'border-orange-500 bg-orange-500 text-white'
        : 'border-gray-300 text-gray-700 hover:border-orange-400 dark:border-slate-600 dark:text-slate-300'
    }`

  // Portal to <body> so the fixed overlay escapes ProductCard's transformed
  // (Framer Motion) ancestor — otherwise `fixed` anchors to the card, not the
  // viewport, and the modal renders clipped inside the card before snapping to
  // center (the "flash").
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${detail.name}`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:flex-row"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-1.5 text-gray-600 shadow transition-colors hover:bg-white hover:text-gray-900 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="shrink-0 bg-gray-100 dark:bg-slate-800 sm:w-1/2">
              <img src={image} alt={detail.name} className="h-56 w-full object-cover sm:h-full" />
            </div>

            {/* Details */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{detail.name}</h2>
              <StarRating value={rating.value} count={rating.count} size="md" />

              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedVariant
                  ? `$${Number(selectedVariant.price).toFixed(2)}`
                  : sizes.length || colors.length
                    ? 'Select options'
                    : 'Unavailable'}
              </p>

              {detail.description && (
                <p className="line-clamp-4 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                  {detail.description}
                </p>
              )}

              {activeVariants.length === 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  This product is currently unavailable.
                </p>
              )}

              {sizes.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setSelectedColor(null)
                        }}
                        className={chip(selectedSize === size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSize && colors.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={chip(selectedColor === color)}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    added ? 'bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || buying}
                  className="flex-1 rounded-lg border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {buying ? 'Processing…' : 'Buy Now'}
                </motion.button>
                <button
                  onClick={() => toggleWishlist(detail)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={wished}
                  className="flex items-center justify-center rounded-lg border border-gray-300 p-2.5 transition-colors hover:border-orange-400 dark:border-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} className={`h-5 w-5 ${wished ? 'text-orange-500' : 'text-gray-500 dark:text-slate-400'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              <Link
                to={`/product/${detail.slug}`}
                onClick={onClose}
                className="pt-1 text-center text-xs font-medium text-gray-500 transition-colors hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 sm:text-left"
              >
                View full details →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
