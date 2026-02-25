import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  Shield,
  Truck,
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Ban,
  Loader2,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react'
import type { AdminLevel, UserRole, VendorStatus, AccountStatus } from '@/types/user'
import type { AppUser } from '@/types/user'
import { useAuth } from '@/contexts/AuthContext'
import {
  listUsers,
  approveVendor,
  rejectVendor,
  updateUserAdminLevel,
  listPendingAdminApplications,
  updateAccountStatus,
} from '@/services/users.service'
import { notifyAccountStatus } from '@/services/notifications.service'
import { ADMIN_LEVELS } from '@/config/constants'

/* ---------- Constants ---------- */

const ROLE_TABS: { value: string; label: string; icon: typeof Shield }[] = [
  { value: 'all', label: '全部', icon: Users },
  { value: 'pending_approval', label: '待审批', icon: ClipboardCheck },
  { value: 'admin', label: '管理员', icon: Shield },
  { value: 'vendor', label: '供应商', icon: Truck },
  { value: 'reviewer', label: '评审专家', icon: Star },
]

const ACCOUNT_STATUS_BADGE_MAP: Record<AccountStatus, { label: string; className: string }> = {
  active: { label: '正常', className: 'bg-green-100 text-green-700' },
  pending_approval: { label: '待审批', className: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: '已停用', className: 'bg-red-100 text-red-700' },
}

const VENDOR_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
]

const ROLE_BADGE_MAP: Record<UserRole, { label: string; className: string }> = {
  admin: { label: '管理员', className: 'bg-navy/10 text-navy' },
  vendor: { label: '供应商', className: 'bg-teal/10 text-teal' },
  reviewer: { label: '评审专家', className: 'bg-gold/10 text-gold-dark' },
}

const VENDOR_STATUS_BADGE_MAP: Record<
  VendorStatus,
  { label: string; className: string }
> = {
  pending: { label: '待审核', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已通过', className: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
}

/* ---------- Helpers ---------- */

function formatTimestamp(ts: unknown): string {
  if (!ts) return '未知'
  // Firestore Timestamp has a toDate() method
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    const date = (ts as { toDate: () => Date }).toDate()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }
  // Fallback for string dates
  if (typeof ts === 'string') {
    const [year, month, day] = ts.split('-')
    return `${year}年${month}月${day}日`
  }
  return '未知'
}

/* ---------- Component ---------- */

