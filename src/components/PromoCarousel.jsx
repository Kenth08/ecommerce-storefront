import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Full-width promo banner slides. Premium dark gradients with a colored accent
// (orange stays an accent, not the whole card). `image` supports real banners
// later — drop a file in /public/images and set `image: '/images/sale.jpg'`;
// until then the gradient + shapes render as a fallback.
const slides = [
  {
    label: 'SALE',
    labelClass: 'bg-orange-500 text-white',
    accent: 'bg-orange-500/25',
    ring: 'border-orange-400/20',
    title: '50% OFF Essentials',
    subtitle: 'Limited-time deals on everyday must-haves.',
    cta: 'Shop the sale',
    href: '/shop',
    image: null,
    gradient: 'from-slate-950 via-orange-950 to-slate-900',
    icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
  },
  {
    label: 'NEW ARRIVALS',
    labelClass: 'bg-white text-slate-900',
    accent: 'bg-indigo-500/25',
    ring: 'border-indigo-400/20',
    title: 'Fresh Styles Just Landed',
    subtitle: 'Discover new shoes, shirts, and daily essentials.',
    cta: 'Explore new in',
    href: '/shop',
    image: null,
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
  },
  {
    label: 'FREE SHIPPING',
    labelClass: 'bg-emerald-500 text-white',
    accent: 'bg-emerald-500/25',
    ring: 'border-emerald-400/20',
    title: 'Free Shipping Weekend',
    subtitle: 'No minimum spend, no hidden fees.',
    cta: 'Start shopping',
    href: '/shop',
    image: null,
    gradient: 'from-slate-950 via-emerald-950 to-slate-900',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-5.25m0-11.25h1.5m-1.5 0H8.25m0 0V5.625A1.125 1.125 0 019.375 4.5h9.75c.621 0 1.125.504 1.125 1.125v.375m0 0V9m0 0h-3.375',
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
      className="relative h-80 w-full overflow-hidden bg-slate-950 sm:h-95 lg:h-120"
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
          {/* Background: real banner image if provided, else premium gradient */}
          {slide.image ? (
            <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className={`absolute inset-0 bg-linear-to-br ${slide.gradient}`} />
          )}

          {/* Accent glow + abstract shapes, weighted to the right (image side) */}
          <div className={`pointer-events-none absolute right-[8%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-3xl ${slide.accent}`} />
          <div className={`pointer-events-none absolute -right-16 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border ${slide.ring}`} />
          <div className={`pointer-events-none absolute right-24 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border sm:block ${slide.ring}`} />
          {/* Diagonal glass shine */}
          <div className="pointer-events-none absolute inset-y-0 left-1/4 w-1/3 -skew-x-12 bg-linear-to-r from-white/10 via-transparent to-transparent" />
          {/* Large watermark product/sale icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="pointer-events-none absolute right-[10%] top-1/2 hidden h-48 w-48 -translate-y-1/2 text-white/10 lg:block"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={slide.icon} />
          </svg>
          {/* Left-weighted dark overlay so the copy stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

          {/* Content — centered max-width container, copy aligned left */}
          <div className="relative mx-auto flex h-full max-w-6xl flex-col items-start justify-center gap-4 px-6 sm:px-8">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${slide.labelClass}`}>
              {slide.label}
            </span>
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
              {slide.title}
            </h2>
            <p className="max-w-md text-sm text-white/85 sm:text-base lg:text-lg">{slide.subtitle}</p>
            <Link
              to={slide.href}
              className="mt-1 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
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
        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 sm:left-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 sm:right-5"
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
