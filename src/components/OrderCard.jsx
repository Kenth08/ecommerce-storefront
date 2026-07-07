import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewFormModal from './ReviewFormModal'

// Short, readable date; empty string if the backend omits it.
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Backend StatusEnum -> badge colour + customer-facing label.
const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
}
const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Processing',
  shipped: 'Shipped',
  completed: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

// Simple 4-step tracker; STATUS_STEP maps a status to how far it has reached.
const TIMELINE = ['Order Placed', 'Processing', 'Shipped', 'Delivered']
const STATUS_STEP = { pending: 0, paid: 1, shipped: 2, completed: 3 }

export default function OrderCard({ order }) {
  const navigate = useNavigate()
  const [panel, setPanel] = useState(null) // null | 'details' | 'timeline'
  const [reviewItem, setReviewItem] = useState(null) // order item being reviewed
  const [reviewedIds, setReviewedIds] = useState(() => new Set())
  const isDelivered = order.status === 'completed'

  const itemCount = order.items.reduce((n, it) => n + it.quantity, 0)
  const badge = STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
  const label = STATUS_LABELS[order.status] ?? order.status
  const isCancelled = order.status === 'cancelled' || order.status === 'failed'
  const currentStep = STATUS_STEP[order.status] ?? 0
  const date = formatDate(order.createdAt)

  const togglePanel = (p) => setPanel((cur) => (cur === p ? null : p))

  // We only have product_name (no variant id), so Buy Again can't re-add
  // directly — send the shopper to the product via search to re-select.
  function buyAgain() {
    const name = order.items[0]?.name
    navigate(name ? `/shop?q=${encodeURIComponent(name)}` : '/shop')
  }

  const secondaryBtn = (active) =>
    `rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
        : 'border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400'
    }`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:shadow-none">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">Order #{order.id}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
            {date && `${date} · `}{itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>{label}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Items */}
      <ul className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-slate-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <img
              src="/placeholder-product.svg"
              alt=""
              className="h-12 w-12 shrink-0 rounded-md border border-gray-100 bg-gray-50 object-contain p-1.5 dark:border-slate-800 dark:bg-slate-800"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Qty {item.quantity}{item.sku ? ` · ${item.sku}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                ${item.lineTotal.toFixed(2)}
              </span>
              {isDelivered && (
                reviewedIds.has(item.id) ? (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Reviewed ✓</span>
                ) : (
                  <button
                    onClick={() => setReviewItem(item)}
                    className="rounded-lg border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                  >
                    Rate
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-slate-800">
        <button onClick={() => togglePanel('details')} className={secondaryBtn(panel === 'details')}>
          View Details
        </button>
        <button onClick={() => togglePanel('timeline')} className={secondaryBtn(panel === 'timeline')}>
          Track Order
        </button>
        <button
          onClick={buyAgain}
          className="ml-auto rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Buy Again
        </button>
      </div>

      {/* View Details — expandable breakdown */}
      {panel === 'details' && (
        <dl className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm dark:border-slate-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-gray-600 dark:text-slate-300">
              <dt>
                {item.quantity} × {item.name}
                <span className="text-gray-400 dark:text-slate-500"> @ ${item.price.toFixed(2)}</span>
              </dt>
              <dd className="whitespace-nowrap font-medium">${item.lineTotal.toFixed(2)}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-gray-100 pt-2 font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            <dt>Total</dt>
            <dd>${order.total.toFixed(2)}</dd>
          </div>
        </dl>
      )}

      {/* Track Order — simple status timeline */}
      {panel === 'timeline' && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-slate-800">
          {isCancelled ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              This order was {label.toLowerCase()}.
            </p>
          ) : (
            <ol className="flex items-start">
              {TIMELINE.map((step, i) => {
                const done = i <= currentStep
                return (
                  <li key={step} className="relative flex flex-1 flex-col items-center">
                    {/* Connector from the previous dot to this one. */}
                    {i > 0 && (
                      <span
                        className={`absolute right-1/2 top-3.5 h-0.5 w-full ${
                          i <= currentStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span
                      className={`mt-1.5 text-center text-[11px] font-medium ${
                        done ? 'text-slate-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}

      {reviewItem && (
        <ReviewFormModal
          key={reviewItem.id}
          item={reviewItem}
          onClose={() => setReviewItem(null)}
          onSubmitted={(id) => setReviewedIds((prev) => new Set(prev).add(id))}
        />
      )}
    </div>
  )
}
