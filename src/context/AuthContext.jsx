import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      return
    }
    api.get('/auth/me/', {
      headers: { Authorization: `Bearer ${accessToken}` },
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
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
