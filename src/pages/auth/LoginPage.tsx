import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signIn, resetPassword } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'
import { COMPANY } from '@/config/constants'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': '邮箱或密码错误',
  'auth/user-not-found': '该邮箱尚未注册',
  'auth/wrong-password': '密码错误',
  'auth/too-many-requests': '登录尝试次数过多，请稍后再试',
  'auth/user-disabled': '该账号已被禁用，请联系管理员',
  'auth/invalid-email': '邮箱格式不正确',
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return ERROR_MESSAGES[code] ?? '登录失败，请稍后重试'
  }
  return '登录失败，请稍后重试'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { appUser, loading: authLoading, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(false)

  // Redirect after appUser is populated by AuthContext
  useEffect(() => {
    if (!pendingRedirect || authLoading) return

    if (appUser) {
      setPendingRedirect(false)
      setLoading(false)
      // Check admin account status
      const status = appUser.accountStatus ?? 'active'
      if (appUser.role === 'admin' && status !== 'active') {
        navigate(ROUTES.ACCOUNT_PENDING)
        return
      }
      if (appUser.role === 'admin') {
        navigate(ROUTES.ADMIN)
      } else if (appUser.role === 'vendor') {
        navigate(ROUTES.VENDOR_DASHBOARD)
      } else {
        navigate(ROUTES.HOME)
      }
    } else if (authError) {
      // AuthContext failed to load user doc (e.g. offline, rules error)
      setPendingRedirect(false)
      setLoading(false)
      setError(authError)
    }
  }, [pendingRedirect, appUser, authLoading, authError, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      setPendingRedirect(true)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!resetEmail) {
      setError('请输入邮箱地址')
      return
    }

    try {
      await resetPassword(resetEmail)
      setResetSent(true)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-gray px-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-4">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy">
            {COMPANY.name}
          </h1>
          <p className="mt-2 text-gold">{COMPANY.slogan}</p>
        </div>

        {/* Login Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-xl font-semibold text-navy">
            用户登录
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-primary">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-primary">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setShowResetModal(true); setResetSent(false); setResetEmail('') }}
              className="text-teal hover:text-teal-dark transition-colors"
            >
              忘记密码？
            </button>
            <Link to={ROUTES.REGISTER} className="text-gold hover:text-gold-dark transition-colors">
              没有账号？立即注册
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} {COMPANY.name}
        </p>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-navy">重置密码</h3>

            {resetSent ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  重置密码邮件已发送至 <span className="font-medium">{resetEmail}</span>，请查收邮箱。
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full rounded-md bg-navy py-2 text-sm font-medium text-white hover:bg-navy-dark"
                >
                  关闭
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  请输入您的注册邮箱，我们将发送重置密码链接。
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 rounded-md border border-border py-2 text-sm font-medium text-text-secondary hover:bg-bg-gray"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="flex-1 rounded-md bg-navy py-2 text-sm font-medium text-white hover:bg-navy-dark"
                  >
                    发送
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
