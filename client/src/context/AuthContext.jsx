import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: try to restore session from stored token
  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await getMe()
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials)
    if (data.token) localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (credentials) => {
    const { data } = await apiRegister(credentials)
    if (data.token) localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await apiLogout()
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
