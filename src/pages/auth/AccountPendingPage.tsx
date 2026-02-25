import { Link } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import { signOut } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'
import { COMPANY } from '@/config/constants'
import { useAuth } from '@/contexts/AuthContext'

export default function AccountPendingPage() {
  const { accountStatus } = useAuth()

  const isSuspended = accountStatus === 'suspended'

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-gray px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg text-center">
          <Clock className={`w-16 h-16 mx-auto mb-4 ${isSuspended ? 'text-red-400' : 'text-yellow-400'}`} />
          <h2 className="text-xl font-bold text-navy mb-2">
            {isSuspended ? '账号已停用' : '账号审批中'}
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {isSuspended
              ? '您的账号已被停用，如有疑问请联系管理员。'
              : '您的管理员账号正在审批中，请耐心等待高级管理员审核。审批通过后您将可以正常登录系统。'}
          </p>
          <Link
            to={ROUTES.LOGIN}
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-navy py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} {COMPANY.name}
        </p>
      </div>
    </div>
  )
}
