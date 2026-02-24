import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '@/config/firebase'
import type { AppUser } from '@/types/user'

interface AuthContextValue {
  user: User | null
  appUser: AppUser | null
  loading: boolean
  error: string | null
  isManager: boolean
  isWorker: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  appUser: null,
  loading: true,
  error: null,
  isManager: false,
  isWorker: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If Firebase is not configured, skip auth listener and just mark as loaded
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setError(null)

      if (firebaseUser) {
        try {
          if (!db) {
            setAppUser(null)
            setError('数据库未配置')
            setLoading(false)
            return
          }
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setAppUser(userDoc.data() as AppUser)
          } else {
            setAppUser(null)
            setError('用户信息不存在，请联系管理员')
          }
        } catch (err) {
          console.error('获取用户信息失败:', err)
          setAppUser(null)
          setError('获取用户信息失败，请稍后重试')
        }
      } else {
        setAppUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const isManager =
    appUser?.role === 'admin' && (appUser?.adminLevel ?? 'manager') === 'manager'
  const isWorker =
    appUser?.role === 'admin' && appUser?.adminLevel === 'worker'

  return (
    <AuthContext.Provider value={{ user, appUser, loading, error, isManager, isWorker }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }
  return context
}
