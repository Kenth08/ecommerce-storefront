import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page Not Found')
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">404</h1>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Page not found</p>
      <p className="text-sm text-gray-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Back to home
      </Link>
    </div>
  )
}
