import { useEffect, useState } from 'react'
import { getProductReviews } from '../api/reviews'
import StarRating from './StarRating'

// Mask the reviewer's email for privacy: "ke****@gmail.com".
function maskName(email) {
  if (!email) return 'Verified buyer'
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`
}

function initialOf(email) {
  return (email || 'U').trim().charAt(0).toUpperCase()
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

// A ReviewImage may come back as a url string or an object — read defensively.
function imageSrc(img) {
  if (!img) return null
  return typeof img === 'string' ? img : img.image || img.url || null
}

/**
 * Shopee-style product ratings: a summary box (big average + star-filter chips)
 * followed by individual review rows with avatar, stars, variation, date,
 * comment, and photo thumbnails.
 */
export default function ProductReviews({ slug, product }) {
  const [reviews, setReviews] = useState([])
  const [starFilter, setStarFilter] = useState(0) // 0 = all
  const [mediaOnly, setMediaOnly] = useState(false)

  // Parent passes key={slug}, so this component remounts per product and state
  // (reviews/filters) resets naturally — the effect only needs to fetch.
  useEffect(() => {
    let active = true
    getProductReviews(slug)
      .then((data) => { if (active) setReviews(data) })
      .catch(() => {})
    return () => { active = false }
  }, [slug])

  const reviewCount = Number(product?.review_count ?? 0)
  const avg = Number(product?.average_rating ?? 0)

  // Star counts from the loaded reviews (index 1–5).
  const counts = [0, 0, 0, 0, 0, 0]
  reviews.forEach((r) => {
    const s = Math.round(Number(r.rating))
    if (s >= 1 && s <= 5) counts[s] += 1
  })
  const withMedia = reviews.filter((r) => (r.images?.length ?? 0) > 0).length

  const filtered = reviews.filter((r) => {
    if (starFilter && Math.round(Number(r.rating)) !== starFilter) return false
    if (mediaOnly && !(r.images?.length > 0)) return false
    return true
  })

  const chip = (active) =>
    `rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
      active
        ? 'border-orange-500 bg-white text-orange-600 dark:bg-slate-800 dark:text-orange-400'
        : 'border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500 dark:border-slate-600 dark:text-slate-300 dark:hover:border-orange-400'
    }`

  return (
    <section className="mt-10 border-t border-gray-200 pt-8 dark:border-slate-800">
      <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Product Ratings</h2>

      {/* Summary box */}
      <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-5 dark:border-orange-500/20 dark:bg-orange-500/5 sm:flex sm:items-center sm:gap-8">
        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1">
          <div className="flex items-baseline gap-1 text-orange-600 dark:text-orange-400">
            <span className="text-4xl font-bold">{avg.toFixed(1)}</span>
            <span className="text-lg text-gray-400 dark:text-slate-500">/ 5</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-center">
            <StarRating value={avg} size="md" showCount={false} />
            <span className="text-xs text-gray-500 dark:text-slate-400">{reviewCount} ratings</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          <button onClick={() => { setStarFilter(0); setMediaOnly(false) }} className={chip(starFilter === 0 && !mediaOnly)}>
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s} onClick={() => { setStarFilter(s); setMediaOnly(false) }} className={chip(starFilter === s)}>
              {s} Star ({counts[s]})
            </button>
          ))}
          <button onClick={() => { setMediaOnly((v) => !v); setStarFilter(0) }} className={chip(mediaOnly)}>
            With Media ({withMedia})
          </button>
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-slate-400">
          This product hasn’t been reviewed yet. Reviews appear here once verified buyers rate it.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-slate-400">No reviews match this filter.</p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-gray-100 dark:divide-slate-800">
          {filtered.map((r) => (
            <li key={r.id} className="flex gap-3 py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {initialOf(r.user_email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{maskName(r.user_email)}</p>
                <div className="mt-0.5">
                  <StarRating value={Number(r.rating)} size="sm" showCount={false} />
                </div>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  {formatDate(r.created_at)}
                  {(r.size || r.color) && (
                    <span className="ml-2">Variation: {[r.size, r.color].filter(Boolean).join(', ')}</span>
                  )}
                </p>
                {r.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-slate-300">{r.comment}</p>
                )}
                {r.images?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((img, i) => {
                      const src = imageSrc(img)
                      return src ? (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-slate-700"
                        />
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
