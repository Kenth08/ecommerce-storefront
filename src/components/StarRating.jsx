/**
 * Read-only star rating with fractional fill.
 * Reused by ProductCard and QuickViewModal so ratings look identical everywhere.
 */
const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

function Star({ fillPercent, className }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Empty (track) star */}
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full text-gray-300 dark:text-slate-600">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.37 4.22a1 1 0 00.95.69h4.44c.97 0 1.37 1.24.59 1.81l-3.6 2.61a1 1 0 00-.36 1.12l1.38 4.22c.3.92-.76 1.68-1.54 1.11l-3.59-2.61a1 1 0 00-1.18 0l-3.59 2.61c-.78.57-1.84-.19-1.54-1.11l1.38-4.22a1 1 0 00-.36-1.12L2.1 9.65c-.78-.57-.38-1.81.59-1.81h4.44a1 1 0 00.95-.69L9.05 2.93z" />
      </svg>
      {/* Filled overlay, clipped to the fill percentage */}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-full w-full text-orange-500">
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.37 4.22a1 1 0 00.95.69h4.44c.97 0 1.37 1.24.59 1.81l-3.6 2.61a1 1 0 00-.36 1.12l1.38 4.22c.3.92-.76 1.68-1.54 1.11l-3.59-2.61a1 1 0 00-1.18 0l-3.59 2.61c-.78.57-1.84-.19-1.54-1.11l1.38-4.22a1 1 0 00-.36-1.12L2.1 9.65c-.78-.57-.38-1.81.59-1.81h4.44a1 1 0 00.95-.69L9.05 2.93z" />
        </svg>
      </span>
    </span>
  )
}

export default function StarRating({ value = 0, count, size = 'sm', showCount = true }) {
  const sizeClass = SIZES[size] ?? SIZES.sm
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`Rated ${value} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, value - i)) * 100
          return <Star key={i} fillPercent={fill} className={sizeClass} />
        })}
      </div>
      {showCount && (
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {value.toFixed(1)}
          {count != null && ` (${count})`}
        </span>
      )}
    </div>
  )
}
