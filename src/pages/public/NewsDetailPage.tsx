import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  ImageIcon,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { Article, ArticleCategory } from '@/types/article'
import { getArticle, getArticles } from '@/services/articles.service'
import { formatDate } from '@/utils/format'
import { ROUTES } from '@/config/routes'
import DOMPurify from 'dompurify'

const CATEGORY_BADGE_MAP: Record<ArticleCategory, { label: string; className: string }> = {
  news: { label: '新闻动态', className: 'bg-teal/10 text-teal' },
  announcement: { label: '通知公告', className: 'bg-gold/10 text-gold-dark' },
  industry: { label: '行业资讯', className: 'bg-navy/10 text-navy' },
  company: { label: '企业动态', className: 'bg-green-50 text-green-700' },
}

export default function NewsDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await getArticle(id)
        setArticle(data)

        // Load related articles of same category
        if (data) {
          const result = await getArticles({
            isPublished: true,
            category: data.category,
            pageSize: 4,
          })
          setRelatedArticles(result.articles.filter(a => a.id !== id).slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to load article:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">文章未找到</h1>
          <p className="text-text-secondary mb-6">您访问的文章不存在或已被删除</p>
          <Link
            to={ROUTES.NEWS}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回新闻列表
          </Link>
        </div>
      </div>
    )
  }

  const badge = CATEGORY_BADGE_MAP[article.category]

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
            <Link to={ROUTES.NEWS} className="hover:text-navy transition-colors">
              新闻动态
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
            {/* Cover Image */}
            {article.coverImageUrl ? (
              <div className="h-64 sm:h-80 overflow-hidden">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 sm:h-80 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-navy/15" />
              </div>
            )}

            <div className="p-6 sm:p-10">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-5 leading-tight">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <User className="w-4 h-4" />
                  {article.authorName || '全程创优'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt ?? article.createdAt)}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Article Body */}
              <div
                className="prose max-w-none text-text-secondary leading-loose text-[15px]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
              />

              {/* Share Section */}
              <div className="mt-10 pt-6 border-t border-border flex items-center gap-3">
                <Share2 className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-muted">分享到：</span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    微
                  </span>
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    博
                  </span>
                  <span className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center text-xs text-text-muted cursor-pointer hover:bg-navy/10 transition-colors">
                    QQ
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-navy mb-6">相关文章</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedArticles.map((related) => {
                  const relatedBadge = CATEGORY_BADGE_MAP[related.category]
                  return (
                    <Link
                      key={related.id}
                      to={`/news/${related.id}`}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
                    >
                      {related.coverImageUrl ? (
                        <div className="h-36 overflow-hidden">
                          <img
                            src={related.coverImageUrl}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-navy/15" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${relatedBadge.className}`}
                          >
                            {relatedBadge.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(related.publishedAt ?? related.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-bold text-text-primary text-sm group-hover:text-navy transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back to List */}
          <div className="mt-8 text-center">
            <Link
              to={ROUTES.NEWS}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回新闻列表
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
