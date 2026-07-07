import { api, fetchAllPages } from './client'

/**
 * Orders API layer.
 *
 * checkout() turns the authenticated user's server cart into an order and
 * starts payment. The backend creates a Stripe Checkout Session and returns
 * { url: <stripe hosted checkout page> }; the caller redirects the browser
 * there. Stripe then sends the user to success_url / cancel_url, and a
 * backend webhook marks the order paid + empties the cart.
 *
 * Pass `itemIds` (server cart-item ids) to order ONLY those items and leave
 * the rest in the cart. Requires backend support for `item_ids`; without it
 * the backend orders the whole cart — so the UI defaults to all-selected.
 *
 * (Falls back gracefully if the endpoint returns no url — see Cart.jsx.)
 * Requires authentication (the api client attaches the bearer token).
 */
export function checkout(itemIds) {
  const body =
    Array.isArray(itemIds) && itemIds.length > 0 ? { item_ids: itemIds } : undefined
  return api.post('/orders/checkout/', body).then((res) => res.data)
}

/**
 * Order history — GET /api/v1/orders/ (bare array, JWT auth).
 * Confirmed against the backend schema:
 *   Order:     { id, status, total, created_at, items: [OrderItem] }
 *   OrderItem: { id, product_name, variant_sku, price, quantity }
 * The backend sends a unit `price` + `quantity`, so we derive the line total.
 * The mapper stays defensive: a missing field degrades to a safe default
 * rather than crashing the page.
 */
function mapOrderItem(item) {
  const price = Number(item.price ?? 0)
  const quantity = item.quantity ?? 1
  return {
    id: item.id,
    name: item.product_name ?? 'Product',
    sku: item.variant_sku ?? null,
    price,
    quantity,
    lineTotal: price * quantity,
  }
}

function mapOrder(order) {
  return {
    id: order.id,
    status: order.status ?? 'pending',
    total: Number(order.total ?? 0),
    createdAt: order.created_at ?? null,
    items: (order.items ?? []).map(mapOrderItem),
  }
}

export function getOrders() {
  // All pages, so a user with more than 12 orders sees their full history.
  return fetchAllPages('/orders/').then((list) => list.map(mapOrder))
}
