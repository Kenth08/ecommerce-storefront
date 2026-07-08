import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPrimaryImage, getSoldCount, formatCompact } from '../utils/productHelpers'

/**
 * Shopee-style "Top Products" strip: best-selling products ranked by units sold,
 * each with a TOP ribbon and a sold-count bar. The row scrolls horizontally —
 * swipe on mobile, or click the prev/next arrows on desktop (same mechanics as
 * the category grid) — so shoppers can browse past the first few.
 *
 * Ranking uses `getSoldCount`, which reads a real backend sales field when
 * present and otherwise falls back to a stable placeholder (see productHelpers).
 */
export default function TopProducts({ products, limit = 12 }) {
  const top = [...products]
    .sort((a, b) => getSoldCount(b) - getSoldCount(a))
    .slice(0, limit)

  const scrollRef = useRef(null)
  // Track scroll position so we can hide an arrow at each end.
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  // Recompute when the product list (or viewport) changes.
  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [products])

  // Scroll roughly one "page" (most of the visible width) per arrow click.
  function page(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  if (top.length === 0) return null

  const arrowBtn =
    'absolute top-[42%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 shadow-md transition-colors hover:border-orange-400 hover:text-orange-500 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400'

  return (
    <section className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-8 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
            </svg>
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Top Products</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Best sellers shoppers love right now.</p>
          </div>
        </div>
        <Link
          to="/shop"
          className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          View all →
        </Link>
      </div>

      <div className="relative">
        {/* Prev arrow — hidden at the start of the track */}
        {!atStart && (
          <button onClick={() => page(-1)} aria-label="Previous products" className={`${arrowBtn} -left-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {/* Next arrow — hidden at the end of the track */}
        {!atEnd && (
          <button onClick={() => page(1)} aria-label="More products" className={`${arrowBtn} -right-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Horizontally-scrollable track (swipe on mobile, arrows on desktop) */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {top.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="group relative w-44 shrink-0 snap-start overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-52 dark:border-slate-800 dark:bg-slate-900"
            >
              {/* TOP ribbon */}
              <span className="absolute left-0 top-0 z-10 rounded-br-xl bg-orange-500 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow">
                Top
              </span>

              <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-slate-800">
                <img
                  src={getPrimaryImage(p)}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Sold-count bar */}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-sm">
                  {formatCompact(getSoldCount(p))}+ sold
                </span>
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
