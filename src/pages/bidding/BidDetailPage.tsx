import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  ArrowLeft,
  FileText,
  Download,
  ChevronRight,
  Hash,
  DollarSign,
  Clock,
  FolderOpen,
  Gavel,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { Bid } from '@/types/bid'
import { ROUTES } from '@/config/routes'
import { getBid } from '@/services/bids.service'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  published: { label: '已发布', className: 'bg-blue-50 text-blue-700' },
  bidding: { label: '投标中', className: 'bg-green-50 text-green-700' },
  closed: { label: '已截止', className: 'bg-yellow-50 text-yellow-700' },
  awarded: { label: '已定标', className: 'bg-navy/10 text-navy' },
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  '医疗': 'bg-teal/10 text-teal',
  '教育': 'bg-blue-50 text-blue-700',
  '产业园': 'bg-purple-50 text-purple-700',
  '市政': 'bg-orange-50 text-orange-700',
}

export default function BidDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, appUser } = useAuth()

  const [bid, setBid] = useState<Bid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBid = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getBid(id)
      setBid(data)
    } catch (err) {
      console.error('加载招标详情失败:', err)
      setError('加载招标详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBid()
  }, [loadBid])

  const handleBidAction = () => {
    if (!id) return

    if (!user) {
      navigate(ROUTES.LOGIN)
      return
    }

    if (appUser?.role === 'vendor' && appUser.vendorProfile?.status === 'approved') {
      navigate(`/vendor/bid/${id}/submit`)
      return
    }

    navigate(ROUTES.VENDOR_REGISTER)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-navy mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">加载招标详情中...</p>
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
            onClick={loadBid}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // Not found state
  if (!bid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">招标项目未找到</h1>
          <p className="text-text-secondary mb-6">您访问的招标项目不存在或已被删除</p>
          <Link
            to={ROUTES.BIDDING}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回招标大厅
          </Link>
        </div>
      </div>
    )
  }

  const statusBadge = STATUS_BADGE_MAP[bid.status] ?? {
    label: bid.status,
    className: 'bg-gray-100 text-gray-600',
  }
  const categoryColor = CATEGORY_COLOR_MAP[bid.category] ?? 'bg-gray-100 text-gray-600'
  const isBidding = bid.status === 'bidding'

  const requirementLines = bid.requirements
    ? bid.requirements.split('\n').filter((line) => line.trim())
    : []

  const infoItems = [
    { icon: FolderOpen, label: '项目类别', value: bid.category },
    { icon: DollarSign, label: '预算金额', value: formatCurrency(bid.budget) },
    { icon: Calendar, label: '报名截止时间', value: formatDate(bid.biddingDeadline) },
    { icon: Clock, label: '开标时间', value: formatDate(bid.openingAt) },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <Link to={ROUTES.HOME} className="hover:text-navy transition-colors">
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={ROUTES.BIDDING} className="hover:text-navy transition-colors">
              招标大厅
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary line-clamp-1">{bid.title}</span>
          </nav>
        </div>
      </section>

      {/* Bid Detail */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${categoryColor}`}
              >
                {bid.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              {bid.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Hash className="w-4 h-4 text-text-muted" />
              编号：{bid.bidNumber}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl shadow-md border border-border p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                  <p className="font-semibold text-text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              项目概述
            </h2>
            <p className="text-text-secondary leading-loose text-[15px]">
              {bid.description}
            </p>
          </div>

          {/* Requirements */}
          {requirementLines.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                招标要求
              </h2>
              <ul className="space-y-3">
                {requirementLines.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-navy/10 rounded-full flex items-center justify-center text-xs font-medium text-navy shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-text-secondary text-[15px] leading-relaxed">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-md border border-border p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              招标文件
            </h2>
            {bid.documents && bid.documents.length > 0 ? (
              <div className="space-y-3">
                {bid.documents.map((docItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-bg-gray rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">{docItem.name}</p>
                        <p className="text-xs text-text-muted">招标文件</p>
                      </div>
                    </div>
                    <a
                      href={docItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                        isBidding
                          ? 'text-teal hover:bg-teal/10 cursor-pointer'
                          : 'text-text-muted pointer-events-none'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无招标文件</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center space-y-4">
            {isBidding ? (
              <button
                onClick={handleBidAction}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-10 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 cursor-pointer"
              >
                我要投标
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-10 py-3.5 text-sm font-semibold text-text-muted cursor-not-allowed"
              >
                投标已截止
              </button>
            )}
          </div>

          {/* Back to List */}
          <div className="mt-8 text-center">
            <Link
              to={ROUTES.BIDDING}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回招标大厅
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
