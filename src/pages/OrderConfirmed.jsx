import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function OrderConfirmed() {
  useDocumentTitle('Order Confirmed')
  const { user } = useAuth()
  const { refreshCart } = useCart()

  // Arriving here after Stripe means the order is placed and the server cart
  // was emptied. Re-fetch so the cart badge clears right away. Guard on `user`
  // so a guest hitting this page directly doesn't trigger an auth redirect.
  useEffect(() => {
    if (user) refreshCart().catch(() => {})
  }, [user, refreshCart])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-16 w-16 text-green-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thank you for your order!</h1>
      <p className="max-w-sm text-sm text-gray-500 dark:text-slate-400">
        Your order has been placed successfully. We&apos;ll send you an update as it&apos;s
        processed.
      </p>
      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/shop"
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Continue shopping
        </Link>
        <Link
          to="/orders"
          className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          View your orders
        </Link>
      </div>
    </div>
  )
}
