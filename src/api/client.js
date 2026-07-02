import axios from 'axios'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken')
    refreshPromise = axios
      .post(`${import.meta.env.VITE_API_URL}/api/v1/auth/token/refresh/`, { refresh: refreshToken })
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.access)
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh)
        }
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

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
