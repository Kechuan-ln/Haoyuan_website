import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { requireAuth, requireDb, isCloudBaseConfigured } from '@/config/cloudbase'
import type { AccountStatus, AppUser } from '@/types/user'

interface CloudBaseUser {
  uid: string
  email?: string
}

interface AuthContextValue {
  user: CloudBaseUser | null
  appUser: AppUser | null
  loading: boolean
  error: string | null
  isManager: boolean
  isWorker: boolean
  accountStatus: AccountStatus
  isPendingApproval: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  appUser: null,
  loading: true,
  error: null,
  isManager: false,
  isWorker: false,
  accountStatus: 'active',
  isPendingApproval: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CloudBaseUser | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isCloudBaseConfigured) {
      setLoading(false)
      return
    }

    const auth = requireAuth()
    const db = requireDb()

    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user?.id) {
        setUser(null)
        setAppUser(null)
        setLoading(false)
        return
      }

      const cbUser: CloudBaseUser = {
        uid: session.user.id as string,
        email: session.user.email as string | undefined,
      }
      setUser(cbUser)
      setError(null)

      try {
        const result = await db.collection('users').doc(cbUser.uid).get()
        if (result.data && result.data.length > 0) {
          setAppUser(result.data[0] as AppUser)
        } else {
          setAppUser(null)
          setError('用户信息不存在，请联系管理员')
        }
      } catch (err) {
        console.error('获取用户信息失败:', err)
        setAppUser(null)
        setError('获取用户信息失败，请稍后重试')
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isManager =
    appUser?.role === 'admin' && (appUser?.adminLevel ?? 'manager') === 'manager'
  const isWorker =
    appUser?.role === 'admin' && appUser?.adminLevel === 'worker'
  const accountStatus: AccountStatus = appUser?.accountStatus ?? 'active'
  const isPendingApproval = accountStatus === 'pending_approval'

  return (
    <AuthContext.Provider value={{ user, appUser, loading, error, isManager, isWorker, accountStatus, isPendingApproval }}>
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
