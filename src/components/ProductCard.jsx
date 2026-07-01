import { Link } from 'react-router-dom'
import { getPrimaryImage, getStartingPrice } from '../utils/productHelpers'

export default function ProductCard({ product }) {
  const price = getStartingPrice(product)

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={getPrimaryImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-base font-medium text-gray-900 sm:text-lg">{product.name}</h3>
        <p className="text-sm font-semibold text-gray-900 sm:text-base">
          {price !== null ? `From $${price.toFixed(2)}` : 'Unavailable'}
        </p>
      </div>
    </Link>
  )
}
