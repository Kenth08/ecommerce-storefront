import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { getPrimaryImage, getStartingPrice } from '../utils/productHelpers'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useFly } from '../context/FlyContext'

export default function ProductCard({ product, index = 0 }) {
  const price = getStartingPrice(product)
  const { isWished, toggleWishlist, addToWishlist } = useWishlist()
  const { user } = useAuth()
  const { flyToNavIcon } = useFly()
  const imageRef = useRef(null)
  // Locks out extra clicks while an add-fly is in the air, so a rapid burst
  // launches ONE flight / ONE add instead of many.
  const addingRef = useRef(false)
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

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}
      className="group relative flex animate-fade-in-up flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-black/40"
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
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-base font-medium text-gray-900 sm:text-lg dark:text-slate-100">{product.name}</h3>
          <p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-slate-100">
            {price !== null ? `From $${price.toFixed(2)}` : 'Unavailable'}
          </p>
        </div>
      </Link>
    </div>
  )
}
