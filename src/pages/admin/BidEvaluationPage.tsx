import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, FileText, Save, Loader2, AlertCircle,
  X, CheckCircle, Clock, Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getBid, getSubmissionsForBid, updateBidStatus } from '@/services/bids.service'
import { getEvaluationsForBid, createEvaluation, updateEvaluation } from '@/services/evaluations.service'
import { BID_STATUSES } from '@/config/constants'
import { formatDate, formatCurrency } from '@/utils/format'
import type { Bid, BidStatus, BidSubmission, Evaluation, EvaluationScores } from '@/types/bid'

/* ---------- Types ---------- */

interface EvaluationFormData {
  scores: EvaluationScores
  comments: string
  recommendation: string
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

const EMPTY_FORM: EvaluationFormData = {
  scores: { technical: 0, commercial: 0, qualification: 0, overall: 0 },
  comments: '',
  recommendation: 'pending',
}

const RECOMMENDATION_OPTIONS = [
  { value: 'pending', label: '待定' },
  { value: 'recommended', label: '推荐' },
  { value: 'not_recommended', label: '不推荐' },
]

const SCORE_FIELDS: { key: keyof EvaluationScores; label: string }[] = [
  { key: 'technical', label: '技术评分' },
  { key: 'commercial', label: '商务评分' },
  { key: 'qualification', label: '资质评分' },
  { key: 'overall', label: '综合评分' },
]

/* ---------- Helpers ---------- */

function getStatusLabel(status: BidStatus): string {
  return BID_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getStatusColor(status: BidStatus): string {
  const color = BID_STATUSES.find((s) => s.value === status)?.color ?? 'gray'
  return STATUS_BADGE_COLORS[color] ?? STATUS_BADGE_COLORS.gray
}

/* ---------- Component ---------- */

export default function BidEvaluationPage() {
  const { id } = useParams<{ id: string }>()
  const { user, appUser } = useAuth()

  // Data
  const [bid, setBid] = useState<Bid | null>(null)
  const [submissions, setSubmissions] = useState<BidSubmission[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [evaluationForms, setEvaluationForms] = useState<Record<string, EvaluationFormData>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusChanging, setStatusChanging] = useState(false)
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

      // Initialize forms from existing evaluations
      const forms: Record<string, EvaluationFormData> = {}
      for (const sub of subsData) {
        const existingEval = evalsData.find(
          (e) => e.submissionId === sub.id && e.reviewerId === user?.uid,
        )
        if (existingEval) {
          forms[sub.id] = {
            scores: { ...existingEval.scores },
            comments: existingEval.comments,
            recommendation: existingEval.recommendation,
          }
        } else {
          forms[sub.id] = { ...EMPTY_FORM, scores: { ...EMPTY_FORM.scores } }
        }
      }
      setEvaluationForms(forms)
    } catch (err) {
      console.error('Failed to fetch evaluation data:', err)
      setError('加载评标数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id, user?.uid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ---- Handlers ---- */

  function toggleExpand(submissionId: string) {
    setExpandedId((prev) => (prev === submissionId ? null : submissionId))
  }

  function updateScore(submissionId: string, key: keyof EvaluationScores, value: number) {
    setEvaluationForms((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        scores: {
          ...prev[submissionId].scores,
          [key]: Math.min(100, Math.max(0, value)),
        },
      },
    }))
  }

  function updateFormField(submissionId: string, field: 'comments' | 'recommendation', value: string) {
    setEvaluationForms((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }))
  }

  async function handleSaveEvaluation(submissionId: string) {
    if (!id || !user?.uid) return
    const formData = evaluationForms[submissionId]
    if (!formData) return

    setSavingId(submissionId)
    setError(null)
    try {
      const existingEval = evaluations.find(
        (e) => e.submissionId === submissionId && e.reviewerId === user.uid,
      )

      if (existingEval) {
        await updateEvaluation(existingEval.id, {
          scores: formData.scores,
          comments: formData.comments,
          recommendation: formData.recommendation,
        })
        setEvaluations((prev) =>
          prev.map((e) =>
            e.id === existingEval.id
              ? { ...e, scores: formData.scores, comments: formData.comments, recommendation: formData.recommendation }
              : e,
          ),
        )
      } else {
        const newId = await createEvaluation({
          bidId: id,
          submissionId,
          reviewerId: user.uid,
          reviewerName: appUser?.displayName ?? user.email ?? '评审员',
          scores: formData.scores,
          comments: formData.comments,
          recommendation: formData.recommendation,
        })
        const newEval: Evaluation = {
          id: newId,
          bidId: id,
          submissionId,
          reviewerId: user.uid,
          reviewerName: appUser?.displayName ?? user.email ?? '评审员',
          scores: formData.scores,
          comments: formData.comments,
          recommendation: formData.recommendation,
          evaluatedAt: { toDate: () => new Date() } as Evaluation['evaluatedAt'],
        }
        setEvaluations((prev) => [...prev, newEval])
      }
      setSuccessMessage('评审保存成功')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to save evaluation:', err)
      setError('保存评审失败，请稍后重试')
    } finally {
      setSavingId(null)
    }
  }

