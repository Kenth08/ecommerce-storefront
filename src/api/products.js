import { api } from './client'

export function getProducts() {
  return api.get('/products/').then((res) => res.data)
}

export function getProduct(slug) {
  return api.get(`/products/${slug}/`).then((res) => res.data)
}
