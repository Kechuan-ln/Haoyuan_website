import { useState, useEffect, useCallback, useMemo, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, Loader2, AlertCircle, X, CheckCircle,
  Clock, Users, Award, FileText,
} from 'lucide-react'
import { getBid, getSubmissionsForBid, updateBid, updateSubmissionStatus } from '@/services/bids.service'
import { getEvaluationsForBid } from '@/services/evaluations.service'
import { BID_STATUSES } from '@/config/constants'
import { formatDate, formatCurrency } from '@/utils/format'
import type { Bid, BidStatus, BidSubmission, Evaluation, EvaluationScores } from '@/types/bid'

/* ---------- Types ---------- */

interface SubmissionSummary {
  submission: BidSubmission
  evaluations: Evaluation[]
  evalCount: number
  avgTechnical: number
  avgCommercial: number
  avgQualification: number
  avgOverall: number
}

/* ---------- Constants ---------- */

const STATUS_BADGE_COLORS: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
  navy: 'bg-[#1B3A5C]/10 text-[#1B3A5C]',
}

const RECOMMENDATION_LABELS: Record<string, string> = {
  recommended: '推荐',
  not_recommended: '不推荐',
  pending: '待定',
}

/* ---------- Helpers ---------- */

function getStatusLabel(status: BidStatus): string {
  return BID_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getStatusColor(status: BidStatus): string {
  const color = BID_STATUSES.find((s) => s.value === status)?.color ?? 'gray'
  return STATUS_BADGE_COLORS[color] ?? STATUS_BADGE_COLORS.gray
}

function calcAvg(evals: Evaluation[], key: keyof EvaluationScores): number {
  if (evals.length === 0) return 0
  const sum = evals.reduce((acc, e) => acc + e.scores[key], 0)
  return Math.round((sum / evals.length) * 100) / 100
}

/* ---------- Component ---------- */

export default function EvaluationReportPage() {
  const { id } = useParams<{ id: string }>()

  // Data
  const [bid, setBid] = useState<Bid | null>(null)
  const [submissions, setSubmissions] = useState<BidSubmission[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedVendorSubId, setSelectedVendorSubId] = useState<string>('')
  const [awarding, setAwarding] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  /* ---- Fetch data ---- */

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [bidData, subsData, evalsData] = await Promise.all([
        getBid(id),
        getSubmissionsForBid(id),
        getEvaluationsForBid(id),
      ])
      if (!bidData) {
        setError('招标不存在')
        setLoading(false)
        return
      }
      setBid(bidData)
      setSubmissions(subsData)
      setEvaluations(evalsData)
    } catch (err) {
      console.error('Failed to fetch report data:', err)
      setError('加载评标报告失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ---- Computed: Submission summaries sorted by avgOverall desc ---- */

  const summaries: SubmissionSummary[] = useMemo(() => {
    return submissions
      .map((sub) => {
        const subEvals = evaluations.filter((e) => e.submissionId === sub.id)
        return {
          submission: sub,
          evaluations: subEvals,
          evalCount: subEvals.length,
          avgTechnical: calcAvg(subEvals, 'technical'),
          avgCommercial: calcAvg(subEvals, 'commercial'),
          avgQualification: calcAvg(subEvals, 'qualification'),
          avgOverall: calcAvg(subEvals, 'overall'),
        }
      })
      .sort((a, b) => b.avgOverall - a.avgOverall)
  }, [submissions, evaluations])

  /* ---- Handlers ---- */

  function toggleExpand(submissionId: string) {
    setExpandedId((prev) => (prev === submissionId ? null : submissionId))
  }

  async function handleAward() {
    if (!id || !selectedVendorSubId) return
    setAwarding(true)
    setError(null)
    try {
      const winningSub = submissions.find((s) => s.id === selectedVendorSubId)
      if (!winningSub) {
        setError('未找到选中的投标')
        setAwarding(false)
        return
      }

      // Update bid with awarded vendor and status
      await updateBid(id, {
        awardedVendorId: winningSub.vendorId,
        status: 'awarded',
      })

      // Update winning submission
      await updateSubmissionStatus(selectedVendorSubId, 'awarded')

      // Update other submissions
      const otherSubs = submissions.filter((s) => s.id !== selectedVendorSubId)
      await Promise.all(
        otherSubs.map((s) => updateSubmissionStatus(s.id, 'not_awarded')),
      )

      // Update local state
      setBid((prev) => prev ? { ...prev, awardedVendorId: winningSub.vendorId, status: 'awarded' as const } : prev)
      setSubmissions((prev) =>
        prev.map((s) => ({
          ...s,
          status: s.id === selectedVendorSubId ? 'awarded' as const : 'not_awarded' as const,
        })),
      )

      setSuccessMessage(`已成功定标: ${winningSub.vendorCompanyName}`)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      console.error('Failed to award bid:', err)
      setError('定标操作失败，请稍后重试')
    } finally {
      setAwarding(false)
    }
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载评标报告...</span>
      </div>
    )
  }

  if (!bid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h1 className="text-xl font-bold text-navy mb-2">招标不存在</h1>
          <Link to="/admin/bids" className="text-sm text-teal hover:underline">
            返回招标管理
          </Link>
        </div>
      </div>
    )
  }

  const canAward = bid.status === 'evaluating' || bid.status === 'closed'
  const topOverall = summaries.length > 0 ? summaries[0].avgOverall : 0

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

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 rounded hover:bg-green-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/admin/bids" className="hover:text-navy transition-colors">
          招标管理
        </Link>
        <span>/</span>
        <Link to={`/admin/bids/${id}/evaluate`} className="hover:text-navy transition-colors">
          在线评审
        </Link>
        <span>/</span>
        <span className="text-text-primary">评标报告</span>
      </div>

      {/* Bid Summary Card */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy">{bid.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="font-mono">{bid.bidNumber}</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bid.status)}`}>
                {getStatusLabel(bid.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {submissions.length} 家投标
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                截止: {bid.biddingDeadline ? formatDate(bid.biddingDeadline) : '-'}
              </span>
              <span>预算: {formatCurrency(bid.budget)}</span>
            </div>
          </div>
          <Link
            to={`/admin/bids/${id}/evaluate`}
            className="shrink-0 px-4 py-2 text-sm font-medium text-navy border border-navy rounded-lg hover:bg-navy/5 transition-colors"
          >
            返回评审
          </Link>
        </div>
      </div>

      {/* Evaluation Summary Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-navy">评标汇总</h2>
          <p className="text-sm text-text-muted mt-1">
            按综合评分从高到低排列，点击行查看各评审员打分详情
          </p>
        </div>

        {summaries.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">暂无评标数据</p>
            <p className="text-sm text-text-muted mt-1">请先完成评审打分</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-gray border-b border-border">
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 w-16">
                      排名
                    </th>
                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      供应商名称
                    </th>
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      评审次数
                    </th>
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      技术分
                    </th>
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      商务分
                    </th>
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      资质分
                    </th>
                    <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                      综合分
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summaries.map((s, idx) => {
                    const isTop = s.avgOverall > 0 && s.avgOverall === topOverall
                    const isExpanded = expandedId === s.submission.id
                    return (
                      <Fragment key={s.submission.id}>
                        <tr
                          onClick={() => toggleExpand(s.submission.id)}
                          className={`cursor-pointer transition-colors ${
                            isTop ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-bg-gray'
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              idx === 0 ? 'bg-gold text-white' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-bg-gray text-text-secondary'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">
                                {s.submission.vendorCompanyName}
                              </span>
                              {s.submission.status === 'awarded' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gold/20 text-gold">
                                  <Award className="w-3 h-3" />
                                  中标
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                            {s.evalCount}
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                            {s.avgTechnical}
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                            {s.avgCommercial}
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                            {s.avgQualification}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`text-sm font-bold ${isTop ? 'text-green-700' : 'text-text-primary'}`}>
                              {s.avgOverall}
                            </span>
                          </td>
                          <td className="px-2 py-3.5">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-text-muted" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-text-muted" />
                            )}
                          </td>
                        </tr>

                        {/* Expanded: Individual evaluator scores */}
                        {isExpanded && s.evaluations.length > 0 && (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <div className="bg-bg-gray border-y border-border">
                                <div className="px-6 py-3">
                                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                                    各评审员打分详情
                                  </h4>
                                  <div className="space-y-3">
                                    {s.evaluations.map((ev) => (
                                      <div
                                        key={ev.id}
                                        className="bg-white rounded-lg border border-border p-3"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-text-primary">
                                            {ev.reviewerName}
                                          </span>
                                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                            ev.recommendation === 'recommended'
                                              ? 'bg-green-100 text-green-700'
                                              : ev.recommendation === 'not_recommended'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {RECOMMENDATION_LABELS[ev.recommendation] ?? ev.recommendation}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3 text-xs mb-2">
                                          <div>
                                            <span className="text-text-muted">技术</span>
                                            <span className="ml-1 font-medium text-text-primary">{ev.scores.technical}</span>
                                          </div>
                                          <div>
                                            <span className="text-text-muted">商务</span>
                                            <span className="ml-1 font-medium text-text-primary">{ev.scores.commercial}</span>
                                          </div>
                                          <div>
                                            <span className="text-text-muted">资质</span>
                                            <span className="ml-1 font-medium text-text-primary">{ev.scores.qualification}</span>
                                          </div>
                                          <div>
                                            <span className="text-text-muted">综合</span>
                                            <span className="ml-1 font-bold text-navy">{ev.scores.overall}</span>
                                          </div>
                                        </div>
                                        {ev.comments && (
                                          <p className="text-xs text-text-secondary mt-2 pt-2 border-t border-border">
                                            {ev.comments}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {isExpanded && s.evaluations.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <div className="bg-bg-gray border-y border-border px-6 py-4 text-center">
                                <p className="text-sm text-text-muted">该投标暂无评审记录</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {summaries.map((s, idx) => {
                const isTop = s.avgOverall > 0 && s.avgOverall === topOverall
                const isExpanded = expandedId === s.submission.id
                return (
                  <div key={s.submission.id}>
                    <button
                      onClick={() => toggleExpand(s.submission.id)}
                      className={`w-full p-4 text-left transition-colors ${isTop ? 'bg-green-50' : 'hover:bg-bg-gray'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx === 0 ? 'bg-gold text-white' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-bg-gray text-text-secondary'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-text-primary">
                            {s.submission.vendorCompanyName}
                          </span>
                          {s.submission.status === 'awarded' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gold/20 text-gold">
                              <Award className="w-3 h-3" />
                              中标
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-text-muted">技术</div>
                          <div className="font-medium text-text-primary">{s.avgTechnical}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-text-muted">商务</div>
                          <div className="font-medium text-text-primary">{s.avgCommercial}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-text-muted">资质</div>
                          <div className="font-medium text-text-primary">{s.avgQualification}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-text-muted">综合</div>
                          <div className={`font-bold ${isTop ? 'text-green-700' : 'text-navy'}`}>{s.avgOverall}</div>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {s.evalCount} 条评审
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border bg-bg-gray px-4 py-3 space-y-3">
                        {s.evaluations.length === 0 ? (
                          <p className="text-sm text-text-muted text-center py-2">暂无评审记录</p>
                        ) : (
                          s.evaluations.map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-white rounded-lg border border-border p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text-primary">
                                  {ev.reviewerName}
                                </span>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                  ev.recommendation === 'recommended'
                                    ? 'bg-green-100 text-green-700'
                                    : ev.recommendation === 'not_recommended'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {RECOMMENDATION_LABELS[ev.recommendation] ?? ev.recommendation}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-text-muted">技术</span>
                                  <span className="ml-1 font-medium">{ev.scores.technical}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">商务</span>
                                  <span className="ml-1 font-medium">{ev.scores.commercial}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">资质</span>
                                  <span className="ml-1 font-medium">{ev.scores.qualification}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">综合</span>
                                  <span className="ml-1 font-bold">{ev.scores.overall}</span>
                                </div>
                              </div>
                              {ev.comments && (
                                <p className="text-xs text-text-secondary mt-2 pt-2 border-t border-border">
                                  {ev.comments}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Award Section */}
      {canAward && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" />
            定标操作
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            选择中标供应商并完成定标。定标后将自动更新中标结果通知各投标方。
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                选择中标供应商
              </label>
              <select
                value={selectedVendorSubId}
                onChange={(e) => setSelectedVendorSubId(e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white"
              >
                <option value="">请选择...</option>
                {summaries.map((s) => (
                  <option key={s.submission.id} value={s.submission.id}>
                    {s.submission.vendorCompanyName} (综合分: {s.avgOverall})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAward}
              disabled={!selectedVendorSubId || awarding}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gold hover:bg-gold/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {awarding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              {awarding ? '定标中...' : '确认定标'}
            </button>
          </div>
        </div>
      )}

      {/* Show awarded result */}
      {bid.status === 'awarded' && bid.awardedVendorId && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-green-800">已定标</h2>
          </div>
          <p className="text-sm text-green-700">
            中标供应商: {submissions.find((s) => s.vendorId === bid.awardedVendorId)?.vendorCompanyName ?? bid.awardedVendorId}
          </p>
        </div>
      )}
    </div>
  )
}

