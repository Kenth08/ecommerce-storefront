import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="bg-slate-900 px-4 py-20 text-center text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Shop the Latest Essentials
          </h1>
          <p className="mt-4 text-base text-gray-300 sm:text-lg">
            Quality products, delivered fast.
          </p>
          <a
            href="#products"
            className="mt-8 inline-block rounded-md bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600 sm:text-base"
          >
            Shop Now
          </a>
        </div>
      </section>

      <div id="products" className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        {loading && <p className="text-center text-gray-600">Loading products...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500">No products available yet — check back soon.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
