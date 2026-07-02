import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'
import { getPrimaryImage, getActiveVariants } from '../utils/productHelpers'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [added, setAdded] = useState(false)

  useDocumentTitle(product?.name)

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:flex-row sm:gap-10 sm:p-8">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 sm:w-1/2" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-12 w-full animate-pulse rounded-md bg-gray-200 sm:w-40" />
        </div>
      </div>
    )
  }

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
    toast.success(`${product.name} added to cart`)
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
          className={`mt-4 w-full rounded-md px-6 py-3 font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-fit ${
            added ? 'scale-105 bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
