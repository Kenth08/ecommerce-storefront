import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

/**
 * Shared shell for the simple static/content pages (Help, Shipping, Returns,
 * Contact, Privacy, Terms) so they all share the Ecomify look and spacing.
 */
export default function InfoPageLayout({ title, subtitle, children }) {
  useDocumentTitle(title)
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to store
      </Link>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}

      <div className="mt-8 flex flex-col gap-6">{children}</div>
    </div>
  )
}

// Titled block used inside the content pages.
export function InfoSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      {title && <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>}
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</div>
    </section>
  )
}