  async function handleStatusChange(newStatus: BidStatus) {
    if (!id) return
    setStatusChanging(true)
    setError(null)
    try {
      await updateBidStatus(id, newStatus)
      setBid((prev) => (prev ? { ...prev, status: newStatus } : prev))
      setSuccessMessage(`状态已更新为「${getStatusLabel(newStatus)}」`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to update bid status:', err)
      setError('更新状态失败，请稍后重试')
    } finally {
      setStatusChanging(false)
    }
  }

  /* ---- Render helpers ---- */

  function getSubmissionEvaluations(submissionId: string): Evaluation[] {
    return evaluations.filter((e) => e.submissionId === submissionId)
  }

  function hasMyEvaluation(submissionId: string): boolean {
    return evaluations.some((e) => e.submissionId === submissionId && e.reviewerId === user?.uid)
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载评标数据...</span>
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

      {/* Page Header + Back Link */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/admin/bids" className="hover:text-navy transition-colors">
          招标管理
        </Link>
        <span>/</span>
        <span className="text-text-primary">在线评审</span>
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

          {/* Status Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {bid.status === 'bidding' && (
              <button
                onClick={() => handleStatusChange('closed')}
                disabled={statusChanging}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {statusChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                截止投标
              </button>
            )}
            {bid.status === 'closed' && (
              <button
                onClick={() => handleStatusChange('evaluating')}
                disabled={statusChanging}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {statusChanging && <Loader2 className="w-4 h-4 animate-spin" />}
                开始评标
              </button>
            )}
            <Link
              to={`/admin/bids/${id}/report`}
              className="px-4 py-2 text-sm font-medium text-navy border border-navy rounded-lg hover:bg-navy/5 transition-colors"
            >
              查看报告
            </Link>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy">投标文件列表</h2>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-border py-16 text-center">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">暂无投标</p>
            <p className="text-sm text-text-muted mt-1">该招标暂未收到投标文件</p>
          </div>
        ) : (
          submissions.map((sub) => {
            const isExpanded = expandedId === sub.id
            const subEvals = getSubmissionEvaluations(sub.id)
            const hasEval = hasMyEvaluation(sub.id)
            const formData = evaluationForms[sub.id]
            const isSaving = savingId === sub.id

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-md border border-border overflow-hidden"
              >
                {/* Submission Header */}
                <button
                  onClick={() => toggleExpand(sub.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-bg-gray transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {sub.vendorCompanyName}
                        </span>
                        {hasEval && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            已评审
                          </span>
                        )}
                        {subEvals.length > 0 && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {subEvals.length} 条评审
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        <span>提交日期: {sub.submittedAt ? formatDate(sub.submittedAt) : formatDate(sub.createdAt)}</span>
                        <span>{sub.documents.length} 个文件</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-6">
                    {/* Documents */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2">投标文件</h4>
                      {sub.documents.length === 0 ? (
                        <p className="text-sm text-text-muted">无附件</p>
                      ) : (
                        <div className="space-y-2">
                          {sub.documents.map((docItem, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-bg-gray rounded-lg px-3 py-2"
                            >
                              <FileText className="w-4 h-4 text-text-muted shrink-0" />
                              <a
                                href={docItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-navy hover:underline truncate"
                              >
                                {docItem.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Evaluation Form */}
                    {formData && (
                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-text-primary mb-4">评审打分</h4>

                        {/* Score inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {SCORE_FIELDS.map(({ key, label }) => (
                            <div key={key}>
                              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                                {label} (0-100)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.scores[key]}
                                onChange={(e) => updateScore(sub.id, key, Number(e.target.value))}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Comments */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-text-secondary mb-1.5">
                            评审意见
                          </label>
                          <textarea
                            value={formData.comments}
                            onChange={(e) => updateFormField(sub.id, 'comments', e.target.value)}
                            placeholder="请输入评审意见..."
                            rows={3}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
                          />
                        </div>

                        {/* Recommendation */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-text-secondary mb-1.5">
                            推荐意见
                          </label>
                          <select
                            value={formData.recommendation}
                            onChange={(e) => updateFormField(sub.id, 'recommendation', e.target.value)}
                            className="w-full sm:w-48 rounded-lg border border-border px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white"
                          >
                            {RECOMMENDATION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Save button */}
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleSaveEvaluation(sub.id)}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {isSaving ? '保存中...' : hasEval ? '更新评审' : '提交评审'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
