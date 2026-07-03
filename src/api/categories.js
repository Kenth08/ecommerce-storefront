import { api } from './client'

export function getCategories() {
  return api.get('/categories/').then((res) => res.data)
}
