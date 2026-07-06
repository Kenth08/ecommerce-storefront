import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useFly } from '../context/FlyContext'
import { getPrimaryImage, getActiveVariants } from '../utils/productHelpers'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()
  const { flyToNavIcon } = useFly()
  const productImageRef = useRef(null)
  // Locks out extra clicks while an add-fly is in the air, so a rapid burst
  // adds the item once instead of stacking quantity.
  const addingRef = useRef(false)

  // Return to the previous page; fall back to Shop on a direct load (no history).
  function handleBack() {
    if (location.key === 'default') navigate('/shop')
    else navigate(-1)
  }
  const { isWished, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [added, setAdded] = useState(false)
  const [buying, setBuying] = useState(false)
  const [prevSlug, setPrevSlug] = useState(slug)

  useDocumentTitle(product?.name)

  // Reset per-product state when navigating to a different product.
  // Done during render (React's recommended pattern) rather than in an effect.
  if (slug !== prevSlug) {
    setPrevSlug(slug)
    setProduct(null)
    setError(null)
    setLoading(true)
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)
    setActiveImageIdx(0)
  }

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:flex-row sm:gap-10 sm:p-8">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 sm:w-1/2" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-14 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-12 w-full animate-pulse rounded-md bg-gray-200 dark:bg-slate-700 sm:w-40" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <p className="mb-2 text-gray-700 dark:text-slate-300">{error || 'Product not found.'}</p>
        <Link to="/shop" className="font-medium text-orange-600 hover:text-orange-700">Back to shop</Link>
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

  // Full image list for the gallery; fall back to a single primary image.
  const galleryImages =
    product.images?.length > 0
      ? product.images.map((img) => img.image)
      : [getPrimaryImage(product)]
  const mainImage = galleryImages[activeImageIdx] ?? galleryImages[0]

  const maxQuantity = selectedVariant?.stock ?? 1

  function handleAddToCart(e) {
    if (!selectedVariant) return
    // Ignore repeat clicks until the current add-fly lands.
    if (addingRef.current) return
    addingRef.current = true
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    // Fly the whole product image to the navbar cart, then add when it lands.
    const startRect = (productImageRef.current ?? e.currentTarget).getBoundingClientRect()
    flyToNavIcon({
      product,
      startRect,
      targetType: 'cart',
      onArrive: () => {
        addToCart(product, selectedVariant, quantity)
        toast.success(`${quantity} × ${product.name} added to cart`, { id: 'cart' })
        addingRef.current = false
      },
    })
  }

  // Buy Now: add the item, then go to the cart with ONLY this product selected
  // so checkout targets just it. Awaited so the logged-in (server) cart has the
  // item before the cart page loads.
  async function handleBuyNow() {
    if (!selectedVariant || buying) return
    setBuying(true)
    try {
      await addToCart(product, selectedVariant, quantity)
      navigate('/cart', { state: { buyNowVariantId: selectedVariant.id } })
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <button
        onClick={handleBack}
        className="group mb-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
        <Link to="/" className="hover:text-orange-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-orange-600">Shop</Link>
        {product.category?.name && (
          <>
            <span>/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="max-w-48 truncate font-medium text-gray-700 dark:text-slate-300">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        {/* Gallery */}
        <div className="sm:w-1/2">
          <img
            ref={productImageRef}
            src={mainImage}
            alt={product.name}
            className="aspect-square w-full rounded-lg object-cover"
          />
          {galleryImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    idx === activeImageIdx ? 'border-orange-500' : 'border-transparent hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <button
            onClick={() => toggleWishlist(product)}
            aria-label={isWished(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWished(product.id)}
            className="mt-1 shrink-0 rounded-full border border-gray-200 p-2 transition-transform hover:scale-110 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isWished(product.id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.8}
              className={`h-6 w-6 transition-colors ${isWished(product.id) ? 'text-orange-500' : 'text-gray-500 dark:text-slate-400'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
        <p className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-slate-100">
          {selectedVariant ? `$${selectedVariant.price}` : 'Select options'}
        </p>

        {product.description && (
          <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{product.description}</p>
        )}

        {activeVariants.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            This product is currently unavailable — no sizes or colors have been added yet. Please check back soon.
          </div>
        ) : (
          <>
        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-1 flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setSelectedColor(null) }}
                className={`rounded border px-3 py-1 text-sm ${
                  selectedSize === size ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 dark:border-slate-600'
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
                    selectedColor === color ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 dark:border-slate-600'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVariant && (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
          </p>
        )}

        {selectedVariant && selectedVariant.stock > 0 && (
          <div>
            <p className="text-sm font-medium">Quantity</p>
            <div className="mt-1 inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Increase quantity"
                className="px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0 || buying}
            className={`w-full rounded-md px-6 py-3 font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-1 ${
              added ? 'scale-105 bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock === 0 || buying}
            className="w-full rounded-md border border-slate-900 bg-slate-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-1 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {buying ? 'Processing…' : 'Buy Now'}
          </button>
        </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
