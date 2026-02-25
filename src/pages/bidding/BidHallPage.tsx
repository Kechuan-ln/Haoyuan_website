import { useState, useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Calendar,
  ArrowRight,
  Gavel,
  DollarSign,
  Hash,
  UserPlus,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { Bid } from '@/types/bid'
import { ROUTES } from '@/config/routes'
import { getBids } from '@/services/bids.service'
import { formatDate, formatCurrency } from '@/utils/format'

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'bidding', label: '投标中' },
  { value: 'closed', label: '已截止' },
  { value: 'awarded', label: '已定标' },
]

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

export default function BidHallPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBids = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBids({ statusIn: ['published', 'bidding', 'closed', 'awarded'] })
      setBids(data)
    } catch (err) {
      console.error('加载招标数据失败:', err)
      setError('加载招标数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBids()
  }, [loadBids])

  const filteredBids = useMemo(() => {
    let result = bids
    if (activeStatus !== 'all') {
      result = result.filter((b) => b.status === activeStatus)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.bidNumber.toLowerCase().includes(q) ||
          b.category.includes(q),
      )
    }
    return result
  }, [bids, activeStatus, searchQuery])

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">招标大厅</h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            公开透明的招标信息平台
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto -mb-px sm:mb-0">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveStatus(tab.value)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeStatus === tab.value
                      ? 'bg-navy text-white'
                      : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索招标项目..."
                className="w-full sm:w-72 rounded-lg border border-border bg-bg-gray pl-10 pr-4 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy focus:bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bid List */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-navy mx-auto mb-4 animate-spin" />
              <p className="text-text-secondary">加载招标数据中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadBids}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
              >
                重新加载
              </button>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="text-center py-20">
              <Gavel className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">暂无符合条件的招标项目</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredBids.map((bid) => {
                const statusBadge = STATUS_BADGE_MAP[bid.status] ?? {
                  label: bid.status,
                  className: 'bg-gray-100 text-gray-600',
                }
                const categoryColor = CATEGORY_COLOR_MAP[bid.category] ?? 'bg-gray-100 text-gray-600'

                return (
                  <div
                    key={bid.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-border p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}
                          >
                            {bid.category}
                          </span>
                        </div>
                        <Link
                          to={`/bidding/${bid.id}`}
                          className="text-lg font-bold text-text-primary hover:text-navy transition-colors line-clamp-1"
                        >
                          {bid.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
                          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <Hash className="w-3.5 h-3.5 text-text-muted" />
                            {bid.bidNumber}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                            预算：{formatCurrency(bid.budget)}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            截止：{formatDate(bid.biddingDeadline)}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        <Link
                          to={`/bidding/${bid.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white"
                        >
                          查看详情
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-12 px-4 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-navy/5 to-teal/5 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-gold-dark" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">如需参与投标，请先注册供应商账号</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  注册成为合格供应商后，即可在线查看招标文件并提交投标
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 shrink-0"
            >
              <Tag className="w-4 h-4" />
              注册供应商
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
