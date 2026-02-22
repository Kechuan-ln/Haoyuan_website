import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '@/services/auth.service'
import { ROUTES } from '@/config/routes'
import { COMPANY } from '@/config/constants'
import type { UserRole } from '@/types/user'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': '该邮箱已被注册',
  'auth/invalid-email': '邮箱格式不正确',
  'auth/weak-password': '密码强度不够，请使用至少6位密码',
  'auth/operation-not-allowed': '注册功能暂不可用，请联系管理员',
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return ERROR_MESSAGES[code] ?? '注册失败，请稍后重试'
  }
  return '注册失败，请稍后重试'
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('vendor')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!displayName.trim()) return '请输入姓名'
    if (!email.trim()) return '请输入邮箱地址'
    if (!phone.trim()) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确'
    if (password.length < 6) return '密码长度不能少于6位'
    if (password !== confirmPassword) return '两次输入的密码不一致'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, displayName.trim(), phone.trim(), role)
      navigate(role === 'vendor' ? ROUTES.VENDOR_DASHBOARD : ROUTES.HOME)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-gray px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy">
            {COMPANY.name}
          </h1>
          <p className="mt-2 text-gold">{COMPANY.slogan}</p>
        </div>

        {/* Register Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-xl font-semibold text-navy">
            用户注册
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-text-primary">
                姓名
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

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
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-text-primary">
                手机号
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
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
                placeholder="请输入密码（至少6位）"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-text-primary">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                账号类型
              </label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={role === 'vendor'}
                    onChange={() => setRole('vendor')}
                    className="h-4 w-4 accent-navy"
                  />
                  <span className="text-sm text-text-primary">供应商</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="reviewer"
                    checked={role === 'reviewer'}
                    onChange={() => setRole('reviewer')}
                    className="h-4 w-4 accent-navy"
                  />
                  <span className="text-sm text-text-primary">普通用户</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link to={ROUTES.LOGIN} className="text-gold hover:text-gold-dark transition-colors">
              已有账号？立即登录
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} {COMPANY.name}
        </p>
      </div>
    </div>
  )
}
