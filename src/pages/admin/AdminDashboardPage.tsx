import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Building2,
  MessageSquare,
  Users,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { isFirebaseConfigured } from '@/config/firebase'
import { getArticles } from '@/services/articles.service'
import { getProjects } from '@/services/projects.service'
import { getContacts } from '@/services/contacts.service'
import { listUsers } from '@/services/users.service'

/* ---------- Static Data ---------- */

const QUICK_ACTIONS = [
  {
    label: '发布文章',
    icon: Plus,
    route: ROUTES.ADMIN_ARTICLES_NEW,
    bgColor: 'bg-navy',
    hoverColor: 'hover:bg-navy-dark',
  },
  {
    label: '管理业绩',
    icon: Building2,
    route: ROUTES.ADMIN_PROJECTS,
    bgColor: 'bg-teal',
    hoverColor: 'hover:bg-teal-dark',
  },
  {
    label: '查看留言',
    icon: MessageSquare,
    route: ROUTES.ADMIN_CONTACTS,
    bgColor: 'bg-gold',
    hoverColor: 'hover:bg-gold-dark',
  },
  {
    label: '站点设置',
    icon: Settings,
    route: ROUTES.ADMIN_SETTINGS,
    bgColor: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
  },
]

interface ActivityItem {
  tag: string
  tagColor: string
  text: string
  time: string
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    tag: '文章',
    tagColor: 'bg-navy/10 text-navy',
    text: '发布了文章「全程创优荣获AAAA级标准化工地认证」',
    time: '2小时前',
  },
  {
    tag: '留言',
    tagColor: 'bg-gold/10 text-gold-dark',
    text: '收到新留言来自「张先生」',
    time: '5小时前',
  },
  {
    tag: '业绩',
    tagColor: 'bg-teal/10 text-teal',
    text: '更新了项目「福永人民医院消化内镜中心改造工程」',
    time: '1天前',
  },
  {
    tag: '用户',
    tagColor: 'bg-green-50 text-green-700',
    text: '新供应商注册「深圳XX建设有限公司」',
    time: '2天前',
  },
  {
    tag: '系统',
    tagColor: 'bg-gray-100 text-gray-600',
    text: '系统备份完成',
    time: '3天前',
  },
]

/* ---------- Helpers ---------- */

function formatDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[now.getDay()]
  return `${year}年${month}月${day}日 星期${weekday}`
}

/* ---------- Component ---------- */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    articles: 0,
    projects: 0,
    contacts: 0,
    unreadContacts: 0,
    users: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [articlesResult, projects, contacts, users] = await Promise.all([
          getArticles().catch(() => ({ articles: [] as { id: string }[] })),
          getProjects().catch(() => []),
          getContacts().catch(() => []),
          listUsers().catch(() => []),
        ])
        setStats({
          articles: articlesResult.articles.length,
          projects: projects.length,
          contacts: contacts.length,
          unreadContacts: contacts.filter((c) => !c.isRead).length,
          users: users.length,
        })
      } catch {
        // Stats will stay at 0
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statsCards = [
    {
      label: '文章总数',
      value: stats.articles,
      unit: '篇',
      icon: FileText,
      bgColor: 'bg-navy/10',
      iconColor: 'text-navy',
      route: ROUTES.ADMIN_ARTICLES,
      trend: `共 ${stats.articles} 篇文章`,
    },
    {
      label: '工程业绩',
      value: stats.projects,
      unit: '项',
      icon: Building2,
      bgColor: 'bg-teal/10',
      iconColor: 'text-teal',
      route: ROUTES.ADMIN_PROJECTS,
      trend: `共 ${stats.projects} 项业绩`,
    },
    {
      label: '用户留言',
      value: stats.contacts,
      unit: '条',
      icon: MessageSquare,
      bgColor: 'bg-gold/10',
      iconColor: 'text-gold-dark',
      route: ROUTES.ADMIN_CONTACTS,
      trend: `${stats.unreadContacts} 条未读`,
      highlight: stats.unreadContacts > 0,
    },
    {
      label: '注册用户',
      value: stats.users,
      unit: '人',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      route: ROUTES.ADMIN_USERS,
      trend: `共 ${stats.users} 位用户`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">
          欢迎回来，管理员
        </h1>
        <p className="text-text-secondary mt-1">{formatDate()}</p>
        <p className="text-sm text-text-muted mt-0.5">
          全程创优数字平台管理后台
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card) => (
          <Link
            key={card.label}
            to={card.route}
            className="group bg-white rounded-xl shadow-md border border-border p-5 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                <>
                  {card.value}
                  <span className="text-base font-normal text-text-secondary ml-1">
                    {card.unit}
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-text-secondary mt-1">{card.label}</div>
            <div
              className={`text-xs mt-2 ${card.highlight ? 'text-red-500 font-medium' : 'text-text-muted'}`}
            >
              {loading ? (
                <span className="inline-block w-20 h-3 bg-gray-100 rounded animate-pulse" />
              ) : (
                card.trend
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.route}
                className={`flex items-center gap-2.5 ${action.bgColor} ${action.hoverColor} text-white rounded-lg px-4 py-3 text-sm font-medium transition-all hover:shadow-md`}
              >
                <action.icon className="w-4 h-4 shrink-0" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg font-bold text-navy">最近动态</h2>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0"
              >
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${activity.tagColor}`}
                >
                  {activity.tag}
                </span>
                <p className="text-sm text-text-primary flex-1 leading-relaxed">
                  {activity.text}
                </p>
                <span className="shrink-0 text-xs text-text-muted whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Panel */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <h2 className="text-lg font-bold text-navy mb-4">系统状态</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Version */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-gray">
            <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-navy" />
            </div>
            <div>
              <p className="text-xs text-text-muted">系统版本</p>
              <p className="text-sm font-semibold text-text-primary">v1.0.0</p>
            </div>
          </div>

          {/* Firebase Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-gray">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isFirebaseConfigured ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {isFirebaseConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-xs text-text-muted">Firebase 状态</p>
              <p
                className={`text-sm font-semibold ${
                  isFirebaseConfigured ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {isFirebaseConfigured ? '已连接' : '未配置'}
              </p>
            </div>
          </div>

          {/* Environment */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-gray">
            <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-teal" />
            </div>
            <div>
              <p className="text-xs text-text-muted">运行环境</p>
              <p className="text-sm font-semibold text-text-primary">
                {import.meta.env.MODE === 'production' ? '生产环境' : '开发环境'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
