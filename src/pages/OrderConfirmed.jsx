import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getMockOrder, getMockOrders } from '../api/mockOrders'
import { formatPrice } from '../utils/productHelpers'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function OrderConfirmed() {
  useDocumentTitle('Order Confirmed')
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const location = useLocation()
  const [order, setOrder] = useState(null)

  // Show the just-placed order (passed via navigation state), falling back to
  // the most recent local order if the page is reloaded/opened directly.
  useEffect(() => {
    const orderId = location.state?.orderId
    async function load() {
      const found = orderId ? await getMockOrder(orderId) : (await getMockOrders())[0]
      setOrder(found || null)
    }
    load()
  }, [location.state])

  // If we arrived from the real (Stripe) flow, the server cart was emptied —
  // re-fetch so the cart badge clears. Guarded so guests don't trigger a redirect.
  useEffect(() => {
    if (user) refreshCart().catch(() => {})
  }, [user, refreshCart])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      {/* Success icon */}
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-11 w-11 text-green-600 dark:text-green-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </span>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Order placed successfully</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-slate-400">
          Thank you for shopping with Ecomify! We&apos;ll send you an update as your order is processed.
        </p>
      </div>

      {/* Order meta */}
      {order && (
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Order number</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">#{order.id}</p>
            </div>
            {order.estimatedDelivery && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-slate-400">Estimated delivery</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{order.estimatedDelivery}</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <ul className="flex flex-col gap-3 py-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image || '/placeholder-product.svg'}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover dark:border-slate-800 dark:bg-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-1 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to={order ? `/orders/${order.id}` : '/orders'}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          View My Orders
        </Link>
        <Link
          to="/shop"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-orange-400 dark:hover:text-orange-400"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
