import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import { getStartingPrice } from '../utils/productHelpers'
import { getRating } from '../utils/rating'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import CategoryGrid from '../components/CategoryGrid'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Shop() {
  useDocumentTitle('Shop All')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Pre-select a category when arriving from a Home chip (/shop?category=<id>).
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [activeCategory, setActiveCategory] = useState(
    categoryParam ? Number(categoryParam) : 'all'
  ) // 'all' or a category id
  // Product search is GLOBAL — it lives in the navbar and drives ?q=. We read it
  // reactively here (no duplicate shop search box) so a navbar search filters the
  // grid live. `?q=` is also used by "Buy Again" on the Orders page.
  const query = searchParams.get('q') ?? ''
  const [sort, setSort] = useState('default')

  // Clear the active navbar search (removes ?q=).
  function clearSearch() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    // Fetch both in parallel; the page still works if categories fail.
    Promise.all([getProducts(), getCategories().catch(() => [])])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData)
        setCategories(categoriesData)
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [])

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase()

    let result = products

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category?.id === activeCategory)
    }

    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search))
    }

    if (sort === 'default') return result

    // Newest: prefer a real created date, fall back to id (higher = newer).
    const newness = (p) => new Date(p.created_at ?? p.created ?? 0).getTime() || Number(p.id) || 0

    return [...result].sort((a, b) => {
      const priceA = getStartingPrice(a) ?? 0
      const priceB = getStartingPrice(b) ?? 0
      if (sort === 'price-asc') return priceA - priceB
      if (sort === 'price-desc') return priceB - priceA
      if (sort === 'rating') return getRating(b).value - getRating(a).value
      if (sort === 'newest') return newness(b) - newness(a)
      return 0
    })
  }, [products, activeCategory, query, sort])

  const chipClass = (isActive) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'border-orange-500 bg-orange-500 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400'
    }`

  return (
    <div className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-8 sm:py-14">
      {/* Sale promo banner (same image pattern as the home banners: real path
          first, existing project image as fallback so it's never empty). */}
      <div className="relative mb-8 h-36 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg sm:h-44">
        <img
          src="/images/banners/sale-essentials.png"
          alt=""
          aria-hidden="true"
          onError={(e) => {
            const img = e.currentTarget
            if (img.dataset.fellBack) { img.style.display = 'none'; return }
            img.dataset.fellBack = '1'
            img.src = '/images/categories/mens-apparel.jpg'
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/20" />
        <div className="relative z-10 flex h-full max-w-md flex-col items-start justify-center gap-1.5 px-6 sm:px-10">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Season Sale
          </span>
          <h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl">Up to 50% OFF</h2>
          <p className="text-sm text-white/85">Deals across every category — limited time only.</p>
        </div>
      </div>

      <h1 className="mb-6 scroll-mt-24 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Shop All Products</h1>

      {/* Category filter — same image grid as the home page; clicking a tile
          filters products in place (instead of navigating). */}
      {!error && categories.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button onClick={() => setActiveCategory('all')} className={chipClass(activeCategory === 'all')}>
              All Products
            </button>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Clear filter ✕
              </button>
            )}
          </div>
          <CategoryGrid
            categories={categories}
            activeId={activeCategory === 'all' ? null : activeCategory}
            onSelect={setActiveCategory}
            title={null}
            showViewAll={false}
          />
        </div>
      )}

      {/* Product toolbar — result count on the left, sort + filters on the right.
          (The product search is the navbar's global box; no duplicate here.) */}
      {!loading && !error && products.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{visibleProducts.length}</span>{' '}
              {visibleProducts.length === 1 ? 'product' : 'products'}
            </p>
            {query && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                Results for “{query}”
                <button onClick={clearSearch} aria-label="Clear search" className="text-orange-500 transition-colors hover:text-orange-700 dark:hover:text-orange-100">✕</button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="default">Sort: Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>

            <button
              type="button"
              onClick={() => toast('Filters coming soon — category, price, rating & availability.', { icon: '🔧', id: 'filters' })}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400">No products available yet — check back soon.</p>
      )}

      {!loading && !error && products.length > 0 && visibleProducts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400">No products match your filters.</p>
      )}

      {!loading && !error && visibleProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {visibleProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
