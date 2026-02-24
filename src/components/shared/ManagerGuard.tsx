import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/routes'

export default function ManagerGuard({ children }: { children: React.ReactNode }) {
  const { isManager, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    )
  }

  if (!isManager) {
    return <Navigate to={ROUTES.ADMIN} replace />
  }

  return <>{children}</>
}
