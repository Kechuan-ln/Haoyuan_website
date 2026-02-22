import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SidebarItem {
  label: string
  path: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  accentColor?: 'gold' | 'teal'
}

export default function Sidebar({
  items,
  collapsed: initialCollapsed = false,
  accentColor = 'gold',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

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
      <div className="flex items-center justify-end p-3 border-b border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
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
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
