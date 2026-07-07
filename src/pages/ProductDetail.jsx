import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct } from '../api/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useFly } from '../context/FlyContext'
import { getPrimaryImage, getActiveVariants, formatPrice } from '../utils/productHelpers'
import { getRating } from '../utils/rating'
import StarRating from '../components/StarRating'
import ProductReviews from '../components/ProductReviews'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { flyToNavIcon } = useFly()

  // Cart actions require an account. Send guests to login and bring them back
  // to this product page afterwards (matches the app's `from`-redirect pattern).
  function requireLogin() {
    toast('Please log in to continue.', { icon: '🔒', id: 'auth' })
    navigate('/login', { state: { from: location } })
  }
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

  // Price range across variants (shown before a variant is picked), rating, and
  // stock — for the upgraded product header.
  const variantPrices = activeVariants.map((v) => Number(v.price)).filter((n) => Number.isFinite(n))
  const minPrice = variantPrices.length ? Math.min(...variantPrices) : null
  const maxPrice = variantPrices.length ? Math.max(...variantPrices) : null
  const rating = getRating(product)
  const inStock = activeVariants.some((v) => Number(v.stock) > 0)

  // Confirmation toast with quick actions — the user stays on the page, but can
  // jump to the cart or check out this item without hunting for the nav icon.
  function notifyAdded(variant) {
    toast.custom(
      (t) => (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm text-green-600 dark:bg-green-500/15 dark:text-green-400">
            ✓
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Product added to cart</p>
            <div className="flex gap-4">
              <button
                onClick={() => { toast.dismiss(t.id); navigate('/cart') }}
                className="text-xs font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                View Cart
              </button>
              <button
                onClick={() => { toast.dismiss(t.id); navigate('/cart', { state: { buyNowVariantId: variant.id } }) }}
                className="text-xs font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      ),
      { id: 'cart', duration: 4000 }
    )
  }

  function handleAddToCart(e) {
    if (!selectedVariant) return
    if (!user) return requireLogin()
    // Ignore repeat clicks until the current add-fly lands.
    if (addingRef.current) return
    addingRef.current = true
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    // Fly the whole product image to the navbar cart, then add when it lands.
    const variant = selectedVariant
    const startRect = (productImageRef.current ?? e.currentTarget).getBoundingClientRect()
    flyToNavIcon({
      product,
      startRect,
      targetType: 'cart',
      onArrive: () => {
        addToCart(product, variant, quantity)
        notifyAdded(variant)
        addingRef.current = false
      },
    })
  }

  // Buy Now: add the item, then go to the cart with ONLY this product selected
  // so checkout targets just it. Awaited so the logged-in (server) cart has the
  // item before the cart page loads.
  async function handleBuyNow() {
    if (!selectedVariant || buying) return
    if (!user) return requireLogin()
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
        {/* Rating / stock meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {rating.count > 0 ? (
            <button
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            >
              <StarRating value={rating.value} count={rating.count} size="sm" />
              <span className="text-gray-500 underline-offset-2 hover:underline dark:text-slate-400">
                {rating.count} {rating.count === 1 ? 'review' : 'reviews'}
              </span>
            </button>
          ) : (
            <span className="text-gray-500 dark:text-slate-400">No ratings yet</span>
          )}
          <span className="text-gray-300 dark:text-slate-600">|</span>
          <span className={inStock ? 'font-medium text-green-600 dark:text-green-400' : 'font-medium text-red-500'}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        {/* Price */}
        <div className="rounded-lg bg-orange-50 px-4 py-3 dark:bg-orange-500/10">
          <p className="text-2xl font-bold text-orange-600 sm:text-3xl dark:text-orange-400">
            {selectedVariant
              ? formatPrice(selectedVariant.price)
              : minPrice == null
                ? 'Unavailable'
                : minPrice === maxPrice
                  ? formatPrice(minPrice)
                  : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
          </p>
          {!selectedVariant && minPrice != null && minPrice !== maxPrice && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Select options to see the exact price</p>
          )}
        </div>

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

        {/* Shipping & shopping guarantee */}
        <ul className="mt-4 flex flex-col gap-2.5 rounded-lg border border-gray-200 p-4 text-sm text-gray-600 dark:border-slate-800 dark:text-slate-300">
          <li className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5 text-orange-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-5.25m0-11.25h1.5m-1.5 0H8.25m0 0V5.625A1.125 1.125 0 019.375 4.5h9.75c.621 0 1.125.504 1.125 1.125v.375m0 0V9m0 0h-3.375" />
            </svg>
            Free shipping · Estimated delivery 3–7 business days
          </li>
          <li className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5 text-orange-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            7-day easy returns
          </li>
          <li className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5 text-orange-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Secure checkout · Protected payment
          </li>
        </ul>
      </div>
      </div>

      {/* Product specifications */}
      <section className="mt-10 border-t border-gray-200 pt-8 dark:border-slate-800">
        <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Product Specifications</h2>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ['Category', product.category?.name ?? '—'],
            ['Availability', inStock ? 'In stock' : 'Out of stock'],
            // SKU is variant-specific — only show it once a variant is picked.
            selectedVariant?.sku ? ['SKU', selectedVariant.sku] : null,
            ['Options', `${activeVariants.length} variant${activeVariants.length === 1 ? '' : 's'}`],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-gray-100 pb-2 dark:border-slate-800">
              <dt className="text-gray-500 dark:text-slate-400">{label}</dt>
              <dd className="text-right font-medium text-slate-800 dark:text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Product description */}
      {product.description && (
        <section className="mt-10 border-t border-gray-200 pt-8 dark:border-slate-800">
          <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Product Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-slate-300">{product.description}</p>
        </section>
      )}

      {/* Customer reviews (ratings summary + star filters) */}
      <div id="reviews" className="scroll-mt-24">
        <ProductReviews key={slug} slug={slug} product={product} />
      </div>
    </div>
  )
}
