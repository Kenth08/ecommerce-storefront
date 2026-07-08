import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getAddresses } from '../api/addresses'
import { createOrder } from '../api/mockOrders'
import { formatPrice } from '../utils/productHelpers'
import useDocumentTitle from '../hooks/useDocumentTitle'

const SELECTION_KEY = 'checkoutSelection'

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', eta: '3–7 business days', fee: 0, minDays: 3, maxDays: 7 },
  { id: 'express', label: 'Express Delivery', eta: '1–3 business days', fee: 8, minDays: 1, maxDays: 3 },
]

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay with cash when your order arrives.' },
  { id: 'gcash', label: 'GCash', desc: 'Placeholder — no real payment is processed yet.' },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Placeholder — no real payment is processed yet.' },
  { id: 'paypal', label: 'PayPal', desc: 'Placeholder — no real payment is processed yet.' },
]

// Demo voucher codes. TODO(backend): validate codes against the real API.
const VOUCHERS = {
  SAVE10: { label: '10% off', apply: (subtotal) => subtotal * 0.1 },
  ECOM50: { label: '$50 off orders over $200', apply: (subtotal) => (subtotal >= 200 ? 50 : 0) },
}

// Read the cart selection saved by the Cart page (array of variantIds), or null.
function readSelection() {
  try {
    const val = JSON.parse(localStorage.getItem(SELECTION_KEY))
    return Array.isArray(val) && val.length > 0 ? val : null
  } catch {
    return null
  }
}

// A friendly delivery date range from today, e.g. "Jul 11 – Jul 15".
function estimateRange(minDays, maxDays) {
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const from = new Date()
  from.setDate(from.getDate() + minDays)
  const to = new Date()
  to.setDate(to.getDate() + maxDays)
  return `${fmt(from)} – ${fmt(to)}`
}

