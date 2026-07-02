import { useCallback, useEffect, useState } from 'react'

/**
 * Responsive auto-advancing hero carousel.
 *
 * Each slide accepts:
 *   - image?:     optional banner image URL. When present it fills the slide.
 *   - bg?:        Tailwind classes for the background when there's no image.
 *   - title, subtitle, ctaLabel, ctaHref: optional text overlay content.
 *
 * To use real banners later, just add `image: '<url>'` to each slide object.
 */
export default function Carousel({ slides, interval = 5000 }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const goTo = useCallback((i) => setCurrent(((i % count) + count) % count), [count])
  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])

  useEffect(() => {
    if (paused || count <= 1) return
    const id = setInterval(next, interval)
    return () => clearInterval(id)
  }, [paused, next, interval, count])

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Featured promotions"
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`relative flex h-44 w-full shrink-0 items-center justify-center overflow-hidden sm:h-64 lg:h-80 ${slide.bg || 'bg-slate-900'}`}
            aria-hidden={i !== current}
          >
            {slide.image && (
              <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="relative z-10 mx-auto max-w-2xl px-4 text-center text-white sm:px-8">
              {slide.title && (
                <h2 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{slide.title}</h2>
              )}
              {slide.subtitle && (
                <p className="mt-2 text-sm text-gray-200 sm:mt-4 sm:text-lg">{slide.subtitle}</p>
              )}
              {slide.ctaLabel && (
                <a
                  href={slide.ctaHref || '#products'}
                  className="mt-4 inline-block rounded-md bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 sm:mt-6 sm:text-base"
                >
                  {slide.ctaLabel}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50 sm:left-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50 sm:right-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
