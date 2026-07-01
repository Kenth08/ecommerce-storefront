import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'
import { getPrimaryImage, getActiveVariants } from '../utils/productHelpers'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="p-8 text-center text-gray-600">Loading...</p>

  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <p>{error || 'Product not found.'}</p>
        <Link to="/" className="text-blue-600 underline">Back to shop</Link>
      </div>
    )
  }

  const activeVariants = getActiveVariants(product)
  const sizes = [...new Set(activeVariants.map((v) => v.size))]
  const colors = [...new Set(
    activeVariants
      .filter((v) => !selectedSize || v.size === selectedSize)
      .map((v) => v.color)
  )]
  const selectedVariant = activeVariants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  )

  function handleAddToCart() {
    if (!selectedVariant) return
    addToCart(product, selectedVariant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:flex-row sm:gap-10 sm:p-8">
      <img
        src={getPrimaryImage(product)}
        alt={product.name}
        className="aspect-square w-full rounded-lg object-cover sm:w-1/2"
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
        <p className="text-lg text-gray-700 sm:text-xl">
          {selectedVariant ? `$${selectedVariant.price}` : 'Select options'}
        </p>

        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-1 flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setSelectedColor(null) }}
                className={`rounded border px-3 py-1 text-sm ${
                  selectedSize === size ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {selectedSize && (
          <div>
            <p className="text-sm font-medium">Color</p>
            <div className="mt-1 flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`rounded border px-3 py-1 text-sm ${
                    selectedColor === color ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && (
          <p className="text-sm text-gray-500">
            {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="mt-4 w-full rounded-md bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-fit"
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
