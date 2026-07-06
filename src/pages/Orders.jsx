import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Short, readable date; falls back to nothing if the backend omits it.
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
}

export default function Orders() {
  useDocumentTitle('My Orders')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Separate "backend hasn't shipped this endpoint yet" from a real failure,
  // so a missing feature reads as a calm notice, not an alarming error.
  const [unavailable, setUnavailable] = useState(false)

  // Orders live on the server and require auth — bounce guests to login.
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getOrders()
      .then(setOrders)
      .catch((err) => {
        const status = err.response?.status
        console.error('Load orders failed:', status, err.response?.data ?? err.message)
        // 404/501 => the order-history endpoint isn't implemented yet.
        if (status === 404 || status === 501) setUnavailable(true)
        else setError('Could not load your orders. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  if (unavailable) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-16 w-16 text-gray-300 dark:text-slate-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order history is coming soon</h1>
        <p className="max-w-sm text-sm text-gray-500 dark:text-slate-400">
          We can&apos;t show your past orders just yet — this feature is still being set up. Your
          orders are safely recorded.
        </p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center sm:p-8">
        <h1 className="mb-4 text-2xl font-bold">My Orders</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link
          to="/shop"
          className="mt-4 inline-block text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-16 w-16 text-gray-300 dark:text-slate-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">No orders yet</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">When you place an order, it&apos;ll show up here.</p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const badge = STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
          return (
            <div key={order.id} className="rounded-xl border border-gray-200 p-5 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  {formatDate(order.createdAt) && (
                    <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge}`}>
                  {order.status}
                </span>
              </div>

              {order.items.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-sm dark:border-slate-800">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 text-gray-600 dark:text-slate-300">
                      <span>
                        {item.quantity} × {item.name}
                        {item.size || item.color ? (
                          <span className="text-gray-400 dark:text-slate-500">
                            {' '}({[item.size, item.color].filter(Boolean).join(' / ')})
                          </span>
                        ) : null}
                      </span>
                      <span className="whitespace-nowrap font-medium">${item.lineTotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold dark:border-slate-800">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
