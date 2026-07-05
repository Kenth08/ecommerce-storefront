import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { getAccessToken, setTokens, clearTokens } from '../api/tokenStorage'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => getAccessToken())
  // Start in "loading" only if there's a token to validate.
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    // Restore the session once on mount, using the token in storage.
    const token = getAccessToken()
    if (!token) return
    api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch(() => {
        clearTokens()
        setAccessToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Store the session and load the current user. `remember` controls whether
  // tokens persist across browser restarts (localStorage) or not (sessionStorage).
  async function establishSession(access, refresh, remember = true) {
    setTokens({ access, refresh, remember })
    setAccessToken(access)
    const me = await api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${access}` },
    })
    setUser(me.data)
  }

  async function login(email, password, remember = true) {
    const res = await api.post('/auth/login/', { email, password })
    await establishSession(res.data.access, res.data.refresh, remember)
  }

  async function register(email, phone, password, password2) {
    await api.post('/auth/register/', { email, phone, password, password2 })
    await login(email, password)
  }

  // Social login: exchange a Google ID token (from Google Identity Services)
  // for our app's JWT. Backend: POST /auth/google/ { id_token } -> { access, refresh }.
  async function googleLogin(idToken) {
    const res = await api.post('/auth/google/', { id_token: idToken })
    await establishSession(res.data.access, res.data.refresh)
  }

  function logout() {
    const refresh = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
    if (refresh) {
      api.post('/auth/logout/', { refresh }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {})
    }
    clearTokens()
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
