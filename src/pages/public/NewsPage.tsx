import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ArrowRight,
  Newspaper,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import type { DocumentSnapshot } from 'firebase/firestore'
import type { Article, ArticleCategory } from '@/types/article'
import { getArticles } from '@/services/articles.service'
import { formatDate } from '@/utils/format'

const CATEGORY_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'news', label: '新闻动态' },
  { value: 'announcement', label: '通知公告' },
  { value: 'industry', label: '行业资讯' },
  { value: 'company', label: '企业动态' },
]

const CATEGORY_BADGE_MAP: Record<ArticleCategory, { label: string; className: string }> = {
  news: { label: '新闻动态', className: 'bg-teal/10 text-teal' },
  announcement: { label: '通知公告', className: 'bg-gold/10 text-gold-dark' },
  industry: { label: '行业资讯', className: 'bg-navy/10 text-navy' },
  company: { label: '企业动态', className: 'bg-green-50 text-green-700' },
}

const PAGE_SIZE = 9

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setArticles([])
      setLastDoc(null)
      setHasMore(true)
      try {
        const result = await getArticles({
          isPublished: true,
          category: activeTab === 'all' ? undefined : (activeTab as ArticleCategory),
          pageSize: PAGE_SIZE,
        })
        setArticles(result.articles)
        setLastDoc(result.lastDoc)
        setHasMore(result.articles.length >= PAGE_SIZE)
      } catch (error) {
        console.error('Failed to load articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [activeTab])

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return
    setLoadingMore(true)
    try {
      const result = await getArticles({
        isPublished: true,
        category: activeTab === 'all' ? undefined : (activeTab as ArticleCategory),
        pageSize: PAGE_SIZE,
        lastDoc,
      })
      setArticles(prev => [...prev, ...result.articles])
      setLastDoc(result.lastDoc)
      setHasMore(result.articles.length >= PAGE_SIZE)
    } catch (error) {
      console.error('Failed to load more:', error)
    } finally {
      setLoadingMore(false)
    }
  }

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">新闻动态</h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            了解全程创优的最新动态和行业资讯
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? 'border-gold text-navy'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article List */}
      <section className="py-12 sm:py-16 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-navy" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">暂无文章</p>
            </div>
          ) : (
            <div className="space-y-5">
              {articles.map((article) => {
                const badge = CATEGORY_BADGE_MAP[article.category]
                return (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="group flex bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
                  >
                    {/* Thumbnail */}
                    <div className="hidden sm:flex w-48 lg:w-56 shrink-0 items-center justify-center overflow-hidden">
                      {article.coverImageUrl ? (
                        <img
                          src={article.coverImageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-navy/20" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(article.publishedAt ?? article.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-navy transition-colors line-clamp-1">
                          {article.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="mt-4">
                        <span className="inline-flex items-center gap-1 text-teal text-sm font-medium group-hover:gap-2 transition-all">
                          阅读更多
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && articles.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
