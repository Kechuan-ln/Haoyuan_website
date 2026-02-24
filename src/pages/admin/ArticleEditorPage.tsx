import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, FileText, Loader2, Send, AlertTriangle, Info } from 'lucide-react'
import { serverTimestamp, type Timestamp } from 'firebase/firestore'
import { ROUTES } from '@/config/routes'
import { getArticle, createArticle, updateArticle } from '@/services/articles.service'
import { submitForReview, publishDirectly } from '@/services/workflow.service'
import { notifyManagers } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'
import ContentStatusBadge from '@/components/shared/ContentStatusBadge'
import type { Article, ArticleCategory } from '@/types/article'
import type { ContentStatus } from '@/types/content-status'

interface ArticleFormData {
  title: string
  category: ArticleCategory
  coverImageUrl: string
  excerpt: string
  content: string
}

const EMPTY_FORM: ArticleFormData = {
  title: '',
  category: 'news',
  coverImageUrl: '',
  excerpt: '',
  content: '',
}

const CATEGORY_OPTIONS: { value: ArticleCategory; label: string }[] = [
  { value: 'news', label: '新闻动态' },
  { value: 'announcement', label: '通知公告' },
  { value: 'industry', label: '行业资讯' },
  { value: 'company', label: '企业动态' },
]

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, appUser, isManager, isWorker } = useAuth()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)

  // Derive content status with backward compat
  const contentStatus: ContentStatus = article?.status ?? (article?.isPublished ? 'published' : 'draft')

  // Pending review lockout for workers
  const isLockedForWorker = isWorker && contentStatus === 'pending_review'

  // Load article data from Firestore in edit mode
  useEffect(() => {
    if (!id) return
    async function load() {
      setLoadingData(true)
      try {
        const data = await getArticle(id!)
        if (data) {
          setArticle(data)
          setForm({
            title: data.title,
            category: data.category,
            coverImageUrl: data.coverImageUrl,
            excerpt: data.excerpt,
            content: data.content,
          })
        }
      } catch {
        alert('加载文章失败')
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [id])

  function handleChange(
    field: keyof ArticleFormData,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) {
      alert('请输入文章标题')
      return
    }
    setLoading(true)
    try {
      const slug = form.title.replace(/\s+/g, '-').toLowerCase()

      // Worker editing published content: auto-set to draft, unpublish
      const isWorkerEditingPublished = isWorker && contentStatus === 'published'

      const articleData = {
        ...form,
        slug,
        authorId: appUser?.uid ?? '',
        authorName: appUser?.displayName ?? '管理员',
        isPublished: false,
        status: 'draft' as ContentStatus,
      }
      if (isEditMode && id) {
        await updateArticle(id, articleData)
        if (isWorkerEditingPublished) {
          alert('已保存为草稿，内容已下线，需重新提交审核')
        } else {
          alert('草稿已保存')
        }
      } else {
        await createArticle(articleData as Omit<Article, 'id' | 'createdAt' | 'updatedAt'>)
        alert('草稿已保存')
      }
      navigate(ROUTES.ADMIN_ARTICLES)
    } catch (err) {
      alert('保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitForReview() {
    if (!form.title.trim()) {
      alert('请输入文章标题')
      return
    }
    setLoading(true)
    try {
      const slug = form.title.replace(/\s+/g, '-').toLowerCase()
      const articleData = {
        ...form,
        slug,
        authorId: appUser?.uid ?? '',
        authorName: appUser?.displayName ?? '管理员',
        isPublished: false,
        status: 'draft' as ContentStatus,
      }

      let articleId = id
      if (isEditMode && id) {
        await updateArticle(id, articleData)
      } else {
        articleId = await createArticle(articleData as Omit<Article, 'id' | 'createdAt' | 'updatedAt'>)
      }

      // Submit for review
      await submitForReview('articles', articleId!, user?.uid ?? '')

      // Notify managers
      await notifyManagers({
        type: 'review_request',
        contentType: 'article',
        contentId: articleId!,
        contentTitle: form.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了文章「${form.title}」等待审核`,
      })

      alert('已提交审核')
      navigate(ROUTES.ADMIN_ARTICLES)
    } catch (err) {
      alert('提交失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  async function handlePublishDirectly() {
    if (!form.title.trim()) {
      alert('请输入文章标题')
      return
    }
    if (!window.confirm('确认发布此文章？发布后将在官网公开展示。')) return

    setLoading(true)
    try {
      const slug = form.title.replace(/\s+/g, '-').toLowerCase()
      const articleData = {
        ...form,
        slug,
        authorId: appUser?.uid ?? '',
        authorName: appUser?.displayName ?? '管理员',
        isPublished: true,
        status: 'published' as ContentStatus,
        publishedAt: serverTimestamp() as unknown as Timestamp,
      }
      if (isEditMode && id) {
        await updateArticle(id, articleData)
        await publishDirectly('articles', id, user?.uid ?? '')
      } else {
        const newId = await createArticle(articleData as Omit<Article, 'id' | 'createdAt' | 'updatedAt'>)
        await publishDirectly('articles', newId, user?.uid ?? '')
      }
      alert('发布成功！')
      navigate(ROUTES.ADMIN_ARTICLES)
    } catch (err) {
      alert('发布失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  function handlePreview() {
    alert('预览功能将在后续版本中实现')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN_ARTICLES}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回文章列表
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-navy" />
        <h1 className="text-2xl font-bold text-text-primary">
          {isEditMode ? '编辑文章' : '发布文章'}
        </h1>
        {isEditMode && (
          <ContentStatusBadge status={contentStatus} />
        )}
      </div>

      {/* Rejected Banner */}
      {contentStatus === 'rejected' && article?.rejectionReason && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">内容已被退回</p>
            <p className="mt-1">退回原因：{article.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Pending Review Lockout for Worker */}
      {isLockedForWorker && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>内容审核中，请等待管理员审核</p>
        </div>
      )}

      {/* Loading State */}
      {loadingData && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-navy animate-spin" />
        </div>
      )}

      {/* Form Card */}
      {!loadingData && (
      <div className="bg-white rounded-xl shadow-md border border-border p-6 space-y-6">
        {/* 文章标题 */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-medium text-text-primary">
            文章标题 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="请输入文章标题"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isLockedForWorker}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 文章分类 */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium text-text-primary">
            文章分类
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value as ArticleCategory)}
            disabled={isLockedForWorker}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 封面图片 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">
            封面图片
          </label>
          {isLockedForWorker ? (
            form.coverImageUrl ? (
              <img src={form.coverImageUrl} alt="封面" className="w-40 h-24 object-cover rounded-lg" />
            ) : (
              <p className="text-sm text-text-muted">未上传</p>
            )
          ) : (
            <ImageUploader
              value={form.coverImageUrl}
              onChange={(url) => handleChange('coverImageUrl', url as string)}
              storagePath="articles"
            />
          )}
        </div>

        {/* 文章摘要 */}
        <div className="space-y-1.5">
          <label htmlFor="excerpt" className="block text-sm font-medium text-text-primary">
            文章摘要
          </label>
          <textarea
            id="excerpt"
            rows={3}
            placeholder="请输入文章摘要，将显示在列表页"
            value={form.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            disabled={isLockedForWorker}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-vertical disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 文章内容 */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">
            文章内容
          </label>
          {isLockedForWorker ? (
            <div className="prose prose-sm max-w-none rounded-lg border border-border p-4 bg-gray-50" dangerouslySetInnerHTML={{ __html: form.content }} />
          ) : (
            <RichTextEditor
              content={form.content}
              onChange={(html) => handleChange('content', html)}
              placeholder="请输入文章正文内容..."
              imageStoragePath="articles"
            />
          )}
        </div>
      </div>
      )}

      {/* Action Buttons */}
      {!loadingData && !isLockedForWorker && (
      <div className="flex items-center gap-3">
        {/* Worker buttons */}
        {isWorker && (
          <>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={handleSubmitForReview}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? '提交中...' : '提交审核'}
            </button>
          </>
        )}

        {/* Manager buttons */}
        {isManager && (
          <>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={handlePublishDirectly}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              {loading ? '发布中...' : '发布'}
            </button>
          </>
        )}

        <button
          onClick={handlePreview}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors"
        >
          <Eye className="w-4 h-4" />
          预览
        </button>
        <Link
          to={ROUTES.ADMIN_ARTICLES}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-gray transition-colors"
        >
          取消
        </Link>
      </div>
      )}
    </div>
  )
}
