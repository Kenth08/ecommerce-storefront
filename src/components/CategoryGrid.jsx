import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Local category icons (frontend-only for now). Names are matched loosely so
// "Shoes"/"Men's Shoes"/"Sneakers" all resolve to the same icon. Add more
// pairs (and matching SVGs in /public/images/categories/) as you add
// categories.
const LOCAL_ICONS = [
  // Real category photos, rendered full-bleed (`photo: true`) like a backend
  // image would be. ORDER MATTERS: `.find` returns the first match, so more
  // specific patterns come first. Note "women" contains "men", so every
  // women's rule must precede the matching men's/generic rule.
  { match: /mobile.*accessor/i, src: '/images/categories/mobile-accessories.jpg', photo: true },
  { match: /mobile|gadget|phone/i, src: '/images/categories/mobiles-gadgets.jpg', photo: true },
  { match: /laptop|computer/i, src: '/images/categories/laptops-computers.jpg', photo: true },
  { match: /camera/i, src: '/images/categories/cameras.jpg', photo: true },
  { match: /entertain/i, src: '/images/categories/home-entertainment.jpg', photo: true },
  { match: /appliance/i, src: '/images/categories/home-appliances.jpg', photo: true },
  { match: /home|living|furnitur/i, src: '/images/categories/home-living.jpg', photo: true },
  { match: /women.*apparel/i, src: '/images/categories/womens-apparel.jpg', photo: true },
  { match: /apparel|clothing|fashion/i, src: '/images/categories/mens-apparel.jpg', photo: true },
  { match: /women.*bag/i, src: '/images/categories/womens-bags.jpg', photo: true },
  { match: /bag|handbag|purse/i, src: '/images/categories/mens-bags.jpg', photo: true },
  { match: /accessor/i, src: '/images/categories/womens-accessories.jpg', photo: true },
  { match: /makeup|fragrance|cosmetic/i, src: '/images/categories/makeup-fragrances.jpg', photo: true },
  { match: /health|personal care/i, src: '/images/categories/health-personal-care.jpg', photo: true },
  { match: /bab(y|ies)|kids|infant/i, src: '/images/categories/babies-kids.jpg', photo: true },
  { match: /grocer|food/i, src: '/images/categories/groceries.jpg', photo: true },
  { match: /toy|game|collectible/i, src: '/images/categories/toys-games.jpg', photo: true },
  { match: /sport|travel/i, src: '/images/categories/sports-travel.jpg', photo: true },
  { match: /shoe|sneaker|footwear/i, src: '/images/categories/mens-shoes.jpg', photo: true },
  // Line-icon fallback for any category without a photo (rendered padded).
  { match: /shirt|tee|top/i, src: '/images/categories/shirts.svg' },
]
const DEFAULT_ICON = '/images/categories/default.svg'

// Resolve a category to an image. Prefer a real backend image (rendered as a
// full-bleed photo); otherwise use a mapped local icon (rendered padded).
// TODO(backend): once the API returns a real `image`, it takes over automatically.
function resolveCategory(cat) {
  const remote = cat.image || cat.image_url || cat.icon || cat.thumbnail
  if (remote) return { src: remote, isIcon: false }
  const found = LOCAL_ICONS.find((m) => m.match.test(cat.name || ''))
  if (found) return { src: found.src, isIcon: !found.photo }
  return { src: DEFAULT_ICON, isIcon: true }
}

export default function CategoryGrid({ categories }) {
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

  // Recompute when the category list (or viewport) changes.
  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [categories])

  // Scroll roughly one "page" (most of the visible width) per arrow click.
  function page(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrowBtn =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 shadow-md transition-colors hover:border-orange-400 hover:text-orange-500 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400'

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-8 sm:pt-16">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Shop by Category</h2>
        <Link
          to="/shop"
          className="shrink-0 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          View all →
        </Link>
      </div>

      <div className="relative">
        {/* Prev arrow */}
        {!atStart && (
          <button onClick={() => page(-1)} aria-label="Previous categories" className={`${arrowBtn} -left-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {/* Next arrow */}
        {!atEnd && (
          <button onClick={() => page(1)} aria-label="More categories" className={`${arrowBtn} -right-3`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Two-row horizontally-scrollable track (swipe on mobile, arrows on desktop) */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="grid auto-cols-max grid-flow-col grid-rows-2 gap-x-5 gap-y-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat) => {
            const { src, isIcon } = resolveCategory(cat)
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group flex w-24 flex-col items-center gap-2 text-center sm:w-28"
                aria-label={`Shop ${cat.name}`}
              >
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-orange-400 group-hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:group-hover:border-orange-400">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className={`transition-transform duration-300 group-hover:scale-105 ${
                      isIcon ? 'h-1/2 w-1/2 object-contain' : 'h-full w-full object-cover'
                    }`}
                  />
                </span>
                <span className="line-clamp-2 text-xs font-medium text-slate-700 transition-colors group-hover:text-orange-600 sm:text-sm dark:text-slate-300 dark:group-hover:text-orange-400">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
