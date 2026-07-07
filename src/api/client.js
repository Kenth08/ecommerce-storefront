import axios from 'axios'
import { getAccessToken, getRefreshToken, updateTokens, clearTokens } from './tokenStorage'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken()
    refreshPromise = axios
      .post(`${import.meta.env.VITE_API_URL}/api/v1/auth/token/refresh/`, { refresh: refreshToken })
      .then(({ data }) => {
        updateTokens({ access: data.access, refresh: data.refresh })
        return data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint =
      originalRequest.url.includes('/auth/login/') ||
      originalRequest.url.includes('/auth/token/refresh/')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Fetch EVERY page of a DRF-paginated list endpoint and return one combined
 * array. Works whether the endpoint is paginated ({ count, results }) or still
 * a bare array. Page 1 is fetched first (to learn the total), then the
 * remaining pages are fetched in parallel for speed.
 */
export async function fetchAllPages(path) {
  const { data } = await api.get(path)
  if (Array.isArray(data)) return data // endpoint not paginated
  const results = [...(data?.results ?? [])]
  const count = data?.count ?? results.length
  const pageSize = results.length
  if (!pageSize || count <= pageSize) return results
  const totalPages = Math.ceil(count / pageSize)
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      api.get(path, { params: { page: i + 2 } }).then((r) => r.data?.results ?? [])
    )
  )
  return results.concat(...rest)
}
