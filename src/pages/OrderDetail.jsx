import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMockOrder } from '../api/mockOrders'
import { getOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/productHelpers'
import useDocumentTitle from '../hooks/useDocumentTitle'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
}
const STATUS_LABELS = {
  pending: 'Order Placed',
  paid: 'Processing',
  shipped: 'Shipped',
  completed: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
}
const TIMELINE = ['Order Placed', 'Processing', 'Shipped', 'Delivered']
const STATUS_STEP = { pending: 0, paid: 1, shipped: 2, completed: 3 }

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  useDocumentTitle(`Order ${id}`)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/orders/${id}` } } })
      return
    }
    let cancelled = false
    async function load() {
      // Local (mock) orders first; fall back to the real order history.
      // TODO(backend): replace with a single GET /orders/:id call.
      let found = await getMockOrder(id)
      if (!found) {
        try {
          const real = await getOrders()
          found = real.find((o) => String(o.id) === String(id)) || null
        } catch {
          found = null
        }
      }
      if (!cancelled) {
        setOrder(found)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, user, navigate])

  function buyAgain() {
    const name = order?.items?.[0]?.name
    navigate(name ? `/shop?q=${encodeURIComponent(name)}` : '/shop')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order not found</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">We couldn’t find an order with that number.</p>
        <Link to="/orders" className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
          Back to My Orders
        </Link>
      </div>
    )
  }

  const badge = STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
  const label = STATUS_LABELS[order.status] ?? order.status
  const isCancelled = order.status === 'cancelled' || order.status === 'failed'
  const currentStep = STATUS_STEP[order.status] ?? 0
  const subtotal = order.subtotal ?? order.items.reduce((s, it) => s + it.lineTotal, 0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      {/* Back */}
      <Link to="/orders" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to My Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Placed on {formatDate(order.createdAt) || '—'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{label}</span>
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        {isCancelled ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">This order was {label.toLowerCase()}.</p>
        ) : (
          <>
            <ol className="flex items-start">
              {TIMELINE.map((step, i) => {
                const done = i <= currentStep
                return (
                  <li key={step} className="relative flex flex-1 flex-col items-center">
                    {i > 0 && (
                      <span className={`absolute right-1/2 top-4 h-0.5 w-full ${i <= currentStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                    )}
                    <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className={`mt-2 text-center text-[11px] font-medium sm:text-xs ${done ? 'text-slate-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
                      {step}
                    </span>
                  </li>
                )
              })}
            </ol>
            {order.estimatedDelivery && (
              <p className="mt-5 border-t border-gray-100 pt-4 text-center text-sm text-gray-600 dark:border-slate-800 dark:text-slate-400">
                Estimated delivery: <span className="font-semibold text-slate-900 dark:text-slate-100">{order.estimatedDelivery}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Items</h2>
        <ul className="flex flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img
                src={item.image || '/placeholder-product.svg'}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover dark:border-slate-800 dark:bg-slate-800"
              />
              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link to={`/product/${item.slug}`} className="line-clamp-1 text-sm font-medium text-slate-900 transition-colors hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-400">
                    {item.name}
                  </Link>
                ) : (
                  <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {item.sku ? `${item.sku} · ` : ''}Qty {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Shipping + Payment (only for local orders that captured them) */}
      {(order.shippingAddress || order.paymentMethod || order.contact) && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {(order.shippingAddress || order.contact) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">Shipping address</h2>
              <div className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                {order.contact?.fullName && <p className="font-medium text-slate-900 dark:text-slate-100">{order.contact.fullName}</p>}
                {order.shippingAddress?.street && <p>{order.shippingAddress.street}</p>}
                {order.shippingAddress && (
                  <p>{[order.shippingAddress.city, order.shippingAddress.region, order.shippingAddress.postal_code].filter(Boolean).join(', ')}</p>
                )}
                {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
                {order.contact?.phone && <p className="mt-1 text-gray-500 dark:text-slate-400">{order.contact.phone}</p>}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">Payment & delivery</h2>
            <dl className="flex flex-col gap-2 text-sm">
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-slate-400">Payment</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">{order.paymentMethod.label}</dd>
                </div>
              )}
              {order.delivery && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-slate-400">Delivery</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">{order.delivery.label}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-slate-400">Subtotal</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-slate-400">Shipping</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{order.shippingFee ? formatPrice(order.shippingFee) : 'Free'}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-slate-400">Discount{order.voucher ? ` (${order.voucher.code})` : ''}</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={buyAgain} className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
          Buy Again
        </button>
        <Link to="/orders" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400">
          Back to My Orders
        </Link>
      </div>
    </div>
  )
}
