import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="flex flex-col rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <img
        src={product.image}
        alt={product.name}
        className="aspect-square w-full rounded-md object-cover"
      />
      <h3 className="mt-3 text-base sm:text-lg font-medium">{product.name}</h3>
      <p className="mt-1 text-sm sm:text-base text-gray-600">${product.price}</p>
    </Link>
  )
}
