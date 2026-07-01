import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  return (
    <div>
      <section className="bg-gray-100 px-4 py-12 text-center sm:px-8 sm:py-20">
        <h1 className="text-2xl font-bold sm:text-4xl">
          Shop the Latest Essentials
        </h1>
        <p className="mt-3 text-sm text-gray-600 sm:text-base">
          Quality products, delivered fast.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-8 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
