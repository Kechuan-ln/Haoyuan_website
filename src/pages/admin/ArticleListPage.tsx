import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, FileText, Loader2, RefreshCw, Send, Check, X as XIcon, Ban } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { getArticles, deleteArticle } from '@/services/articles.service'
import { submitForReview, approveContent, rejectContent, publishDirectly, unpublishContent } from '@/services/workflow.service'
import { notifyManagers, createNotification } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import ContentStatusBadge from '@/components/shared/ContentStatusBadge'
import type { Article, ArticleCategory } from '@/types/article'
import type { ContentStatus } from '@/types/content-status'
import type { Timestamp } from 'firebase/firestore'

const CATEGORY_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'news', label: '新闻动态' },
  { value: 'announcement', label: '通知公告' },
  { value: 'industry', label: '行业资讯' },
  { value: 'company', label: '企业动态' },
]

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending_review', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'rejected', label: '已退回' },
]

const CATEGORY_BADGE_MAP: Record<ArticleCategory, { label: string; className: string }> = {
  news: { label: '新闻动态', className: 'bg-teal/10 text-teal' },
  announcement: { label: '通知公告', className: 'bg-gold/10 text-gold-dark' },
  industry: { label: '行业资讯', className: 'bg-navy/10 text-navy' },
  company: { label: '企业动态', className: 'bg-green-50 text-green-700' },
}

function formatDisplayDate(ts: Timestamp | null): string {
  if (!ts) return '未发布'
  const d = ts.toDate()
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
}

function getContentStatus(article: Article): ContentStatus {
  return article.status ?? (article.isPublished ? 'published' : 'draft')
}

export default function ArticleListPage() {
  const { user, appUser, isManager, isWorker } = useAuth()

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getArticles()
      setArticles(result.articles)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文章失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (activeCategory !== 'all' && article.category !== activeCategory) {
        return false
      }
      const status = getContentStatus(article)
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false
      }
      if (searchQuery && !article.title.includes(searchQuery)) {
        return false
      }
      return true
    })
  }, [articles, activeCategory, statusFilter, searchQuery])

  async function handleDelete(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    if (!window.confirm(`确定要删除文章「${article.title}」吗？此操作不可撤销。`)) return
    try {
      await deleteArticle(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      alert('删除失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleSubmitForReview(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    try {
      await submitForReview('articles', id, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'article',
        contentId: id,
        contentTitle: article.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了文章「${article.title}」等待审核`,
      })
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'pending_review' as ContentStatus, isPublished: false } : a),
      )
      alert('已提交审核')
    } catch (err) {
      alert('提交失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleApprove(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    try {
      await approveContent('articles', id, user?.uid ?? '')
      if (article.submittedBy) {
        await createNotification({
          type: 'approved',
          contentType: 'article',
          contentId: id,
          contentTitle: article.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: article.submittedBy,
          message: `您的文章「${article.title}」已通过审核并发布`,
        })
      }
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'published' as ContentStatus, isPublished: true } : a),
      )
      alert('已通过审核并发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleReject(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    const reason = window.prompt('请输入退回原因：')
    if (reason === null) return
    if (!reason.trim()) {
      alert('请输入退回原因')
      return
    }
    try {
      await rejectContent('articles', id, user?.uid ?? '', reason)
      if (article.submittedBy) {
        await createNotification({
          type: 'rejected',
          contentType: 'article',
          contentId: id,
          contentTitle: article.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: article.submittedBy,
          message: `您的文章「${article.title}」已被退回，原因：${reason}`,
        })
      }
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'rejected' as ContentStatus, isPublished: false, rejectionReason: reason } : a),
      )
      alert('已退回')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handlePublishDirectly(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    if (!window.confirm(`确认发布文章「${article.title}」？`)) return
    try {
      await publishDirectly('articles', id, user?.uid ?? '')
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'published' as ContentStatus, isPublished: true } : a),
      )
      alert('已发布')
    } catch (err) {
      alert('发布失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleUnpublish(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    if (!window.confirm(`确认取消发布文章「${article.title}」？`)) return
    try {
      await unpublishContent('articles', id)
      setArticles((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'draft' as ContentStatus, isPublished: false } : a),
      )
      alert('已取消发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">文章管理</h1>
          <p className="text-sm text-text-secondary mt-1">管理新闻动态、通知公告等文章内容</p>
        </div>
        <Link
          to={ROUTES.ADMIN_ARTICLES_NEW}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          发布新文章
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6 space-y-4">
        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto -mb-px">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeCategory === tab.value
                  ? 'bg-navy text-white'
                  : 'text-text-secondary hover:bg-bg-gray hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  statusFilter === filter.value
                    ? 'border-navy bg-navy/5 text-navy'
                    : 'border-border text-text-secondary hover:border-navy/30 hover:text-text-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border pl-9 pr-4 py-2 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
            />
          </div>
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
            onClick={loadArticles}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      )}

      {/* Article Table */}
      {!loading && !error && (
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">暂无符合条件的文章</p>
            <p className="text-sm text-text-muted mt-1">
              尝试调整筛选条件或发布新文章
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-gray/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    标题
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    分类
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    状态
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    发布时间
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.map((article) => {
                  const badge = CATEGORY_BADGE_MAP[article.category]
                  const status = getContentStatus(article)
                  return (
                    <tr key={article.id} className="hover:bg-bg-gray/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            {article.excerpt}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ContentStatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">
                          {formatDisplayDate(article.publishedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Edit button - always visible */}
                          <Link
                            to={`/admin/articles/${article.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            编辑
                          </Link>

                          {/* Worker actions */}
                          {isWorker && (status === 'draft' || status === 'rejected') && (
                            <>
                              <button
                                onClick={() => handleSubmitForReview(article.id)}
                                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gold-dark hover:bg-gold/10 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                提交审核
                              </button>
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                删除
                              </button>
                            </>
                          )}

                          {/* Manager actions */}
                          {isManager && (
                            <>
                              {status === 'pending_review' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(article.id)}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    通过
                                  </button>
                                  <button
                                    onClick={() => handleReject(article.id)}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <XIcon className="w-3.5 h-3.5" />
                                    退回
                                  </button>
                                </>
                              )}
                              {status === 'draft' && (
                                <button
                                  onClick={() => handlePublishDirectly(article.id)}
                                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  发布
                                </button>
                              )}
                              {status === 'published' && (
                                <button
                                  onClick={() => handleUnpublish(article.id)}
                                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  取消发布
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredArticles.length > 0 && (
          <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-bg-gray/30">
            <p className="text-sm text-text-muted">
              显示 1-{filteredArticles.length} 共 {filteredArticles.length} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-text-muted cursor-not-allowed"
              >
                上一页
              </button>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-navy text-white text-xs font-medium">
                1
              </span>
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-text-muted cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
