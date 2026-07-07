/**
 * Product ratings.
 *
 * The backend doesn't expose ratings yet, so this uses real fields when they
 * exist (`rating`/`average_rating`, `review_count`) and otherwise derives a
 * STABLE pseudo-rating from the product id — stable so it doesn't flicker
 * between renders and reads as a populated store.
 *
 * TODO(backend): once the API returns ratings, the pseudo branch can go and
 * this simply passes through `product.rating` / `product.review_count`.
 */
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getRating(product) {
  const real = product?.rating ?? product?.average_rating
  if (real != null && !Number.isNaN(Number(real))) {
    return {
      value: Number(real),
      count: Number(product?.review_count ?? product?.reviews_count ?? 0),
      placeholder: false,
    }
  }
  const seed =
    Number(product?.id) || hashString(String(product?.slug || product?.name || 'product'))
  const value = 3.8 + ((seed * 7) % 12) / 10 // 3.8 – 4.9
  const count = 12 + ((seed * 13) % 240) // 12 – 251
  return { value: Math.round(value * 10) / 10, count, placeholder: true }
}
