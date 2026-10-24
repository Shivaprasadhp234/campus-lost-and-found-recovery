import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, ensureCsrf, resetCsrf } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        await ensureCsrf()
        const { data } = await api.get('/auth/me')
        if (active) setUser(data)
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    await ensureCsrf()
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await ensureCsrf()
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      resetCsrf()
    }
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
