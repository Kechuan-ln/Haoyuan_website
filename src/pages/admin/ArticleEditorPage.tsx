import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, FileText, Loader2 } from 'lucide-react'
import { serverTimestamp } from 'firebase/firestore'
import { ROUTES } from '@/config/routes'
import { getArticle, createArticle, updateArticle } from '@/services/articles.service'
import { useAuth } from '@/contexts/AuthContext'
import type { Article, ArticleCategory } from '@/types/article'

interface ArticleFormData {
  title: string
  category: ArticleCategory
  coverImageUrl: string
  excerpt: string
  content: string
  isPublished: boolean
}

const EMPTY_FORM: ArticleFormData = {
  title: '',
  category: 'news',
  coverImageUrl: '',
  excerpt: '',
  content: '',
  isPublished: false,
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
  const { appUser } = useAuth()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Load article data from Firestore in edit mode
  useEffect(() => {
    if (!id) return
    async function load() {
      setLoadingData(true)
      try {
        const article = await getArticle(id!)
        if (article) {
          setForm({
            title: article.title,
            category: article.category,
            coverImageUrl: article.coverImageUrl,
            excerpt: article.excerpt,
            content: article.content,
            isPublished: article.isPublished,
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
    value: string | boolean,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
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
        publishedAt: form.isPublished ? serverTimestamp() : undefined,
      }
      if (isEditMode && id) {
        await updateArticle(id, articleData as any)
      } else {
        await createArticle(articleData as Omit<Article, 'id' | 'createdAt' | 'updatedAt'>)
      }
      alert('保存成功！')
      navigate(ROUTES.ADMIN_ARTICLES)
    } catch (err) {
      alert('保存失败: ' + (err instanceof Error ? err.message : '未知错误'))
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
      </div>

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
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
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
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
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
          <label htmlFor="coverImageUrl" className="block text-sm font-medium text-text-primary">
            封面图片
          </label>
          <input
            id="coverImageUrl"
            type="text"
            placeholder="请输入图片 URL 地址"
            value={form.coverImageUrl}
            onChange={(e) => handleChange('coverImageUrl', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
          />
          {form.coverImageUrl && (
            <div className="mt-2 rounded-lg border border-border overflow-hidden bg-bg-gray">
              <img
                src={form.coverImageUrl}
                alt="封面预览"
                className="max-h-48 object-cover mx-auto"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
          <p className="text-xs text-text-muted">
            支持输入图片 URL 地址，后续将支持文件上传功能
          </p>
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
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-vertical"
          />
        </div>

        {/* 文章内容 */}
        <div className="space-y-1.5">
          <label htmlFor="content" className="block text-sm font-medium text-text-primary">
            文章内容
          </label>
          <textarea
            id="content"
            rows={12}
            placeholder="请输入文章正文内容..."
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-vertical leading-relaxed"
          />
          <p className="text-xs text-text-muted">
            当前为纯文本编辑，后续将升级为 Tiptap 富文本编辑器
          </p>
        </div>

        {/* 发布状态 */}
        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-navy transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5" />
          </label>
          <span className="text-sm text-text-primary">
            {form.isPublished ? '立即发布' : '存为草稿'}
          </span>
        </div>
      </div>
      )}

      {/* Action Buttons */}
      {!loadingData && (
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? '保存中...' : '保存'}
        </button>
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
