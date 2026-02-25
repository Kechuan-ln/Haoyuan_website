import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  X,
  ClipboardList,
  Eye,
  Edit2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getMySubmissions, getBids } from '@/services/bids.service'
import { formatDate } from '@/utils/format'
import type { Bid, BidSubmission, SubmissionStatus } from '@/types/bid'

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

type FilterTab = 'all' | SubmissionStatus

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: '全部', value: 'all' },
  { label: '已提交', value: 'submitted' },
  { label: '审核中', value: 'under_review' },
  { label: '合格', value: 'qualified' },
  { label: '已中标', value: 'awarded' },
  { label: '未中标', value: 'not_awarded' },
]

/* ---------- Component ---------- */

export default function VendorMyBidsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState<BidSubmission[]>([])
  const [bidMap, setBidMap] = useState<Map<string, Bid>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [subsData, bidsData] = await Promise.all([
        getMySubmissions(user.uid),
        getBids({ statusIn: ['published', 'bidding', 'closed', 'awarded'] }),
      ])
      setSubmissions(subsData)

      // Build bidMap from all bids
      const map = new Map<string, Bid>()
      for (const bid of bidsData) {
        map.set(bid.id, bid)
      }
      setBidMap(map)
    } catch (err) {
      console.error('Failed to fetch my bids data:', err)
      setError('加载投标数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    if (activeTab === 'all') return submissions
    return submissions.filter((s) => s.status === activeTab)
  }, [submissions, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: submissions.length }
    for (const sub of submissions) {
      counts[sub.status] = (counts[sub.status] || 0) + 1
    }
    return counts
  }, [submissions])

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
        <span className="ml-3 text-text-secondary">加载投标数据...</span>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-teal">我的投标</h1>
        <p className="text-text-secondary mt-1 text-sm">
          共 {submissions.length} 条投标记录
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const count = tabCounts[tab.value] ?? 0
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal text-white'
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-xs ${
                      isActive ? 'text-white/80' : 'text-text-muted'
                    }`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">暂无投标记录</p>
            <p className="text-sm text-text-muted mt-1">
              {activeTab === 'all'
                ? '前往招标大厅参与投标'
                : '当前筛选条件下没有记录'}
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
                      标号
                    </th>
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      提交日期
                    </th>
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      状态
                    </th>
                    <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((sub) => {
                    const bid = bidMap.get(sub.bidId)
                    const canEdit = sub.status === 'submitted' && !sub.isLocked
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
                        <td className="px-4 py-3.5 text-sm text-text-secondary font-mono">
                          {bid?.bidNumber ?? '-'}
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
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/vendor/bid/${sub.bidId}/result`)
                              }
                              className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                              title="查看结果"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() =>
                                  navigate(`/vendor/bid/${sub.bidId}/submit`)
                                }
                                className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                                title="修改"
                              >
                                <Edit2 className="w-4 h-4" />
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
              {filtered.map((sub) => {
                const bid = bidMap.get(sub.bidId)
                const canEdit = sub.status === 'submitted' && !sub.isLocked
                return (
                  <div key={sub.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/bidding/${sub.bidId}`}
                          className="text-sm font-medium text-text-primary hover:text-teal transition-colors block truncate"
                        >
                          {bid?.title ?? sub.bidId}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5 font-mono">
                          {bid?.bidNumber ?? '-'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${SUBMISSION_STATUS_COLORS[sub.status]}`}
                      >
                        {SUBMISSION_STATUS_LABELS[sub.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-muted">
                        {sub.submittedAt ? formatDate(sub.submittedAt) : '-'}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/vendor/bid/${sub.bidId}/result`)
                          }
                          className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() =>
                              navigate(`/vendor/bid/${sub.bidId}/submit`)
                            }
                            className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
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
