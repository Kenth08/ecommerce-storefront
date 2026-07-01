import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((p) => p.id === Number(id))
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)


  if (!product) {
    return (
      <div className="p-8 text-center">
        <p>Product not found.</p>
        <Link to="/" className="text-blue-600 underline">Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:flex-row sm:gap-10 sm:p-8">
      <img
        src={product.image}
        alt={product.name}
        className="aspect-square w-full rounded-lg object-cover sm:w-1/2"
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
                <p className="text-lg text-gray-700 sm:text-xl">${product.price}</p>
              <button
          onClick={() => {
            addToCart(product)
            setAdded(true)
            setTimeout(() => setAdded(false), 1500)
          }}
          className="mt-4 w-full rounded-md bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800 sm:w-fit"
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>

      </div>
    </div>
  )
}
