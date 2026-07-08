/**
 * Customer orders — LOCAL MOCK data layer.
 *
 * ─── BACKEND NOT READY YET ───────────────────────────────────────────────
 * Orders placed from the new /checkout page are stored in localStorage so the
 * whole customer journey (Checkout → Order Confirmed → My Orders → Order
 * Detail) works end-to-end without a live payment/order backend.
 *
 * When the backend is ready, replace the localStorage bodies with real calls:
 *   createOrder(data)  ->  POST /api/v1/orders/            (after payment)
 *   getMockOrders()    ->  GET  /api/v1/orders/
 *   getMockOrder(id)   ->  GET  /api/v1/orders/:id/
 * The real order-history endpoint is already wired in ./orders.js (getOrders);
 * these local orders are merged with it on the My Orders page.
 * ─────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'mockOrders'

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}

// Human-friendly order number, e.g. ECM-20260708-4KQ2.
function generateOrderId() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ECM-${ymd}-${rand}`
}

/**
 * Create and persist a new order.
 * TODO(backend): POST the cart + shipping + payment intent to the real orders
 * endpoint and return its response instead of building the object locally.
 */
export async function createOrder(input) {
  const list = read()
  const order = {
    id: generateOrderId(),
    status: 'pending', // maps to the "Order Placed" step in the timeline
    createdAt: new Date().toISOString(),
    items: input.items, // [{ id, name, sku, price, quantity, lineTotal, image, slug }]
    subtotal: Number(input.subtotal ?? 0),
    discount: Number(input.discount ?? 0),
    shippingFee: Number(input.shippingFee ?? 0),
    total: Number(input.total ?? 0),
    contact: input.contact, // { fullName, email, phone }
    shippingAddress: input.shippingAddress, // { street, city, region, postal_code, country }
    delivery: input.delivery, // { id, label, eta }
    paymentMethod: input.paymentMethod, // { id, label }
    voucher: input.voucher ?? null, // { code, amount } | null
    estimatedDelivery: input.estimatedDelivery ?? null, // display string
  }
  write([order, ...list])
  return order
}

/**
 * All locally-placed orders, newest first.
 * TODO(backend): return api.get('/orders/').then((res) => res.data)
 */
export async function getMockOrders() {
  return read()
}

/**
 * A single locally-placed order by id, or null.
 * TODO(backend): return api.get(`/orders/${id}/`).then((res) => res.data)
 */
export async function getMockOrder(id) {
  return read().find((o) => String(o.id) === String(id)) || null
}
