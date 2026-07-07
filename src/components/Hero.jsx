import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PromoCarousel from './PromoCarousel'

// Right-side promo cards next to the main carousel. Same image pattern as the
// carousel: real banner path first, existing project image as `fallback`.
const promoCards = [
  {
    title: 'Flash Deals',
    subtitle: 'Limited-time discounts',
    cta: 'See deals',
    href: '/shop',
    image: '/images/banners/flash-deals.png',
    fallback: '/images/categories/cameras.jpg',
  },
  {
    title: 'New Collection',
    subtitle: 'Fresh picks this week',
    cta: 'Explore',
    href: '/shop',
    image: '/images/banners/new-collection.png',
    fallback: '/images/categories/womens-apparel.jpg',
  },
]

function PromoCard({ card }) {
  return (
    <Link
      to={card.href}
      className="group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-lg lg:h-auto lg:flex-1"
    >
      <img
        src={card.image}
        alt=""
        aria-hidden="true"
        onError={(e) => {
          const img = e.currentTarget
          if (img.dataset.fellBack) { img.style.display = 'none'; return }
          img.dataset.fellBack = '1'
          img.src = card.fallback
        }}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
      <div className="relative z-10">
        <h3 className="text-base font-bold text-white drop-shadow sm:text-lg">{card.title}</h3>
        <p className="text-xs text-white/80">{card.subtitle}</p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-400 transition-colors group-hover:text-orange-300">
          {card.cta}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

// Service/benefit strip below the promo banner — real-world ecommerce perks.
const stats = [
  {
    label: 'Free Shipping Vouchers',
    sub: 'Save more on delivery',
    // ticket
    icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
  },
  {
    label: 'Cash on Delivery',
    sub: 'Pay when you receive',
    // banknotes
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  },
  {
    label: 'Secure Checkout',
    sub: 'Protected payments',
    // lock
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  },
  {
    label: 'Easy Returns',
    sub: '7-day return policy',
    // arrow-path
    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
  },
]

export default function Hero() {
  return (
    <>
      {/* Hero promo: main carousel (≈⅔) + two stacked promo cards (≈⅓) */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main carousel */}
          <div className="h-70 sm:h-80 lg:col-span-2 lg:h-100">
            <PromoCarousel />
          </div>
          {/* Right promo cards: side-by-side on mobile/tablet, stacked on desktop */}
          <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col">
            {promoCards.map((card) => (
              <PromoCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats / trust strip */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-8">
          {stats.map((s) => (
            <li key={s.label} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{s.label}</p>
                <p className="text-xs leading-snug text-gray-500 dark:text-slate-400">{s.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.section>
    </>
  )
}
