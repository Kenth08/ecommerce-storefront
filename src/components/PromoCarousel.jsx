import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Promo banner slides — full-bleed image (object-cover) with a dark overlay and
// left-aligned copy/CTA, like a real store banner.
//
// IMAGES: `image` is the real banner path (drop files in `public/images/banners/`,
// referenced from the site root as `/images/banners/<name>.png`). Until those
// exist, `fallback` shows an existing project image so the banner stays filled —
// swap in real art later with zero code changes. `object-cover` + `objectPos`
// keeps images filling the frame without stretching.
const slides = [
  {
    label: 'LIMITED OFFER',
    labelClass: 'bg-orange-500 text-white',
    badge: '-50%',
    title: '50% OFF Essentials',
    subtitle: 'Save big on everyday picks, fashion, gadgets, and more.',
    offer: 'Limited time only — ends soon',
    cta: 'Shop the sale',
    href: '/shop',
    image: '/images/banners/sale-essentials.png',
    fallback: '/images/categories/mens-apparel.jpg',
    objectPos: 'object-center',
    gradient: 'from-slate-950 via-orange-950 to-black',
  },
  {
    label: 'NEW ARRIVALS',
    labelClass: 'bg-white text-slate-900',
    badge: 'NEW',
    title: 'Fresh Styles Just Landed',
    subtitle: 'Discover new shoes, shirts, bags, and daily outfits.',
    offer: 'Just dropped this week',
    cta: 'Explore new in',
    href: '/shop',
    image: '/images/banners/new-arrivals.png',
    fallback: '/images/categories/womens-apparel.jpg',
    objectPos: 'object-center',
    gradient: 'from-slate-950 via-purple-950 to-slate-900',
  },
  {
    label: 'FREE SHIPPING',
    labelClass: 'bg-emerald-500 text-white',
    badge: 'FREE',
    title: 'Free Shipping Weekend',
    subtitle: 'No minimum spend, no hidden fees.',
    offer: 'This weekend only',
    cta: 'Start shopping',
    href: '/shop',
    image: '/images/banners/free-shipping.png',
    fallback: '/images/categories/home-living.jpg',
    objectPos: 'object-center',
    gradient: 'from-slate-950 via-emerald-950 to-slate-900',
  },
  {
    label: 'TECH DEALS',
    labelClass: 'bg-cyan-400 text-slate-900',
    badge: null,
    title: 'Upgrade Your Everyday Tech',
    subtitle: 'Shop phones, accessories, audio, and smart gadgets.',
    offer: 'New deals added daily',
    cta: 'Shop gadgets',
    href: '/shop',
    image: '/images/banners/tech-deals.png',
    fallback: '/images/categories/mobiles-gadgets.jpg',
    objectPos: 'object-center',
    gradient: 'from-slate-950 via-cyan-950 to-blue-950',
  },
  {
    label: 'FASHION PICKS',
    labelClass: 'bg-red-500 text-white',
    badge: 'SALE',
    title: 'Style Finds for Less',
    subtitle: 'Men’s and women’s fashion picks at great prices.',
    offer: 'While stocks last',
    cta: 'Shop fashion',
    href: '/shop',
    image: '/images/banners/fashion-picks.png',
    fallback: '/images/categories/womens-bags.jpg',
    objectPos: 'object-center',
    gradient: 'from-slate-950 via-red-950 to-orange-950',
  },
]

const AUTO_MS = 4500

// Slide only across the banner width (absolute children), so nothing else moves.
const variants = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
}

const mod = (n) => ((n % slides.length) + slides.length) % slides.length

export default function PromoCarousel() {
  // index can run past the array length; `mod` maps it back. dir drives the
  // slide direction for Framer.
  const [[index, dir], setState] = useState([0, 0])
  const hovering = useRef(false)

  const active = mod(index)
  const slide = slides[active]

  function paginate(step) {
    setState(([i]) => [i + step, step])
  }

  function goTo(target) {
    setState(([cur]) => {
      const curActive = mod(cur)
      if (target === curActive) return [cur, 0]
      return [cur + (target - curActive), target > curActive ? 1 : -1]
    })
  }

  // Auto-advance, paused while hovered (checked via ref so no timer resets).
  useEffect(() => {
    const id = setInterval(() => {
      if (!hovering.current) paginate(1)
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={index}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute inset-0"
        >
          {/* Gradient base (shows only if both image + fallback fail to load) */}
          <div className={`absolute inset-0 bg-linear-to-br ${slide.gradient}`} />

          {/* Full-bleed banner image (object-cover fills the frame, no stretch) */}
          {slide.image && (
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              // Real banner path first; on 404 swap to an existing project image;
              // if that also fails, hide it and let the gradient show.
              onError={(e) => {
                const img = e.currentTarget
                if (img.dataset.fellBack) { img.style.display = 'none'; return }
                img.dataset.fellBack = '1'
                img.src = slide.fallback
              }}
              className={`absolute inset-0 h-full w-full object-cover ${slide.objectPos}`}
            />
          )}

          {/* Dark overlays: left-weighted for copy readability + bottom vignette.
              An extra soft panel on the left guarantees text contrast on any
              image without washing out the product on the right. */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-black/20" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />

          {/* Optional promo badge, top-right */}
          {slide.badge && (
            <div className="absolute right-4 top-4 z-10 flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-orange-500 text-xs font-extrabold uppercase text-white shadow-lg shadow-orange-500/30 ring-2 ring-white/25 sm:h-14 sm:w-14 sm:text-sm">
              {slide.badge}
            </div>
          )}

          {/* Content — left-aligned text / CTA */}
          <div className="relative z-10 flex h-full max-w-md flex-col items-start justify-center gap-2.5 px-6 sm:max-w-lg sm:gap-4 sm:px-10">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm sm:text-xs ${slide.labelClass}`}>
              {slide.label}
            </span>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
              {slide.title}
            </h2>
            <p className="max-w-sm text-sm text-white/85 sm:text-base">{slide.subtitle}</p>
            {slide.offer && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-white/70 sm:text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4 text-orange-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {slide.offer}
              </p>
            )}
            <Link
              to={slide.href}
              className="mt-1 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.98]"
            >
              {slide.cta}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / next arrows */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 sm:left-5 sm:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 sm:right-5 sm:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className={`h-2 rounded-full transition-all ${active === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  )
}