export default function UserManagePage() {
  const { isManager, appUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRole, setActiveRole] = useState('all')
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPending = useCallback(async () => {
    try {
      const data = await listPendingAdminApplications()
      setPendingUsers(data)
      setPendingCount(data.length)
    } catch {
      // Silently fail — pending count is non-critical
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchPending()
  }, [fetchUsers, fetchPending])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeRole !== 'all' && user.role !== activeRole) {
        return false
      }
      if (
        activeRole === 'vendor' &&
        vendorStatusFilter !== 'all' &&
        user.vendorProfile?.status !== vendorStatusFilter
      ) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !user.displayName.toLowerCase().includes(query) &&
          !user.email.toLowerCase().includes(query)
        ) {
          return false
        }
      }
      return true
    })
  }, [users, activeRole, vendorStatusFilter, searchQuery])

  async function handleApproveVendor(uid: string) {
    try {
      await approveVendor(uid)
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid && u.vendorProfile
            ? { ...u, vendorProfile: { ...u.vendorProfile, status: 'approved' as const } }
            : u,
        ),
      )
    } catch (err) {
      alert('审核通过失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleRejectVendor(uid: string) {
    try {
      await rejectVendor(uid)
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid && u.vendorProfile
            ? { ...u, vendorProfile: { ...u.vendorProfile, status: 'rejected' as const } }
            : u,
        ),
      )
    } catch (err) {
      alert('审核拒绝失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleApproveAdmin(uid: string) {
    try {
      await updateAccountStatus(uid, 'active')
      if (appUser) {
        await notifyAccountStatus(uid, true, appUser.uid, appUser.displayName)
      }
      setPendingUsers((prev) => prev.filter((u) => u.uid !== uid))
      setPendingCount((prev) => Math.max(0, prev - 1))
      // Also update the main users list
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, accountStatus: 'active' as const } : u,
        ),
      )
    } catch (err) {
      alert('审批通过失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleRejectAdmin(uid: string) {
    try {
      await updateAccountStatus(uid, 'suspended')
      if (appUser) {
        await notifyAccountStatus(uid, false, appUser.uid, appUser.displayName)
      }
      setPendingUsers((prev) => prev.filter((u) => u.uid !== uid))
      setPendingCount((prev) => Math.max(0, prev - 1))
      // Also update the main users list
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, accountStatus: 'suspended' as const } : u,
        ),
      )
    } catch (err) {
      alert('审批拒绝失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  function handleToggleDisabled() {
    alert('功能开发中')
  }

  async function handleAdminLevelChange(uid: string, newLevel: AdminLevel) {
    try {
      await updateUserAdminLevel(uid, newLevel)
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, adminLevel: newLevel } : u,
        ),
      )
    } catch (err) {
      alert('更新管理员级别失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  function handleToggleExpand(uid: string) {
    setExpandedUserId((prev) => (prev === uid ? null : uid))
  }

  const showVendorStatusFilter = activeRole === 'all' || activeRole === 'vendor'
  const isPendingApprovalTab = activeRole === 'pending_approval'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin mb-4" />
        <p className="text-sm text-text-secondary">加载用户数据...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">用户管理</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-sm font-medium text-navy">
            <Users className="w-3.5 h-3.5" />
            {users.length} 位用户
          </span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          管理系统用户、供应商审核与角色权限
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6 space-y-4">
        {/* Role Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveRole(tab.value)
                setVendorStatusFilter('all')
              }}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeRole === tab.value
                  ? 'bg-navy text-white'
                  : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.value === 'pending_approval' && pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vendor Status Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {showVendorStatusFilter && (
            <div className="flex gap-2">
              {VENDOR_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setVendorStatusFilter(filter.value)}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    vendorStatusFilter === filter.value
                      ? 'border-navy bg-navy/5 text-navy'
                      : 'border-border text-text-secondary hover:border-navy/30 hover:text-text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索姓名或邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pending Admin Approval Table */}
      {isPendingApprovalTab && (
        <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">暂无待审批的管理员申请</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-gray/50">
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      姓名
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      邮箱
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      手机号
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      职位
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      申请理由
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      申请级别
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      申请时间
                    </th>
                    <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingUsers.map((user) => (
                    <tr key={user.uid} className="group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-yellow-700">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-text-primary">
                            {user.displayName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-text-secondary">{user.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">
                          {user.adminApplication?.position ?? '未填写'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-text-secondary line-clamp-2">
                          {user.adminApplication?.reason ?? '未填写'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {ADMIN_LEVELS.find((l) => l.value === (user.adminLevel ?? 'worker'))?.label ?? '员工'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-text-secondary">
                          {formatTimestamp(user.adminApplication?.appliedAt ?? user.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveAdmin(user.uid)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            title="通过审批"
                          >
                            <Check className="w-3.5 h-3.5" />
                            通过
                          </button>
                          <button
                            onClick={() => handleRejectAdmin(user.uid)}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="拒绝审批"
                          >
                            <X className="w-3.5 h-3.5" />
                            拒绝
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {pendingUsers.length > 0 && (
            <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-bg-gray/30">
              <p className="text-sm text-text-muted">
                共 {pendingUsers.length} 条待审批申请
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Table */}
      {!isPendingApprovalTab && (
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">暂无符合条件的用户</p>
            <p className="text-sm text-text-muted mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-gray/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    姓名
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    邮箱
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                    手机号
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    角色
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    状态
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                    注册时间
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const roleBadge = ROLE_BADGE_MAP[user.role]
                  const vendorStatus = user.vendorProfile
                    ? VENDOR_STATUS_BADGE_MAP[user.vendorProfile.status]
                    : null
                  const isExpanded = expandedUserId === user.uid
                  const isVendor = user.role === 'vendor'

                  return (
                    <tr key={user.uid} className="group">
                      {/* Main Row */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-navy">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {user.displayName}
                            </p>
                            {isVendor && user.vendorProfile && (
                              <p className="text-xs text-text-muted mt-0.5">
                                {user.vendorProfile.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-text-secondary">{user.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge.className}`}
                          >
                            {roleBadge.label}
                          </span>
                          {user.role === 'admin' && (
                            <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {ADMIN_LEVELS.find((l) => l.value === (user.adminLevel ?? 'manager'))?.label ?? '经理'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendorStatus ? (
                          <span
                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${vendorStatus.className}`}
                          >
                            {vendorStatus.label}
                          </span>
                        ) : (() => {
                          const acctStatus = user.accountStatus ?? 'active'
                          const badge = ACCOUNT_STATUS_BADGE_MAP[acctStatus]
                          return (
                            <span
                              className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-text-secondary">
                          {formatTimestamp(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve / Reject for pending vendors */}
                          {isVendor &&
                            user.vendorProfile?.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveVendor(user.uid)}
                                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                                  title="通过审核"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  通过
                                </button>
                                <button
                                  onClick={() => handleRejectVendor(user.uid)}
                                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                  title="拒绝审核"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  拒绝
                                </button>
                              </>
                            )}

                          {/* View vendor detail */}
                          {isVendor && user.vendorProfile && (
                            <button
                              onClick={() => handleToggleExpand(user.uid)}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
                              title="查看详情"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                              详情
                            </button>
                          )}

                          {/* Admin level toggle (manager only) */}
                          {isManager && user.role === 'admin' && (
                            <select
                              value={user.adminLevel ?? 'manager'}
                              onChange={(e) => handleAdminLevelChange(user.uid, e.target.value as AdminLevel)}
                              className="rounded-md border border-border px-2 py-1 text-xs font-medium text-navy bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                              title="更改管理员级别"
                            >
                              {ADMIN_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Disable / Enable toggle (placeholder) */}
                          <button
                            onClick={handleToggleDisabled}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-text-muted hover:bg-gray-100 transition-colors"
                            title="禁用用户"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            禁用
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendor Detail Panel (expandable) */}
        {expandedUserId && (
          <VendorDetailPanel
            user={users.find((u) => u.uid === expandedUserId)!}
            onApprove={handleApproveVendor}
            onReject={handleRejectVendor}
            onClose={() => setExpandedUserId(null)}
          />
        )}

        {/* Table Footer */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-bg-gray/30">
            <p className="text-sm text-text-muted">
              显示 {filteredUsers.length} 位用户（共 {users.length} 位）
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

/* ---------- Vendor Detail Panel ---------- */

function VendorDetailPanel({
  user,
  onApprove,
  onReject,
  onClose,
}: {
  user: AppUser
  onApprove: (uid: string) => void
  onReject: (uid: string) => void
  onClose: () => void
}) {
  const profile = user.vendorProfile
  if (!profile) return null

  const statusBadge = VENDOR_STATUS_BADGE_MAP[profile.status]

  return (
    <div className="border-t border-border bg-bg-gray/30 px-6 py-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-bold text-navy">供应商详细信息</h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-text-muted mb-1">公司名称</p>
          <p className="text-sm font-medium text-text-primary">{profile.companyName}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">统一社会信用代码</p>
          <p className="text-sm font-medium text-text-primary font-mono">
            {profile.creditCode}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">法人代表</p>
          <p className="text-sm font-medium text-text-primary">{profile.legalPerson}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">审核状态</p>
          <span
            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* License */}
      <div className="mt-4">
        <p className="text-xs text-text-muted mb-1">营业执照</p>
        {profile.licenseUrl ? (
          <a
            href={profile.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-navy hover:underline"
          >
            查看营业执照
          </a>
        ) : (
          <p className="text-sm text-text-muted">暂未上传</p>
        )}
      </div>

      {/* Audit Actions */}
      {profile.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-border flex gap-3">
          <button
            onClick={() => onApprove(user.uid)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            通过审核
          </button>
          <button
            onClick={() => onReject(user.uid)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
            拒绝审核
          </button>
        </div>
      )}
    </div>
  )
}
