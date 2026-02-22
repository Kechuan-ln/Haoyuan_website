import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ArrowRight,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react'
import type { ArticleCategory } from '@/types/article'

interface SampleArticle {
  id: string
  title: string
  category: ArticleCategory
  date: string
  excerpt: string
}

const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: '1',
    title: '全程创优荣获AAAA级标准化工地认证',
    category: 'company',
    date: '2025-01-15',
    excerpt:
      '近日，我公司成功通过AAAA级标准化工地评审，标志着公司在工程管理标准化方面又迈上了新的台阶。',
  },
  {
    id: '2',
    title: '深圳市建设工程招标投标新规解读',
    category: 'industry',
    date: '2025-01-10',
    excerpt:
      '深圳市住建局近日发布了建设工程招标投标管理的最新规定，对招标流程、评标标准等方面进行了重要调整。',
  },
  {
    id: '3',
    title: '福永人民医院改造项目顺利竣工验收',
    category: 'news',
    date: '2024-12-20',
    excerpt:
      '由我公司承担监理服务的福永人民医院消化内镜中心改造工程顺利通过竣工验收，获得业主高度评价。',
  },
  {
    id: '4',
    title: '公司通过ISO三体系年度监督审核',
    category: 'company',
    date: '2024-12-05',
    excerpt:
      '我公司顺利通过ISO 9001、ISO 14001、ISO 45001三大管理体系年度监督审核，持续保持认证有效性。',
  },
  {
    id: '5',
    title: '关于开展2025年度供应商入库申请的通知',
    category: 'announcement',
    date: '2024-11-28',
    excerpt:
      '为进一步规范公司供应商管理，现开展2025年度合格供应商入库申请工作，欢迎符合条件的企业报名。',
  },
  {
    id: '6',
    title: '光伏发电项目绿色施工技术应用',
    category: 'industry',
    date: '2024-11-15',
    excerpt:
      '随着双碳目标的推进，光伏发电项目在建设领域的应用日益广泛。本文探讨了光伏项目施工中的绿色技术应用。',
  },
]

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

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredArticles = useMemo(() => {
    if (activeTab === 'all') return SAMPLE_ARTICLES
    return SAMPLE_ARTICLES.filter((a) => a.category === activeTab)
  }, [activeTab])

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
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">暂无相关新闻</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredArticles.map((article) => {
                const badge = CATEGORY_BADGE_MAP[article.category]
                return (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="group flex bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
                  >
                    {/* Thumbnail */}
                    <div className="hidden sm:flex w-48 lg:w-56 shrink-0 bg-gradient-to-br from-navy/5 to-navy/10 items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-navy/20" />
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
                            {formatDisplayDate(article.date)}
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

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              显示 1-{filteredArticles.length} 共 {filteredArticles.length} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-muted cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                上一页
              </button>
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-muted cursor-not-allowed"
              >
                下一页
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
