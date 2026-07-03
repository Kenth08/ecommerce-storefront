import { api } from './client'

/**
 * Cart API layer — the ONLY place that knows the backend's cart routes and
 * data shape. It maps the server's snake_case response into the camelCase
 * shape the rest of the app already uses (see CartProvider).
 *
 * NOTE: the server cart item does NOT include product name / image / slug —
 * only variant details. Those display fields are merged in by the caller
 * (CartProvider) from product data the frontend already has.
 */

// Server cart item -> frontend cart item (minus name/image/slug, added later).
function mapCartItem(serverItem) {
  const v = serverItem.variant
  return {
    itemId: serverItem.id, // cart-item id, used for PATCH/DELETE /cart/items/{id}/
    variantId: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    price: Number(v.price),
    stock: v.stock,
    quantity: serverItem.quantity,
    lineTotal: Number(serverItem.line_total),
    // Display fields the backend is adding to the cart-item serializer.
    // Read whether they land on the item or nested in the variant; null until then.
    name: serverItem.product_name ?? v.product_name ?? null,
    slug: serverItem.product_slug ?? v.product_slug ?? null,
    image: serverItem.image ?? v.image ?? null,
  }
}

// Server cart -> frontend cart.
export function mapCart(serverCart) {
  return {
    id: serverCart.id,
    items: (serverCart.items ?? []).map(mapCartItem),
    total: Number(serverCart.total),
    updatedAt: serverCart.updated_at,
  }
}

export function getCart() {
  return api.get('/cart/').then((res) => mapCart(res.data))
}

export function addCartItem(variantId, quantity = 1) {
  return api
    .post('/cart/items/', { variant_id: variantId, quantity })
    .then((res) => res.data)
}

export function updateCartItem(itemId, quantity) {
  return api
    .patch(`/cart/items/${itemId}/`, { quantity })
    .then((res) => res.data)
}

export function removeCartItem(itemId) {
  return api.delete(`/cart/items/${itemId}/`).then((res) => res.data)
}
