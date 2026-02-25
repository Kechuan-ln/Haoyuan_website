import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/user'
import { ROUTES } from '@/config/routes'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, appUser, loading, accountStatus } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!appUser || !allowedRoles.includes(appUser.role)) {
    return <Navigate to={ROUTES.HOME} replace state={{ message: '您没有权限访问该页面' }} />
  }

  // Admin accounts: check accountStatus gate
  if (appUser.role === 'admin' && accountStatus !== 'active') {
    return <Navigate to={ROUTES.ACCOUNT_PENDING} replace />
  }

  return <Outlet />
}
