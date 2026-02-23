import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Hash,
  DollarSign,
  Calendar,
  FolderOpen,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Trophy,
} from 'lucide-react'
import type { Bid, BidSubmission } from '@/types/bid'
import type { SubmissionStatus } from '@/types/bid'
import { getBid, getMySubmissions } from '@/services/bids.service'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/routes'

const SUBMISSION_STATUS_MAP: Record<SubmissionStatus, { label: string; className: string }> = {
  submitted: { label: '已提交', className: 'bg-blue-50 text-blue-700' },
  under_review: { label: '审核中', className: 'bg-yellow-50 text-yellow-700' },
  qualified: { label: '资格合格', className: 'bg-green-50 text-green-700' },
  awarded: { label: '已中标', className: 'bg-teal/10 text-teal' },
  not_awarded: { label: '未中标', className: 'bg-gray-100 text-gray-600' },
}

export default function BidResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [bid, setBid] = useState<Bid | null>(null)
  const [submission, setSubmission] = useState<BidSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noSubmission, setNoSubmission] = useState(false)

  const loadData = useCallback(async () => {
    if (!id || !user) return
    try {
      setLoading(true)
      setError(null)
      setNoSubmission(false)

      const [bidData, submissions] = await Promise.all([
        getBid(id),
        getMySubmissions(user.uid),
      ])

      setBid(bidData)

      const mySubmission = submissions.find((s) => s.bidId === id)
      if (mySubmission) {
        setSubmission(mySubmission)
      } else {
        setNoSubmission(true)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">加载投标结果中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-teal px-5 py-2.5 text-sm font-semibold text-teal transition-all hover:bg-teal hover:text-white"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // Bid not found
  if (!bid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">招标项目未找到</h2>
          <p className="text-text-secondary mb-6">您访问的招标项目不存在或已被删除</p>
          <button
            onClick={() => navigate(ROUTES.BIDDING)}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回招标大厅
          </button>
        </div>
      </div>
    )
  }

  // No submission found
  if (noSubmission) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Info className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">未找到投标记录</h2>
          <p className="text-text-secondary mb-6">您尚未对该招标项目提交投标</p>
          <button
            onClick={() => navigate(ROUTES.VENDOR_MY_BIDS)}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回我的投标
          </button>
        </div>
      </div>
    )
  }

  const statusBadge = submission
    ? SUBMISSION_STATUS_MAP[submission.status] ?? { label: submission.status, className: 'bg-gray-100 text-gray-600' }
    : null

  // Determine result display
  const renderResultCard = () => {
    if (bid.status === 'evaluating') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-1">评标进行中</h3>
              <p className="text-sm text-blue-700">
                评标委员会正在对各投标方案进行评审，请耐心等待结果公布。
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (bid.status === 'awarded' && bid.awardedVendorId === user?.uid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-1">恭喜中标！</h3>
              <p className="text-sm text-green-700 mb-2">
                您的投标方案已经通过评审，成功中标该项目。
              </p>
              <p className="text-sm text-green-600">
                请关注后续通知，及时完成合同签署等相关流程。
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (bid.status === 'awarded' && bid.awardedVendorId !== user?.uid) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">很遗憾，本次投标未中标</h3>
              <p className="text-sm text-gray-600">
                感谢您的参与，期待在未来的项目中继续合作。您可以浏览其他正在进行的招标项目。
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (bid.status === 'bidding' || bid.status === 'closed') {
      return (
        <div className="bg-teal/5 border border-teal/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-teal" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-teal mb-1">投标已提交</h3>
              <p className="text-sm text-text-secondary">
                您的投标文件已成功提交，等待评标流程启动。
              </p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="py-8 sm:py-12 px-4 bg-bg-gray min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(ROUTES.VENDOR_MY_BIDS)}
          className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回我的投标
        </button>

        {/* Page title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">投标结果查看</h1>

        {/* Bid summary card */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">招标项目信息</h2>
          <div className="space-y-3">
            <p className="font-semibold text-text-primary text-lg">{bid.title}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Hash className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">编号</p>
                  <p className="text-sm font-medium text-text-primary">{bid.bidNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">类别</p>
                  <p className="text-sm font-medium text-text-primary">{bid.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">预算金额</p>
                  <p className="text-sm font-medium text-text-primary">{formatCurrency(bid.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">截止日期</p>
                  <p className="text-sm font-medium text-text-primary">{formatDate(bid.biddingDeadline)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submission status card */}
        {submission && (
          <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              投标提交详情
            </h2>
            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <p className="text-sm text-text-muted">投标状态:</p>
                {statusBadge && (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                )}
              </div>

              {/* Submission date */}
              <div className="flex items-center gap-3">
                <p className="text-sm text-text-muted">提交日期:</p>
                <p className="text-sm font-medium text-text-primary">
                  {submission.submittedAt ? formatDate(submission.submittedAt) : formatDate(submission.createdAt)}
                </p>
              </div>

              {/* File list */}
              {submission.documents && submission.documents.length > 0 && (
                <div>
                  <p className="text-sm text-text-muted mb-2">投标文件:</p>
                  <div className="space-y-2">
                    {submission.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-bg-gray rounded-lg p-3 border border-border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-teal" />
                          </div>
                          <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:bg-teal/10 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          下载
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result area */}
        <div className="mb-6">
          {renderResultCard()}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(ROUTES.VENDOR_MY_BIDS)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-teal px-6 py-2.5 text-sm font-semibold text-teal transition-all hover:bg-teal hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            返回我的投标
          </button>
          <button
            onClick={() => navigate(ROUTES.BIDDING)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
          >
            浏览更多招标
          </button>
        </div>
      </div>
    </div>
  )
}
