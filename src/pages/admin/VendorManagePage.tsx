import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search, X, Loader2, AlertCircle, ExternalLink, Check, XCircle, Users,
} from 'lucide-react'
import { listVendors, approveVendor, rejectVendor } from '@/services/users.service'
import { VENDOR_STATUSES } from '@/config/constants'
import { formatDate } from '@/utils/format'
import type { AppUser } from '@/types/user'
import type { VendorStatus } from '@/types/user'

/* ---------- Constants ---------- */

const STATUS_BADGE_COLORS: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
}

/* ---------- Helpers ---------- */

function getVendorStatusLabel(status: VendorStatus): string {
  return VENDOR_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getVendorStatusColor(status: VendorStatus): string {
  const color = VENDOR_STATUSES.find((s) => s.value === status)?.color ?? 'yellow'
  return STATUS_BADGE_COLORS[color] ?? STATUS_BADGE_COLORS.yellow
}

/* ---------- Component ---------- */

export default function VendorManagePage() {
  // Data
  const [vendors, setVendors] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  /* ---- Fetch data ---- */

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusArg = statusFilter !== 'all' ? (statusFilter as VendorStatus) : undefined
      const data = await listVendors(statusArg)
      setVendors(data)
    } catch (err) {
      console.error('Failed to fetch vendors:', err)
      setError('加载供应商数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vendors
    const q = searchQuery.trim()
    return vendors.filter((v) => {
      const profile = v.vendorProfile
      if (!profile) return false
      return (
        profile.companyName.includes(q) ||
        profile.creditCode.includes(q) ||
        profile.legalPerson.includes(q)
      )
    })
  }, [vendors, searchQuery])

  const vendorCount = filtered.length

  /* ---- Handlers ---- */

  async function handleApprove(uid: string) {
    setActionLoadingId(uid)
    try {
      await approveVendor(uid)
      setVendors((prev) =>
        prev.map((v) =>
          v.uid === uid && v.vendorProfile
            ? { ...v, vendorProfile: { ...v.vendorProfile, status: 'approved' as const } }
            : v,
        ),
      )
    } catch (err) {
      console.error('Failed to approve vendor:', err)
      setError('审批供应商失败，请稍后重试')
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleReject(uid: string) {
    setActionLoadingId(uid)
    try {
      await rejectVendor(uid)
      setVendors((prev) =>
        prev.map((v) =>
          v.uid === uid && v.vendorProfile
            ? { ...v, vendorProfile: { ...v.vendorProfile, status: 'rejected' as const } }
            : v,
        ),
      )
    } catch (err) {
      console.error('Failed to reject vendor:', err)
      setError('拒绝供应商失败，请稍后重试')
    } finally {
      setActionLoadingId(null)
    }
  }

  function openLicense(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载供应商数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">供应商管理</h1>
        <p className="text-text-secondary mt-1 text-sm">
          共 {vendors.length} 个供应商，当前显示 {vendorCount} 个
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-navy text-white'
                : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {VENDOR_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s.value
                  ? 'bg-navy text-white'
                  : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索公司名称、信用代码或法人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
          />
        </div>
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-gray border-b border-border">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  公司名称
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  统一信用代码
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  法人代表
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  状态
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  注册日期
                </th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((vendor) => {
                const profile = vendor.vendorProfile
                if (!profile) return null
                const isActioning = actionLoadingId === vendor.uid
                return (
                  <tr key={vendor.uid} className="hover:bg-bg-gray transition-colors">
                    <td className="px-4 py-3.5">
                      <span
                        className="text-sm font-medium text-text-primary truncate block max-w-[240px]"
                        title={profile.companyName}
                      >
                        {profile.companyName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary font-mono">
                      {profile.creditCode}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">
                      {profile.legalPerson}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getVendorStatusColor(profile.status)}`}>
                        {getVendorStatusLabel(profile.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                      {vendor.createdAt ? formatDate(vendor.createdAt) : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* View license */}
                        {profile.licenseUrl && (
                          <button
                            onClick={() => openLicense(profile.licenseUrl)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-navy hover:bg-navy/10 rounded transition-colors"
                            title="查看资质"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            查看资质
                          </button>
                        )}

                        {/* Approve / Reject buttons (only for pending vendors) */}
                        {profile.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.uid)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded transition-colors disabled:opacity-50"
                              title="通过"
                            >
                              {isActioning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(vendor.uid)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                              title="拒绝"
                            >
                              {isActioning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              拒绝
                            </button>
                          </>
                        )}

                        {/* For already approved/rejected, show re-action buttons */}
                        {profile.status === 'rejected' && (
                          <button
                            onClick={() => handleApprove(vendor.uid)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                            title="重新通过"
                          >
                            {isActioning ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            重新通过
                          </button>
                        )}

                        {profile.status === 'approved' && (
                          <button
                            onClick={() => handleReject(vendor.uid)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="撤销通过"
                          >
                            {isActioning ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            撤销
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((vendor) => {
            const profile = vendor.vendorProfile
            if (!profile) return null
            const isActioning = actionLoadingId === vendor.uid
            return (
              <div key={vendor.uid} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {profile.companyName}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">
                      {profile.creditCode}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${getVendorStatusColor(profile.status)}`}>
                    {getVendorStatusLabel(profile.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span>法人: {profile.legalPerson}</span>
                  <span>注册: {vendor.createdAt ? formatDate(vendor.createdAt) : '-'}</span>
                </div>

                <div className="flex items-center justify-end gap-1">
                  {profile.licenseUrl && (
                    <button
                      onClick={() => openLicense(profile.licenseUrl)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-navy hover:bg-navy/10 rounded transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      资质
                    </button>
                  )}

                  {profile.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(vendor.uid)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded transition-colors disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        通过
                      </button>
                      <button
                        onClick={() => handleReject(vendor.uid)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        拒绝
                      </button>
                    </>
                  )}

                  {profile.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(vendor.uid)}
                      disabled={isActioning}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                    >
                      {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      重新通过
                    </button>
                  )}

                  {profile.status === 'approved' && (
                    <button
                      onClick={() => handleReject(vendor.uid)}
                      disabled={isActioning}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                    >
                      {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      撤销
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">没有找到匹配的供应商</p>
            <p className="text-sm text-text-muted mt-1">
              尝试调整筛选条件或搜索关键词
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
