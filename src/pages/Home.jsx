import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Carousel from '../components/Carousel'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Replace `bg` gradients with `image: '<banner-url>'` once real banners are ready.
const heroSlides = [
  {
    bg: 'bg-gradient-to-r from-slate-900 to-slate-700',
    title: 'Shop the Latest Essentials',
    subtitle: 'Quality products, delivered fast.',
    ctaLabel: 'Shop Now',
    ctaHref: '#featured',
  },
  {
    bg: 'bg-gradient-to-r from-orange-600 to-orange-400',
    title: 'Deals You Will Love',
    subtitle: 'Fresh arrivals at unbeatable prices.',
    ctaLabel: 'Browse Products',
    ctaHref: '#featured',
  },
  {
    bg: 'bg-gradient-to-r from-slate-800 to-orange-700',
    title: 'Free Shipping on Every Order',
    subtitle: 'No minimum spend, no hidden fees.',
    ctaLabel: 'Start Shopping',
    ctaHref: '#featured',
  },
]

const trustBadges = [
  {
    title: 'Free Shipping',
    subtitle: 'On every order, no minimum',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-5.25m0-11.25h1.5m-1.5 0H8.25m0 0V5.625A1.125 1.125 0 019.375 4.5h9.75c.621 0 1.125.504 1.125 1.125v.375m0 0V9m0 0h-3.375',
  },
  {
    title: 'Secure Checkout',
    subtitle: 'Your data is protected',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Easy Returns',
    subtitle: '30-day hassle-free returns',
    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
  },
]

export default function Home() {
  useDocumentTitle('Home')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Categories are a nice-to-have; the page still works if they fail.
    Promise.all([getProducts(), getCategories().catch(() => [])])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData)
        setCategories(categoriesData)
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [])

  const featured = products.slice(0, 8)

  return (
    <div>
      <Carousel slides={heroSlides} />

      {/* Trust badges */}
      <section className="border-b border-gray-100 dark:border-slate-800">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-8">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{badge.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category — placed high, like a storefront's primary nav */}
      {!loading && !error && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-8 sm:pt-16">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Shop by Category</h2>
            <Link
              to="/shop"
              className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to="/shop"
                className="group flex h-20 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-center text-sm font-medium text-slate-700 transition-all hover:border-orange-300 hover:text-orange-600 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section id="featured" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Featured Products</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Hand-picked favourites for you.</p>
          </div>
          <Link
            to="/shop"
            className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            View all →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && featured.length === 0 && (
          <p className="text-center text-gray-500 dark:text-slate-400">No products available yet — check back soon.</p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="bg-slate-900 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to find your next favourite?</h2>
          <p className="max-w-md text-sm text-slate-300">
            Browse the full catalogue and enjoy free shipping on everything.
          </p>
          <Link
            to="/shop"
            className="mt-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Explore all products
          </Link>
        </div>
      </section>
    </div>
  )
}
