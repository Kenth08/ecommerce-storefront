import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
  // Start in "loading" only if there's a token to validate.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('accessToken')))

  useEffect(() => {
    // Restore the session once on mount, using the token in storage.
    const token = localStorage.getItem('accessToken')
    if (!token) return
    api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAccessToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login/', { email, password })
    const { access, refresh } = res.data
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    setAccessToken(access)
    const me = await api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${access}` },
    })
    setUser(me.data)
  }

  async function register(email, phone, password, password2) {
    await api.post('/auth/register/', { email, phone, password, password2 })
    await login(email, password)
  }

  // Social login: exchange a Google ID token (from Google Identity Services)
  // for our app's JWT. Backend: POST /auth/google/ { id_token } -> { access, refresh }.
  async function googleLogin(idToken) {
    const res = await api.post('/auth/google/', { id_token: idToken })
    const { access, refresh } = res.data
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    setAccessToken(access)
    const me = await api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${access}` },
    })
    setUser(me.data)
  }

  function logout() {
    const refresh = localStorage.getItem('refreshToken')
    if (refresh) {
      api.post('/auth/logout/', { refresh }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {})
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
