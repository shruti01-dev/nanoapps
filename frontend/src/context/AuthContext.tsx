import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react'
import { firebaseLoginRequest, loginRequest, meRequest } from '../api/auth'
import { isFirebaseCredentialError, loginWithFirebase, registerWithFirebase } from '../lib/firebase'

type User = {
  id: number
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  acceptSession: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    meRequest()
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSession = (token: string, nextUser: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const login = async (email: string, password: string) => {
    try {
      const firebaseUser = await loginWithFirebase(email, password)
      const { data } = await firebaseLoginRequest(firebaseUser.idToken, firebaseUser.name)
      saveSession(data.token, data.user)
      return
    } catch (error) {
      if (!isFirebaseCredentialError(error)) throw error
    }

    const { data } = await loginRequest(email, password)
    saveSession(data.token, data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    await registerWithFirebase(name, email, password)
  }

  const acceptSession = useCallback((token: string, nextUser: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, acceptSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}