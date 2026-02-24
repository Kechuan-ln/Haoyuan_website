import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from '@/services/notifications.service'
import { cn } from '@/utils/cn'
import type { Notification, NotificationType } from '@/types/notification'
import type { ContentType } from '@/types/content-status'
import type { Timestamp } from 'firebase/firestore'

const NOTIFICATION_TYPE_MAP: Record<NotificationType, { label: string; className: string }> = {
  review_request: { label: '审核请求', className: 'text-yellow-600' },
  approved: { label: '已通过', className: 'text-green-600' },
  rejected: { label: '已退回', className: 'text-red-600' },
}

function getContentPath(contentType: ContentType, contentId: string): string {
  switch (contentType) {
    case 'article':
      return `/admin/articles/${contentId}/edit`
    case 'project':
      return '/admin/projects'
    case 'service':
      return '/admin/services'
    case 'qualification':
      return '/admin/qualifications'
  }
}

function formatRelativeTime(ts: Timestamp | null): string {
  if (!ts) return ''
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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch unread count on mount and periodically
  const refreshUnreadCount = useCallback(async () => {
    if (!user?.uid) return
    try {
      const count = await getUnreadCount(user.uid)
      setUnreadCount(count)
    } catch {
      // silently fail for count polling
    }
  }, [user?.uid])

  useEffect(() => {
    refreshUnreadCount()
    const interval = setInterval(refreshUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [refreshUnreadCount])

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!open || !user?.uid) return
    let cancelled = false

    async function load() {
      setLoadingNotifications(true)
      try {
        const result = await getMyNotifications(user!.uid, 10)
        if (!cancelled) {
          setNotifications(result)
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) {
          setLoadingNotifications(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [open, user])

  // Click outside to close
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    navigate(getContentPath(notification.contentType, notification.contentId))
  }

  async function handleMarkAllRead() {
    if (!user?.uid) return
    try {
      await markAllNotificationsRead(user.uid)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silently fail
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-md hover:bg-bg-gray transition-colors"
        aria-label="通知"
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-gray/30">
            <span className="text-sm font-medium text-text-primary">通知</span>
            {unreadCount > 0 && (
              <span className="text-xs text-text-muted">
                {unreadCount} 条未读
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">暂无通知</p>
              </div>
            ) : (
              notifications.map((n) => {
                const typeConfig = NOTIFICATION_TYPE_MAP[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-bg-gray/50 transition-colors',
                      !n.isRead && 'bg-navy/3'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        {!n.isRead ? (
                          <span className="block w-2 h-2 rounded-full bg-navy" />
                        ) : (
                          <span className="block w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn('text-xs font-medium', typeConfig.className)}>
                            {typeConfig.label}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className={cn(
                          'text-sm truncate',
                          !n.isRead ? 'font-medium text-text-primary' : 'text-text-secondary'
                        )}>
                          {n.contentTitle}
                        </p>
                        {n.message && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-border px-4 py-2.5 bg-bg-gray/30">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-medium text-navy hover:text-navy/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                全部标为已读
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
