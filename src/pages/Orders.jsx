import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders } from '../api/orders'
import { getMockOrders } from '../api/mockOrders'
import { useAuth } from '../context/AuthContext'
import OrderCard from '../components/OrderCard'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Filter tab -> which backend statuses it includes. Labels are customer-facing;
// the backend enum (pending/paid/shipped/completed/failed/cancelled) is mapped.
const FILTERS = [
  { label: 'All', statuses: null },
  { label: 'Pending', statuses: ['pending'] },
  { label: 'Processing', statuses: ['paid'] },
  { label: 'Shipped', statuses: ['shipped'] },
  { label: 'Delivered', statuses: ['completed'] },
  { label: 'Cancelled', statuses: ['cancelled', 'failed'] },
]

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
  const [activeFilter, setActiveFilter] = useState('All')

  const visibleOrders = useMemo(() => {
    const statuses = FILTERS.find((f) => f.label === activeFilter)?.statuses
    return statuses ? orders.filter((o) => statuses.includes(o.status)) : orders
  }, [orders, activeFilter])

  // Orders require auth — bounce guests to login. We merge locally-placed
  // (mock) orders with the real server history so both show in one list.
  // TODO(backend): once real orders persist, the local merge can be removed.
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    let cancelled = false
    async function load() {
      const mock = await getMockOrders().catch(() => [])
      try {
        const real = await getOrders()
        if (!cancelled) setOrders([...mock, ...real])
      } catch (err) {
        const status = err.response?.status
        console.error('Load orders failed:', status, err.response?.data ?? err.message)
        if (cancelled) return
        // 404/501 => the real order-history endpoint isn't implemented yet.
        if (status === 404 || status === 501) {
          setOrders(mock)
          if (mock.length === 0) setUnavailable(true)
        } else if (mock.length > 0) {
          setOrders(mock) // still show local orders on a transient failure
        } else {
          setError('Could not load your orders. Please try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, navigate])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Track and manage your recent purchases.</p>
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-200 dark:bg-slate-800" />
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
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
          My Orders <span className="text-base font-normal text-gray-500 dark:text-slate-400">({orders.length})</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Track and manage your recent purchases.</p>
      </header>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = activeFilter === f.label
          return (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-400 dark:hover:text-orange-400'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Orders */}
      {visibleOrders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
          No {activeFilter.toLowerCase()} orders.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
