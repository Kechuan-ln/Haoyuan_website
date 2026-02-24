import { useState, useEffect, useCallback, useMemo } from 'react'
import { Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Gavel,
  MessageSquare,
  Settings,
  Wrench,
  Truck,
  Info,
  Home,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/routes'
import { getPendingReviewCount } from '@/services/workflow.service'
import Sidebar from '@/components/layout/Sidebar'
import NotificationBell from '@/components/shared/NotificationBell'
import type { SidebarItem } from '@/components/layout/Sidebar'
import { cn } from '@/utils/cn'

const ADMIN_NAV_ITEMS: SidebarItem[] = [
  { label: '仪表盘', path: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: '文章管理', path: ROUTES.ADMIN_ARTICLES, icon: FileText },
  { label: '业绩管理', path: ROUTES.ADMIN_PROJECTS, icon: Building2 },
  { label: '服务管理', path: ROUTES.ADMIN_SERVICES, icon: Wrench },
  { label: '团队管理', path: ROUTES.ADMIN_TEAM, icon: Users },
  { label: '关于管理', path: ROUTES.ADMIN_ABOUT, icon: Info },
  { label: '首页管理', path: ROUTES.ADMIN_HOME, icon: Home },
  { label: '资质管理', path: ROUTES.ADMIN_QUALIFICATIONS, icon: BadgeCheck },
  { label: '招标管理', path: ROUTES.ADMIN_BIDS, icon: Gavel },
  { label: '内容审核', path: ROUTES.ADMIN_REVIEW, icon: ClipboardCheck, managerOnly: true },
  { label: '供应商管理', path: ROUTES.ADMIN_VENDORS, icon: Truck, managerOnly: true },
  { label: '留言管理', path: ROUTES.ADMIN_CONTACTS, icon: MessageSquare },
  { label: '用户管理', path: ROUTES.ADMIN_USERS, icon: Users, managerOnly: true },
  { label: '站点设置', path: ROUTES.ADMIN_SETTINGS, icon: Settings, managerOnly: true },
]

export default function AdminLayout() {
  const { user, appUser, isManager } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const handleCloseDrawer = useCallback(() => setDrawerOpen(false), [])

  // Fetch pending review count for managers
  const refreshPendingCount = useCallback(async () => {
    if (!isManager) return
    try {
      const count = await getPendingReviewCount()
      setPendingCount(count)
    } catch {
      // silently fail for count polling
    }
  }, [isManager])

  useEffect(() => {
    refreshPendingCount()
    const interval = setInterval(refreshPendingCount, 60000)
    return () => clearInterval(interval)
  }, [refreshPendingCount])

  // Build nav items with dynamic badge for review queue
  const visibleItems = useMemo(() => {
    const items = ADMIN_NAV_ITEMS.map((item) => {
      if (item.path === ROUTES.ADMIN_REVIEW && isManager) {
        return { ...item, badge: pendingCount }
      }
      return item
    })
    return isManager ? items : items.filter((item) => !item.managerOnly)
  }, [isManager, pendingCount])

  // Close drawer on window resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen flex bg-bg-gray">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar items={visibleItems} accentColor="gold" />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar items={visibleItems} accentColor="gold" onClose={handleCloseDrawer} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-border h-14 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 rounded-md hover:bg-bg-gray transition-colors"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label={drawerOpen ? '关闭菜单' : '打开菜单'}
            >
              {drawerOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
            <h1 className="text-sm font-medium text-text-secondary">
              管理后台
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && appUser?.role === 'admin' && <NotificationBell />}
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-1 text-sm text-teal hover:text-teal-dark transition-colors"
              title="访问前台"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">前台</span>
            </Link>
            <span className="text-sm text-text-secondary">
              {appUser?.displayName ?? '管理员'}
            </span>
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
