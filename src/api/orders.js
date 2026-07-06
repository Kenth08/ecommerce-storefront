import { api } from './client'

/**
 * Orders API layer.
 *
 * checkout() converts the authenticated user's current server cart into an
 * order. The backend endpoint takes no request body and returns 200 with no
 * response body — it reads the cart tied to the logged-in user, creates the
 * order, and empties the cart server-side.
 *
 * Requires authentication (the api client attaches the bearer token).
 */
export function checkout() {
  return api.post('/orders/checkout/').then((res) => res.data)
}

/**
 * Order history.
 *
 * ASSUMED endpoint + shape — CONFIRM WITH BACKEND, then adjust mapOrder below.
 * Expected: GET /orders/ -> [{ id, status, total, created_at, items: [...] }]
 * Each item mirrors a cart item (variant nested, snake_case).
 * The mapper is defensive: missing fields become sensible defaults rather
 * than crashing the page.
 */
function mapOrderItem(item) {
  const v = item.variant ?? {}
  return {
    id: item.id,
    variantId: v.id ?? null,
    size: v.size ?? null,
    color: v.color ?? null,
    name: item.product_name ?? v.product_name ?? 'Product',
    quantity: item.quantity ?? 1,
    lineTotal: Number(item.line_total ?? 0),
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
  return api.get('/orders/').then((res) => {
    // Tolerate either a bare array or a paginated { results: [...] } response.
    const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
    return list.map(mapOrder)
  })
}
