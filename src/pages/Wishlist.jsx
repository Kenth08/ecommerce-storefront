import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts } from '../api/products'
import { getActiveVariants } from '../utils/productHelpers'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Wishlist() {
  useDocumentTitle('My Wishlist')
  const { items, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  // Recommendations so the page never feels empty with just 1–2 saved items.
  const [recommended, setRecommended] = useState([])
  useEffect(() => {
    getProducts()
      .then((all) => setRecommended(all))
      .catch(() => setRecommended([]))
  }, [])

  function moveAllToCart() {
    let added = 0
    items.forEach((p) => {
      const variant = getActiveVariants(p)[0]
      if (variant) {
        addToCart(p, variant, 1)
        added += 1
      }
    })
    if (added === 0) {
      toast('These items have no available options right now.')
      return
    }
    clearWishlist()
    toast.success(`Moved ${added} item${added === 1 ? '' : 's'} to cart`)
    navigate('/cart')
  }

  // ---- Empty state --------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-orange-500 dark:text-orange-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your wishlist is empty</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Save products you love and find them here later.</p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  // ---- Wishlist -----------------------------------------------------------
  const wishedIds = new Set(items.map((p) => p.id))
  const recos = recommended.filter((p) => !wishedIds.has(p.id)).slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      {/* Header + actions */}
      <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          My Wishlist <span className="text-base font-normal text-gray-500 dark:text-slate-400">({items.length})</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={moveAllToCart}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Move all to cart
          </button>
          <button
            onClick={clearWishlist}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-500/60 dark:hover:text-red-400"
          >
            Clear wishlist
          </button>
          <Link
            to="/shop"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {/* You may also like */}
      {recos.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {recos.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
