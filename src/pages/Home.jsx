import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Hero from '../components/Hero'
import CategoryGrid from '../components/CategoryGrid'
import useDocumentTitle from '../hooks/useDocumentTitle'

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
      <Hero />

      {/* Shop by category — Shopee-style image grid, placed high like a storefront's primary nav */}
      {!loading && !error && categories.length > 0 && (
        <CategoryGrid categories={categories} />
      )}

      {/* Featured products */}
      <section id="featured" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-8 sm:py-16">
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
