import { api, fetchAllPages } from './client'

// GET /products/{slug}/reviews/ — all reviews across pages, so the star-filter
// counts reflect the whole set rather than just page 1.
export function getProductReviews(slug) {
  return fetchAllPages(`/products/${slug}/reviews/`)
}

// POST /reviews/ — create a review. Verified-purchase: tied to an order_item.
// body = { order_item (int, required), rating (1-5, required), comment? }
export function createReview({ order_item, rating, comment }) {
  return api.post('/reviews/', { order_item, rating, comment }).then((res) => res.data)
}
