import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
  managerOnly?: boolean
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  accentColor?: 'gold' | 'teal'
  onClose?: () => void
}

export default function Sidebar({
  items,
  collapsed: initialCollapsed = false,
  accentColor = 'gold',
  onClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const location = useLocation()

  useEffect(() => {
    onClose?.()
  }, [location.pathname, onClose])

  const activeClasses =
    accentColor === 'teal'
      ? 'bg-teal/20 text-teal-light border-l-3 border-teal'
      : 'bg-gold/20 text-gold-light border-l-3 border-gold'

  const hoverClasses =
    accentColor === 'teal'
      ? 'hover:bg-teal/10 hover:text-teal-light'
      : 'hover:bg-gold/10 hover:text-gold-light'

  return (
    <aside
      className={cn(
        'bg-navy text-white flex flex-col shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="关闭侧边栏"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1.5 rounded-md hover:bg-white/10 transition-colors ml-auto"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin' || item.path === '/vendor/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? activeClasses
                      : cn('text-white/70', hoverClasses)
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
