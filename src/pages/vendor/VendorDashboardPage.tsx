import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  X,
  FileText,
  ClipboardList,
  Clock,
  Award,
  ArrowRight,
  Search,
  Send,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getBids } from '@/services/bids.service'
import { getMySubmissions } from '@/services/bids.service'
import { formatDate } from '@/utils/format'
import type { Bid, BidSubmission, SubmissionStatus } from '@/types/bid'
import type { VendorStatus } from '@/types/user'

/* ---------- Constants ---------- */

const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: '已提交',
  under_review: '审核中',
  qualified: '合格',
  awarded: '已中标',
  not_awarded: '未中标',
}

const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  qualified: 'bg-green-100 text-green-700',
  awarded: 'bg-teal-100 text-teal-700',
  not_awarded: 'bg-gray-100 text-gray-500',
}

/* ---------- Vendor Status Banner ---------- */

function VendorStatusBanner({ status }: { status?: VendorStatus }) {
  if (!status) {
    return (
      <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Building2 className="w-5 h-5 shrink-0" />
          <span>您尚未完善企业资料，请先完成企业注册</span>
        </div>
        <Link
          to="/vendor/register"
          className="text-sm font-medium text-teal hover:underline shrink-0"
        >
          前往填写
        </Link>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
        <Clock className="w-5 h-5 shrink-0" />
        <span>企业资料审核中，请耐心等待</span>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
        <Award className="w-5 h-5 shrink-0" />
        <span>企业资料已通过审核</span>
      </div>
    )
  }

  // rejected
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 text-red-700 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>企业资料未通过审核，请修改后重新提交</span>
      </div>
      <Link
        to="/vendor/register"
        className="text-sm font-medium text-red-700 hover:underline shrink-0"
      >
        重新提交
      </Link>
    </div>
  )
}

/* ---------- Component ---------- */

export default function VendorDashboardPage() {
  const { user, appUser } = useAuth()

  const [bids, setBids] = useState<Bid[]>([])
  const [submissions, setSubmissions] = useState<BidSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [bidsData, subsData] = await Promise.all([
        getBids(),
        getMySubmissions(user.uid),
      ])
      setBids(bidsData)
      setSubmissions(subsData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ---- Derived stats ---- */

  const activeBidCount = useMemo(
    () => bids.filter((b) => b.status === 'bidding').length,
    [bids],
  )

  const mySubmissionCount = submissions.length

  const pendingReviewCount = useMemo(
    () =>
      submissions.filter(
        (s) => s.status === 'submitted' || s.status === 'under_review',
      ).length,
    [submissions],
  )

  const awardedCount = useMemo(
    () => submissions.filter((s) => s.status === 'awarded').length,
    [submissions],
  )

  const recentSubmissions = useMemo(() => {
    const sorted = [...submissions].sort((a, b) => {
      const aTime = a.submittedAt?.toDate?.()?.getTime?.() ?? 0
      const bTime = b.submittedAt?.toDate?.()?.getTime?.() ?? 0
      return bTime - aTime
    })
    return sorted.slice(0, 5)
  }, [submissions])

  // Build a Map<bidId, Bid> for display
  const bidMap = useMemo(() => {
    const map = new Map<string, Bid>()
    for (const bid of bids) {
      map.set(bid.id, bid)
    }
    return map
  }, [bids])

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
        <span className="ml-3 text-text-secondary">加载数据...</span>
      </div>
    )
  }

  const vendorStatus = appUser?.vendorProfile?.status

  const stats = [
    {
      label: '当前招标数',
      value: activeBidCount,
      icon: FileText,
      color: 'bg-teal-50 text-teal border-teal-200',
      iconColor: 'text-teal',
    },
    {
      label: '我的投标数',
      value: mySubmissionCount,
      icon: Send,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      label: '待审核数',
      value: pendingReviewCount,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      label: '已中标数',
      value: awardedCount,
      icon: Award,
      color: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-600',
    },
  ]

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
        <h1 className="text-2xl sm:text-3xl font-bold text-teal">供应商工作台</h1>
        <p className="text-text-secondary mt-1 text-sm">
          欢迎回来，{appUser?.displayName || '供应商'}
        </p>
      </div>

      {/* Vendor Status Banner */}
      <VendorStatusBanner status={vendorStatus} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border px-4 py-5 ${stat.color}`}
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/bidding"
          className="flex items-center justify-between bg-white rounded-xl border border-border px-5 py-4 hover:border-teal hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-teal" />
            <span className="text-sm font-medium text-text-primary">浏览招标大厅</span>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-teal transition-colors" />
        </Link>
        <Link
          to="/vendor/my-bids"
          className="flex items-center justify-between bg-white rounded-xl border border-border px-5 py-4 hover:border-teal hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-teal" />
            <span className="text-sm font-medium text-text-primary">我的投标</span>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-teal transition-colors" />
        </Link>
        <Link
          to="/vendor/register"
          className="flex items-center justify-between bg-white rounded-xl border border-border px-5 py-4 hover:border-teal hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-teal" />
            <span className="text-sm font-medium text-text-primary">企业资料</span>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-teal transition-colors" />
        </Link>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-navy">最近投标记录</h2>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">暂无投标记录</p>
            <p className="text-sm text-text-muted mt-1">
              前往招标大厅参与投标
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-gray border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      招标名称
                    </th>
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      提交日期
                    </th>
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSubmissions.map((sub) => {
                    const bid = bidMap.get(sub.bidId)
                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-bg-gray transition-colors"
                      >
                        <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                          <Link
                            to={`/bidding/${sub.bidId}`}
                            className="hover:text-teal transition-colors"
                          >
                            {bid?.title ?? sub.bidId}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-text-secondary">
                          {sub.submittedAt ? formatDate(sub.submittedAt) : '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${SUBMISSION_STATUS_COLORS[sub.status]}`}
                          >
                            {SUBMISSION_STATUS_LABELS[sub.status]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {recentSubmissions.map((sub) => {
                const bid = bidMap.get(sub.bidId)
                return (
                  <div key={sub.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/bidding/${sub.bidId}`}
                        className="text-sm font-medium text-text-primary hover:text-teal transition-colors truncate flex-1 min-w-0"
                      >
                        {bid?.title ?? sub.bidId}
                      </Link>
                      <span
                        className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${SUBMISSION_STATUS_COLORS[sub.status]}`}
                      >
                        {SUBMISSION_STATUS_LABELS[sub.status]}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      {sub.submittedAt ? formatDate(sub.submittedAt) : '-'}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
