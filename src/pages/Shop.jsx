import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'
import { getStartingPrice } from '../utils/productHelpers'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Shop() {
  useDocumentTitle('Shop All')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [activeCategory, setActiveCategory] = useState('all') // 'all' or a category id
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')

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

    return [...result].sort((a, b) => {
      const priceA = getStartingPrice(a) ?? 0
      const priceB = getStartingPrice(b) ?? 0
      if (sort === 'price-asc') return priceA - priceB
      if (sort === 'price-desc') return priceB - priceA
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      return 0
    })
  }, [products, activeCategory, query, sort])

  const chipClass = (isActive) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'border-orange-500 bg-orange-500 text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400'
    }`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Shop All Products</h1>

      {/* Category filter chips */}
      {!error && categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory('all')} className={chipClass(activeCategory === 'all')}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={chipClass(activeCategory === cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Search + sort */}
      {!loading && !error && products.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:max-w-xs sm:flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
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