export default function Checkout() {
  useDocumentTitle('Checkout')
  const { items, removeFromCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Gate: checkout requires an account; bounce guests to login and return here.
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true })
    }
  }, [user, navigate])

  // Read the saved cart selection once on mount (stable for this checkout).
  const [selectionIds] = useState(readSelection)

  // Only the items the shopper selected in the cart (falls back to all).
  const selectedItems = useMemo(() => {
    if (!selectionIds) return items
    const set = new Set(selectionIds)
    return items.filter((it) => set.has(it.variantId))
  }, [items, selectionIds])

  // Form state
  const [contact, setContact] = useState({ fullName: '', email: user?.email || '', phone: '' })
  const [address, setAddress] = useState({ street: '', city: '', region: '', postal_code: '', country: 'Philippines' })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [delivery, setDelivery] = useState('standard')
  const [payment, setPayment] = useState('cod')
  const [voucherInput, setVoucherInput] = useState('')
  const [voucher, setVoucher] = useState(null) // { code, amount }
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const prefilled = useRef(false)

  // Prefill contact + shipping from the user's default saved address.
  useEffect(() => {
    getAddresses()
      .then((list) => {
        setSavedAddresses(list)
        if (prefilled.current) return
        const def = list.find((a) => a.is_default) || list[0]
        if (def) {
          prefilled.current = true
          setContact((c) => ({
            fullName: c.fullName || def.full_name || '',
            email: c.email || user?.email || '',
            phone: c.phone || def.phone || '',
          }))
          setAddress({
            street: def.street || '',
            city: def.city || '',
            region: def.region || '',
            postal_code: def.postal_code || '',
            country: def.country || 'Philippines',
          })
        }
      })
      .catch(() => {})
  }, [user])

  function applySavedAddress(id) {
    const a = savedAddresses.find((x) => x.id === id)
    if (!a) return
    setContact((c) => ({ fullName: a.full_name || c.fullName, email: c.email, phone: a.phone || c.phone }))
    setAddress({
      street: a.street || '',
      city: a.city || '',
      region: a.region || '',
      postal_code: a.postal_code || '',
      country: a.country || 'Philippines',
    })
    setErrors({})
  }

  const subtotal = selectedItems.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0)
  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === delivery)
  const shippingFee = deliveryOption?.fee ?? 0
  const discount = voucher?.amount ?? 0
  const total = Math.max(0, subtotal - discount) + shippingFee

  function applyVoucher(e) {
    e.preventDefault()
    const code = voucherInput.trim().toUpperCase()
    if (!code) return
    const found = VOUCHERS[code]
    if (!found) {
      setVoucher(null)
      toast.error('That voucher code isn’t valid.', { id: 'voucher' })
      return
    }
    const amount = found.apply(subtotal)
    if (amount <= 0) {
      toast('This voucher doesn’t apply to your current cart.', { id: 'voucher' })
      return
    }
    setVoucher({ code, amount })
    toast.success(`Voucher applied — ${found.label}.`, { id: 'voucher' })
  }

  function validate() {
    const next = {}
    if (!contact.fullName.trim()) next.fullName = 'Full name is required.'
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) next.email = 'A valid email is required.'
    if (!contact.phone.trim()) next.phone = 'Phone number is required.'
    if (!address.street.trim()) next.street = 'Street address is required.'
    if (!address.city.trim()) next.city = 'City is required.'
    if (!address.region.trim()) next.region = 'Region / province is required.'
    if (!address.postal_code.trim()) next.postal_code = 'Postal code is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function placeOrder() {
    if (selectedItems.length === 0) return
    if (!validate()) {
      toast.error('Please complete the required fields.')
      return
    }
    setPlacing(true)
    try {
      const method = PAYMENT_METHODS.find((m) => m.id === payment)
      // TODO(backend): create the real order + payment intent here. For now we
      // persist a local order so the confirmation / history flow works.
      const order = await createOrder({
        items: selectedItems.map((it) => ({
          id: it.itemId ?? it.variantId,
          name: it.name,
          sku: [it.size, it.color].filter(Boolean).join(' / ') || null,
          price: Number(it.price),
          quantity: it.quantity,
          lineTotal: Number(it.price) * it.quantity,
          image: it.image,
          slug: it.slug,
        })),
        subtotal,
        discount,
        shippingFee,
        total,
        contact,
        shippingAddress: address,
        delivery: { id: deliveryOption.id, label: deliveryOption.label, eta: deliveryOption.eta },
        paymentMethod: { id: method.id, label: method.label },
        voucher,
        estimatedDelivery: estimateRange(deliveryOption.minDays, deliveryOption.maxDays),
      })

      // Remove ordered items from the cart (best-effort; errors are non-fatal).
      // TODO(backend): the real order endpoint should clear these server-side.
      for (const it of selectedItems) {
        try {
          await removeFromCart(it.variantId)
        } catch {
          /* ignore */
        }
      }
      localStorage.removeItem(SELECTION_KEY)

      navigate('/order-confirmed', { state: { orderId: order.id }, replace: true })
    } catch {
      toast.error('Could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!user) return null

  // Nothing to check out.
  if (selectedItems.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nothing to check out</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Select some items in your cart first.</p>
        <Link to="/cart" className="mt-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
          Back to cart
        </Link>
      </div>
    )
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500/60'
        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100 dark:border-slate-700'
    }`

  const fieldError = (field) => errors[field] && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[field]}</p>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/cart" aria-label="Back to cart" className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Checkout</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
        {/* LEFT — forms */}
        <div className="flex flex-col gap-6">
          {/* Contact information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Contact information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
                <input className={inputClass('fullName')} value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} placeholder="Juan Dela Cruz" />
                {fieldError('fullName')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input type="email" className={inputClass('email')} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@email.com" />
                {fieldError('email')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                <input className={inputClass('phone')} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="09XX XXX XXXX" />
                {fieldError('phone')}
              </div>
            </div>
          </section>

          {/* Shipping address */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Shipping address</h2>
              {savedAddresses.length > 0 && (
                <select
                  onChange={(e) => e.target.value && applySavedAddress(e.target.value)}
                  defaultValue=""
                  aria-label="Use a saved address"
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="">Use a saved address…</option>
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>{a.label || a.city || 'Saved address'}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Street address</label>
                <input className={inputClass('street')} value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="House no., street, barangay" />
                {fieldError('street')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                <input className={inputClass('city')} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Quezon City" />
                {fieldError('city')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Region / Province</label>
                <input className={inputClass('region')} value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} placeholder="Metro Manila" />
                {fieldError('region')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal code</label>
                <input className={inputClass('postal_code')} value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} placeholder="1100" />
                {fieldError('postal_code')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                <input className={inputClass('country')} value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Delivery option */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Delivery option</h2>
            <div className="flex flex-col gap-3">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    delivery === opt.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 hover:border-orange-300 dark:border-slate-700'
                  }`}
                >
                  <input type="radio" name="delivery" checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="h-4 w-4 accent-orange-500" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{opt.label}</span>
                    <span className="block text-xs text-gray-500 dark:text-slate-400">{opt.eta}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{opt.fee === 0 ? 'Free' : formatPrice(opt.fee)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Payment method</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    payment === m.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-200 hover:border-orange-300 dark:border-slate-700'
                  }`}
                >
                  <input type="radio" name="payment" checked={payment === m.id} onChange={() => setPayment(m.id)} className="h-4 w-4 accent-orange-500" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{m.label}</span>
                    <span className="block text-xs text-gray-500 dark:text-slate-400">{m.desc}</span>
                  </span>
                  {m.id !== 'cod' && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-slate-800 dark:text-slate-400">Demo</span>
                  )}
                </label>
              ))}
            </div>
            {payment === 'card' && (
              <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2 dark:bg-slate-800/60">
                <input disabled placeholder="Card number (demo)" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800" />
                <input disabled placeholder="MM / YY" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 dark:border-slate-700 dark:bg-slate-800" />
                <input disabled placeholder="CVC" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 dark:border-slate-700 dark:bg-slate-800" />
                <p className="text-xs text-gray-400 sm:col-span-2">Demo only — no real card is charged.</p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — order summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Order summary</h2>

            <ul className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
              {selectedItems.map((it) => (
                <li key={it.variantId} className="flex items-center gap-3">
                  <img src={it.image} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-slate-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{it.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Qty {it.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatPrice(Number(it.price) * it.quantity)}</span>
                </li>
              ))}
            </ul>

            {/* Voucher */}
            <form onSubmit={applyVoucher} className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-slate-800">
              <input
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="Voucher code (try SAVE10)"
                aria-label="Voucher code"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button type="submit" className="shrink-0 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10">
                Apply
              </button>
            </form>

            {/* Totals */}
            <dl className="mt-4 flex flex-col gap-2.5 border-t border-gray-100 pt-4 text-sm dark:border-slate-800">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Subtotal</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Shipping</dt>
                <dd className={`font-medium ${shippingFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Discount{voucher ? ` (${voucher.code})` : ''}</dt>
                <dd className={`font-medium ${discount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                  {discount > 0 ? `−${formatPrice(discount)}` : '—'}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="mt-5 w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? 'Placing order…' : `Place order • ${formatPrice(total)}`}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secure checkout • Your details are protected
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
