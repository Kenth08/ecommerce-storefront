export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-square animate-pulse bg-gray-200 dark:bg-slate-700" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 sm:h-5 dark:bg-slate-700" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}
