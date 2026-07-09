import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

const PAYMENTS = ['COD', 'GCash', 'Card', 'PayPal']
const SELECTION_KEY = 'checkoutSelection'

export default function Cart() {
  useDocumentTitle('Your Cart')
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, flushCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [voucher, setVoucher] = useState('')

  // Track UNSELECTED lines (by variantId). Empty set = everything selected,
  // so newly added items are selected by default and nothing is a surprise.
  const [deselected, setDeselected] = useState(() => new Set())

  const selectedItems = items.filter((item) => !deselected.has(item.variantId))
  const selectedCount = selectedItems.length
  const allSelected = items.length > 0 && selectedCount === items.length
  const someSelected = selectedCount > 0 && !allSelected
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // "Buy Now" lands here asking to select only that one product.
  const buyNowVariantId = location.state?.buyNowVariantId
  const appliedBuyNow = useRef(false)
  useEffect(() => {
    if (buyNowVariantId != null && items.length > 0 && !appliedBuyNow.current) {
      appliedBuyNow.current = true
      setDeselected(new Set(items.filter((i) => i.variantId !== buyNowVariantId).map((i) => i.variantId)))
    }
  }, [buyNowVariantId, items])

  // Native checkbox "indeterminate" (dash) when some but not all are selected.
  const selectAllRef = useRef(null)
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected
  }, [someSelected])

  function toggleItem(variantId) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) next.delete(variantId)
      else next.add(variantId)
      return next
    })
  }

  function toggleAll() {
    // All selected -> clear selection; otherwise select everything.
    setDeselected(allSelected ? new Set(items.map((i) => i.variantId)) : new Set())
  }

  function applyVoucher(e) {
    e.preventDefault()
    if (!voucher.trim()) return
    // Placeholder — no voucher backend yet.
    toast('That code isn’t valid right now.', { id: 'voucher' })
  }

  // Proceed to the dedicated /checkout page with ONLY the selected lines.
  // The checkout page itself gates on login and creates the order.
  async function handleCheckout() {
    if (selectedCount === 0) return
    // Sync any debounced quantity writes so the server cart matches the UI
    // before checkout reads it. (No-op for guests.)
    try {
      await flushCart()
    } catch {
      /* non-fatal */
    }
    // Persist the selection so /checkout can restore it (survives refresh).
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedItems.map((i) => i.variantId)))
    navigate('/checkout')
  }

  // ---- Empty cart ---------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-10 w-10 text-orange-500 dark:text-orange-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Start adding products you love.</p>
        <Link
          to="/shop"
          className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  // ---- Cart ---------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Your Cart</h1>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          ({selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected)
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
        {/* LEFT — cart items */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Select all */}
            <label className="flex cursor-pointer items-center gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5 dark:border-slate-800">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-5 w-5 shrink-0 cursor-pointer accent-orange-500"
                aria-label="Select all items"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Select all</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-slate-400">
                {selectedCount} of {items.length} selected
              </span>
            </label>

            {/* Items */}
            <ul className="flex flex-col">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 border-b border-gray-100 px-4 py-4 transition-colors last:border-0 hover:bg-gray-50/70 sm:gap-4 sm:px-5 dark:border-slate-800 dark:hover:bg-slate-800/30"
                >
                  <input
                    type="checkbox"
                    checked={!deselected.has(item.variantId)}
                    onChange={() => toggleItem(item.variantId)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-orange-500"
                    aria-label={`Select ${item.name}`}
                  />

                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover sm:h-24 sm:w-24 dark:border-slate-700"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={item.slug ? `/product/${item.slug}` : '/shop'}
                          className="line-clamp-2 font-medium text-slate-900 transition-colors hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-400"
                        >
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                            {[item.size, item.color].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                          Unit price: ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        title="Remove"
                        className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity stepper */}
                      <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-600">
                        <button
                          onClick={() => decreaseQuantity(item.variantId)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center text-lg leading-none text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.variantId)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center text-lg leading-none text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                      {/* Line subtotal */}
                      <p className="text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/shop"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Continue shopping
          </Link>
        </div>

        {/* RIGHT — order summary (sticky on desktop) */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Order Summary</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              {selectedCount} of {items.length} {items.length === 1 ? 'item' : 'items'} selected
            </p>

            {/* Voucher */}
            <form onSubmit={applyVoucher} className="mt-4 flex gap-2">
              <input
                type="text"
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="Enter voucher code"
                aria-label="Voucher code"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
              >
                Apply
              </button>
            </form>

            {/* Totals */}
            <dl className="mt-4 flex flex-col gap-2.5 border-t border-gray-100 pt-4 text-sm dark:border-slate-800">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Subtotal</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">${total.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Shipping</dt>
                <dd className="font-medium text-green-600 dark:text-green-400">Free</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Discount</dt>
                <dd className="font-medium text-gray-400 dark:text-slate-500">—</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            <button
              onClick={handleCheckout}
              disabled={selectedCount === 0}
              className="mt-5 w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedCount === 0 ? 'Select items to check out' : `Proceed to checkout (${selectedCount})`}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secure checkout • Protected payment
            </p>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-slate-400">
              Estimated delivery: 3–7 business days
            </p>

            {/* Payment methods */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-4 dark:border-slate-800">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
