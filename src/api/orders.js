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
