import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkout } from '../api/orders'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Cart() {
  useDocumentTitle('Your Cart')
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, refreshCart, flushCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placingOrder, setPlacingOrder] = useState(false)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleCheckout() {
    // Checkout runs against the server cart, which only exists once logged in.
    if (!user) {
      toast('Please log in to check out.')
      navigate('/login')
      return
    }
    setPlacingOrder(true)
    try {
      await flushCart() // make sure any debounced +/- writes land before we order
      const data = await checkout()
      // Preferred path: backend returns a Stripe Checkout Session URL. Hand the
      // browser off to Stripe's hosted payment page. Stripe then redirects to
      // success_url (/order-confirmed) on payment, or cancel_url (/cart) if
      // abandoned — so we do NOT navigate or show "order placed" ourselves here.
      const stripeUrl = data?.url || data?.checkout_url || data?.session_url
      if (stripeUrl) {
        window.location.href = stripeUrl
        return
      }
      // Fallback: no payment URL yet (endpoint still returns no body) — behave
      // as a direct order placement, the previous behavior.
      await refreshCart() // cart is emptied server-side after a successful order
      toast.success('Order placed!')
      navigate('/order-confirmed')
    } catch (err) {
      // Surface the backend's real reason (empty cart, out of stock, auth, …)
      // instead of a generic message, so failures are diagnosable.
      const data = err.response?.data
      const detail =
        data?.detail || data?.error || data?.message ||
        (typeof data === 'string' ? data : null)
      console.error('Checkout failed:', err.response?.status, data ?? err.message)
      toast.error(detail || 'Could not place your order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (items.length === 0) {
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.size} / {item.color}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <button
                    onClick={() => decreaseQuantity(item.variantId)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-800"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.variantId)}
                    className="h-6 w-6 rounded border border-gray-300 hover:bg-gray-100 dark:border-slate-600 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                  <span className="ml-2">× ${item.price}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.variantId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 sm:ml-auto sm:max-w-sm">
        <div className="rounded-xl border border-gray-200 p-5 dark:border-slate-800">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Order summary
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-slate-400">Subtotal</dt>
              <dd className="font-medium">${total.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-slate-400">Shipping</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">Free</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold dark:border-slate-800">
              <dt>Total</dt>
              <dd>${total.toFixed(2)}</dd>
            </div>
          </dl>
          <button
            onClick={handleCheckout}
            disabled={placingOrder}
            className="mt-5 w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Placing order…' : 'Proceed to checkout'}
          </button>
          <Link
            to="/shop"
            className="mt-3 block text-center text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
