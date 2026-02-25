import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Shield, ShieldCheck, CheckCircle } from 'lucide-react'
import { signUp, signOut } from '@/services/auth.service'
import { validateInviteCode } from '@/services/security-code.service'
import { ROUTES } from '@/config/routes'
import { COMPANY } from '@/config/constants'
import { cn } from '@/utils/cn'

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

type TabKey = 'vendor' | 'worker' | 'manager'

const TABS: { key: TabKey; label: string; icon: typeof Building2; description: string }[] = [
  { key: 'vendor', label: '供应商注册', icon: Building2, description: '注册后可立即登录，完善企业资料后参与投标' },
  { key: 'worker', label: '管理员申请', icon: Shield, description: '申请成为系统管理员，需等待审批通过后方可登录' },
  { key: 'manager', label: '高级管理员', icon: ShieldCheck, description: '需要邀请码注册，审批通过后获得最高管理权限' },
]

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('vendor')

  // Shared fields
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Vendor fields
  const [companyName, setCompanyName] = useState('')
  const [registrationReason, setRegistrationReason] = useState('')

  // Worker fields
  const [position, setPosition] = useState('')
  const [reason, setReason] = useState('')

  // Manager fields
  const [inviteCode, setInviteCode] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validateCommon(): string | null {
    if (!displayName.trim()) return '请输入姓名'
    if (!email.trim()) return '请输入邮箱地址'
    if (!phone.trim()) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确'
    if (password.length < 6) return '密码长度不能少于6位'
    if (password !== confirmPassword) return '两次输入的密码不一致'
    return null
  }

  function validateTab(): string | null {
    if (activeTab === 'vendor') {
      if (!companyName.trim()) return '请输入公司名称'
    }
    if (activeTab === 'worker') {
      if (!position.trim()) return '请输入公司职位'
      if (!reason.trim()) return '请输入申请理由'
    }
    if (activeTab === 'manager') {
      if (!inviteCode.trim()) return '请输入邀请码'
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const commonError = validateCommon()
    if (commonError) { setError(commonError); return }

    const tabError = validateTab()
    if (tabError) { setError(tabError); return }

    setLoading(true)

    try {
      if (activeTab === 'manager') {
        const valid = await validateInviteCode(inviteCode.trim())
        if (!valid) {
          setError('邀请码无效，请联系高级管理员获取正确的邀请码')
          setLoading(false)
          return
        }
      }

      if (activeTab === 'vendor') {
        await signUp({
          email,
          password,
          displayName: displayName.trim(),
          phone: phone.trim(),
          role: 'vendor',
          companyName: companyName.trim(),
          registrationReason: registrationReason.trim() || undefined,
        })
        await signOut()
        setSuccess(true)
      } else if (activeTab === 'worker') {
        await signUp({
          email,
          password,
          displayName: displayName.trim(),
          phone: phone.trim(),
          role: 'admin',
          adminLevel: 'worker',
          adminApplication: {
            realName: displayName.trim(),
            position: position.trim(),
            reason: reason.trim(),
          },
        })
        await signOut()
        setSuccess(true)
      } else {
        await signUp({
          email,
          password,
          displayName: displayName.trim(),
          phone: phone.trim(),
          role: 'admin',
          adminLevel: 'manager',
          inviteCode: inviteCode.trim(),
          adminApplication: {
            realName: displayName.trim(),
            position: '高级管理员',
            reason: '通过邀请码注册',
          },
        })
        await signOut()
        setSuccess(true)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-gray px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-lg text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy mb-2">
              {activeTab === 'vendor' ? '注册成功' : activeTab === 'worker' ? '申请已提交' : '注册成功'}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {activeTab === 'vendor'
                ? '供应商账号注册成功！请使用您的邮箱和密码登录系统，完善企业资料后即可参与投标。'
                : activeTab === 'worker'
                  ? '您的管理员申请已提交，请等待高级管理员审批。审批通过后您将收到通知，届时可正常登录系统。'
                  : '您的高级管理员账号已注册成功，请等待审批通过后登录系统。'}
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center w-full rounded-md bg-navy py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark"
            >
              {activeTab === 'vendor' ? '立即登录' : '返回登录'}
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {COMPANY.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-gray px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Back to login */}
        <div className="mb-4">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-navy">{COMPANY.name}</h1>
          <p className="mt-2 text-gold">{COMPANY.slogan}</p>
        </div>

        {/* Register Card */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-bg-gray rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setError('') }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.replace('注册', '').replace('申请', '')}</span>
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-text-muted mb-4 text-center">
            {TABS.find((t) => t.key === activeTab)?.description}
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields */}
            <div>
              <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-text-primary">
                {activeTab === 'vendor' ? '联系人姓名' : '真实姓名'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Tab-specific fields */}
            {activeTab === 'vendor' && (
              <>
                <div>
                  <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-text-primary">
                    公司名称
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="请输入公司全称"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
                <div>
                  <label htmlFor="registrationReason" className="mb-1 block text-sm font-medium text-text-primary">
                    注册说明
                    <span className="text-text-muted font-normal ml-1">（可选）</span>
                  </label>
                  <input
                    id="registrationReason"
                    type="text"
                    value={registrationReason}
                    onChange={(e) => setRegistrationReason(e.target.value)}
                    placeholder="简要说明注册目的"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
              </>
            )}

            {activeTab === 'worker' && (
              <>
                <div>
                  <label htmlFor="position" className="mb-1 block text-sm font-medium text-text-primary">
                    公司职位
                  </label>
                  <input
                    id="position"
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="请输入您的职位"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
                <div>
                  <label htmlFor="reason" className="mb-1 block text-sm font-medium text-text-primary">
                    申请理由
                  </label>
                  <textarea
                    id="reason"
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="请说明申请管理员权限的理由"
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy resize-y"
                  />
                </div>
              </>
            )}

            {activeTab === 'manager' && (
              <div>
                <label htmlFor="inviteCode" className="mb-1 block text-sm font-medium text-text-primary">
                  邀请码
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="请输入高级管理员邀请码"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy font-mono tracking-wider"
                />
                <p className="text-xs text-text-muted mt-1">
                  请向现有高级管理员获取邀请码
                </p>
              </div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="至少6位"
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
                  placeholder="再次输入密码"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-navy py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? '处理中...'
                : activeTab === 'vendor'
                  ? '注册'
                  : activeTab === 'worker'
                    ? '提交申请'
                    : '注册高级管理员'}
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
