import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Mail,
  Phone,
  Building2,
  Clock,
  Eye,
  Trash2,
  MessageSquare,
  Check,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import { getContacts, markAsRead as markAsReadService, deleteContact } from '@/services/contacts.service'
import type { ContactMessage } from '@/types/contact'

/* ---------- Filter Tabs ---------- */

type FilterTab = 'all' | 'unread' | 'read'

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '已读', value: 'read' },
]

/* ---------- Helpers ---------- */

function formatDate(ts: unknown): string {
  if (!ts) return ''
  const d = ts && typeof ts === 'object' && 'toDate' in ts
    ? (ts as { toDate: () => Date }).toDate()
    : new Date(ts as string | number)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/* ---------- Component ---------- */

export default function ContactManagePage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ---- Fetch data ---- */

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getContacts()
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
      setError('加载留言数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  /* ---- Derived ---- */

  const unreadCount = messages.filter((m) => !m.isRead).length

  const filtered = messages.filter((m) => {
    if (filter === 'unread' && m.isRead) return false
    if (filter === 'read' && !m.isRead) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      )
    }
    return true
  })

  /* ---- Handlers ---- */

  async function markAsRead(id: string) {
    try {
      await markAsReadService(id)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
    } catch (err) {
      console.error('Failed to mark as read:', err)
      setError('标记已读失败，请稍后重试')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteContact(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      setDeleteConfirmId(null)
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      console.error('Failed to delete contact:', err)
      setError('删除留言失败，请稍后重试')
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
    // Auto mark as read when expanding
    const msg = messages.find((m) => m.id === id)
    if (msg && !msg.isRead) {
      markAsRead(id)
    }
  }

  /* ---- Render ---- */

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载留言数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">留言管理</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium rounded-full px-2 py-0.5">
              {unreadCount} 条未读
            </span>
          )}
        </div>
        <p className="text-text-secondary text-sm hidden sm:block">
          共 {messages.length} 条留言
        </p>
      </div>

      {/* Filter + Search Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.value
            const tabUnread = tab.value === 'unread' ? unreadCount : null
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy text-white'
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tabUnread !== null && tabUnread > 0 && !isActive && (
                  <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-px">
                    {tabUnread}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索姓名、主题、公司或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-3">
        {filtered.map((msg) => {
          const isExpanded = expandedId === msg.id
          return (
            <div
              key={msg.id}
              className={`bg-white rounded-xl shadow-md border transition-all ${
                !msg.isRead ? 'border-navy/30' : 'border-border'
              }`}
            >
              {/* Card Header (clickable) */}
              <button
                onClick={() => toggleExpand(msg.id)}
                className="w-full text-left p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  {/* Unread Indicator */}
                  <div className="shrink-0 pt-1">
                    {!msg.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-navy" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name + Company + Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5">
                      <span className="text-sm font-semibold text-text-primary">{msg.name}</span>
                      {msg.company && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Building2 className="w-3 h-3" />
                          {msg.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-text-muted sm:ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>

                    {/* Subject */}
                    <h3
                      className={`text-sm mb-1 ${
                        !msg.isRead ? 'font-bold text-navy' : 'font-medium text-text-primary'
                      }`}
                    >
                      {msg.subject}
                    </h3>

                    {/* Preview (only when not expanded) */}
                    {!isExpanded && (
                      <p className="text-sm text-text-muted truncate">{msg.message}</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-border">
                  <div className="pt-4 space-y-4">
                    {/* Full message */}
                    <div>
                      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {msg.phone && (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Phone className="w-4 h-4 text-text-muted" />
                          {msg.phone}
                        </div>
                      )}
                      {msg.email && (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Mail className="w-4 h-4 text-text-muted" />
                          {msg.email}
                        </div>
                      )}
                      {msg.company && (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Building2 className="w-4 h-4 text-text-muted" />
                          {msg.company}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      {!msg.isRead && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy bg-navy/10 hover:bg-navy/20 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          标记已读
                        </button>
                      )}
                      {msg.isRead && (
                        <span className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted">
                          <Eye className="w-4 h-4" />
                          已读
                        </span>
                      )}
                      {deleteConfirmId === msg.id ? (
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs text-text-muted">确认删除？</span>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-bg-gray hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-border py-16 text-center">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">没有找到匹配的留言</p>
            <p className="text-sm text-text-muted mt-1">
              {filter === 'unread'
                ? '所有留言都已阅读'
                : '尝试调整筛选条件或搜索关键词'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
