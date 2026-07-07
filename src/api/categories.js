import { fetchAllPages } from './client'

// Load ALL categories across pages — filters and the category grid need the
// full set, not just the first 12.
export function getCategories() {
  return fetchAllPages('/categories/')
}
