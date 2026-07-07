import { motion } from 'framer-motion'
import PromoCarousel from './PromoCarousel'

// Small stats/trust strip below the full-width promo banner.
const stats = [
  {
    label: '10k+',
    sub: 'Happy customers',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    label: 'Free shipping',
    sub: 'On every order',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-5.25m0-11.25h1.5m-1.5 0H8.25m0 0V5.625A1.125 1.125 0 019.375 4.5h9.75c.621 0 1.125.504 1.125 1.125v.375m0 0V9m0 0h-3.375',
  },
  {
    label: 'Secure checkout',
    sub: 'Protected payments',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: '30-day returns',
    sub: 'Hassle-free',
    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
  },
]

export default function Hero() {
  return (
    <>
      {/* Full-width promo banner */}
      <PromoCarousel />

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
            <li key={s.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{s.label}</p>
                <p className="truncate text-xs text-gray-500 dark:text-slate-400">{s.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.section>
    </>
  )
}
