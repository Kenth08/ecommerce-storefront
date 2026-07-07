import { api, fetchAllPages } from './client'

// Tolerate both a bare array and a DRF paginated { count, next, results } shape.
function listData(res) {
  const data = res.data
  return Array.isArray(data) ? data : (data?.results ?? [])
}

// First page only (12 items) — enough for Home's featured row / recommendations.
export function getProducts() {
  return api.get('/products/').then(listData)
}

// Full catalog across all pages — used by Shop so search/filter/sort work over
// everything, not just page 1.
export function getAllProducts() {
  return fetchAllPages('/products/')
}

export function getProduct(slug) {
  return api.get(`/products/${slug}/`).then((res) => res.data)
}
