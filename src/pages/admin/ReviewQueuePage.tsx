import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Loader2, RefreshCw, Inbox, Check, X as XIcon, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPendingReviewItems, approveContent, rejectContent } from '@/services/workflow.service'
import { createNotification } from '@/services/notifications.service'
import { CONTENT_TYPES } from '@/config/constants'
import { cn } from '@/utils/cn'
import type { ContentType } from '@/types/content-status'
import type { Timestamp } from 'firebase/firestore'

interface PendingItem {
  id: string
  title?: string
  name?: string
  submittedBy?: string
  submittedByName?: string
  submittedAt?: Timestamp
}

interface ReviewItem {
  id: string
  title: string
  contentType: ContentType
  contentTypeLabel: string
  collection: string
  submittedBy: string
  submittedByName: string
  submittedAt: Timestamp | null
}

const TYPE_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'article', label: '文章' },
  { value: 'project', label: '业绩' },
  { value: 'service', label: '服务' },
  { value: 'qualification', label: '资质' },
]

const TYPE_BADGE_MAP: Record<ContentType, { label: string; className: string }> = {
  article: { label: '文章', className: 'bg-teal/10 text-teal' },
  project: { label: '业绩', className: 'bg-navy/10 text-navy' },
  service: { label: '服务', className: 'bg-gold/10 text-gold-dark' },
  qualification: { label: '资质', className: 'bg-green-50 text-green-700' },
}

function getEditPath(contentType: ContentType, id: string): string {
  switch (contentType) {
    case 'article':
      return `/admin/articles/${id}/edit`
    case 'project':
      return '/admin/projects'
    case 'service':
      return '/admin/services'
    case 'qualification':
      return '/admin/qualifications'
  }
}

function formatSubmittedTime(ts: Timestamp | null): string {
  if (!ts) return '未知'
  const d = ts.toDate()
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin} 分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} 小时前`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} 天前`
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
}

export default function ReviewQueuePage() {
  const { user, appUser } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const allItems: ReviewItem[] = []

      for (const ct of CONTENT_TYPES) {
        const pending = await getPendingReviewItems<PendingItem>(ct.collection)
        for (const item of pending) {
          allItems.push({
            id: item.id,
            title: item.title ?? item.name ?? '(无标题)',
            contentType: ct.value,
            contentTypeLabel: ct.label,
            collection: ct.collection,
            submittedBy: item.submittedBy ?? '',
            submittedByName: item.submittedByName ?? '未知用户',
            submittedAt: item.submittedAt ?? null,
          })
        }
      }

      // Sort by submittedAt desc
      allItems.sort((a, b) => {
        if (!a.submittedAt && !b.submittedAt) return 0
        if (!a.submittedAt) return 1
        if (!b.submittedAt) return -1
        return b.submittedAt.toMillis() - a.submittedAt.toMillis()
      })

      setItems(allItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载待审核内容失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const filteredItems = activeType === 'all'
    ? items
    : items.filter((item) => item.contentType === activeType)

  async function handleApprove(item: ReviewItem) {
    if (processingId) return
    setProcessingId(item.id)
    try {
      await approveContent(item.collection, item.id, user?.uid ?? '')
      if (item.submittedBy) {
        await createNotification({
          type: 'approved',
          contentType: item.contentType,
          contentId: item.id,
          contentTitle: item.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: item.submittedBy,
          message: `您的${item.contentTypeLabel}「${item.title}」已通过审核并发布`,
        })
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(item: ReviewItem) {
    if (processingId) return
    const reason = window.prompt('请输入退回原因：')
    if (reason === null) return
    if (!reason.trim()) {
      alert('请输入退回原因')
      return
    }
    setProcessingId(item.id)
    try {
      await rejectContent(item.collection, item.id, user?.uid ?? '', reason)
      if (item.submittedBy) {
        await createNotification({
          type: 'rejected',
          contentType: item.contentType,
          contentId: item.id,
          contentTitle: item.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: item.submittedBy,
          message: `您的${item.contentTypeLabel}「${item.title}」已被退回，原因：${reason}`,
        })
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setProcessingId(null)
    }
  }

  function handleView(item: ReviewItem) {
    navigate(getEditPath(item.contentType, item.id))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-7 h-7 text-navy" />
          <h1 className="text-2xl font-bold text-text-primary">内容审核</h1>
          {!loading && (
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              {items.length}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-1">审核员工提交的内容，通过后自动发布</p>
      </div>

      {/* Type Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex gap-1 overflow-x-auto">
          {TYPE_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? items.length
              : items.filter((i) => i.contentType === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveType(tab.value)}
                className={cn(
                  'whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeType === tab.value
                    ? 'bg-navy text-white'
                    : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary'
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    'ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs',
                    activeType === tab.value
                      ? 'bg-white/20 text-white'
                      : 'bg-bg-gray text-text-muted'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-navy animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadItems}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      )}

      {/* Review Items */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">暂无待审核内容</p>
              <p className="text-sm text-text-muted mt-1">
                所有提交的内容都已处理完毕
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-gray/50">
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      类型
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      标题
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      提交人
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      提交时间
                    </th>
                    <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const badge = TYPE_BADGE_MAP[item.contentType]
                    const isProcessing = processingId === item.id
                    return (
                      <tr key={`${item.collection}-${item.id}`} className="hover:bg-bg-gray/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex text-xs font-medium px-2.5 py-1 rounded-full', badge.className)}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-text-primary truncate max-w-xs">
                            {item.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary">
                            {item.submittedByName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary">
                            {formatSubmittedTime(item.submittedAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(item)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors disabled:opacity-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              查看
                            </button>
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              通过并发布
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                              退回
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

          {/* Footer count */}
          {filteredItems.length > 0 && (
            <div className="border-t border-border px-6 py-3 bg-bg-gray/30">
              <p className="text-sm text-text-muted">
                共 {filteredItems.length} 条待审核
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
