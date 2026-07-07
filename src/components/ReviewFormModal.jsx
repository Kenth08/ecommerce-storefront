import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { createReview } from '../api/reviews'

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Amazing']

function StarButton({ n, active, onSelect, onHover, onLeave }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(n)}
      onMouseEnter={() => onHover(n)}
      onMouseLeave={onLeave}
      aria-label={`${n} star${n > 1 ? 's' : ''}`}
      className="p-0.5 transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className={`h-8 w-8 ${active ? 'text-orange-500' : 'text-gray-300 dark:text-slate-600'}`}>
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.37 4.22a1 1 0 00.95.69h4.44c.97 0 1.37 1.24.59 1.81l-3.6 2.61a1 1 0 00-.36 1.12l1.38 4.22c.3.92-.76 1.68-1.54 1.11l-3.59-2.61a1 1 0 00-1.18 0l-3.59 2.61c-.78.57-1.84-.19-1.54-1.11l1.38-4.22a1 1 0 00-.36-1.12L2.1 9.65c-.78-.57-.38-1.81.59-1.81h4.44a1 1 0 00.95-.69L9.05 2.93z" />
      </svg>
    </button>
  )
}

/**
 * "Write a review" modal. Rendered only while active (parent controls mount +
 * key), so form state is always fresh. POSTs { order_item, rating, comment }.
 */
export default function ReviewFormModal({ item, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rating || submitting) return
    setSubmitting(true)
    try {
      await createReview({ order_item: item.id, rating, comment: comment.trim() || undefined })
      toast.success('Thanks for your review!')
      onSubmitted?.(item.id)
      onClose()
    } catch (err) {
      const data = err.response?.data
      const detail =
        data?.detail ||
        data?.order_item?.[0] ||
        data?.non_field_errors?.[0] ||
        (typeof data === 'string' ? data : null)
      toast.error(detail || 'Could not submit your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const shown = hover || rating

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
        className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Rate this product</h2>
        <p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-slate-400">{item.name}</p>

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Interactive stars */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarButton
                  key={n}
                  n={n}
                  active={n <= shown}
                  onSelect={setRating}
                  onHover={setHover}
                  onLeave={() => setHover(0)}
                />
              ))}
            </div>
            <span className="h-5 text-sm font-semibold text-orange-600 dark:text-orange-400">
              {RATING_LABELS[shown] || 'Tap to rate'}
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Share your experience with this product (optional)"
            className="mt-4 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rating || submitting}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
