import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { label: '首页', path: ROUTES.HOME },
  { label: '关于我们', path: ROUTES.ABOUT },
  { label: '业务范围', path: ROUTES.SERVICES },
  { label: '工程业绩', path: ROUTES.PROJECTS },
  { label: '资质荣誉', path: ROUTES.QUALIFICATIONS },
  { label: '新闻动态', path: ROUTES.NEWS },
  { label: '联系我们', path: ROUTES.CONTACT },
  { label: '招标大厅', path: ROUTES.BIDDING },
] as const

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { user, appUser } = useAuth()

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  function isActive(path: string): boolean {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-gold hidden sm:inline">
              {COMPANY.name}
            </span>
            <span className="text-lg font-bold text-gold sm:hidden">
              {COMPANY.shortName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(link.path)
                    ? 'text-gold bg-white/10'
                    : 'text-white/90 hover:text-gold hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: auth + mobile toggle */}
          <div className="flex items-center gap-2">
            {/* Auth area */}
            {user && appUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {appUser.displayName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 transition-transform',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {appUser.role === 'admin' && (
                      <Link
                        to={ROUTES.ADMIN}
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-gray"
                      >
                        管理后台
                      </Link>
                    )}
                    {appUser.role === 'vendor' && (
                      <Link
                        to={ROUTES.VENDOR_DASHBOARD}
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-gray"
                      >
                        供应商门户
                      </Link>
                    )}
                    <Link
                      to={ROUTES.LOGIN}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-bg-gray"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-md hover:bg-gold-light transition-colors"
              >
                <User className="w-4 h-4" />
                登录/注册
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-white/10 animate-[slideDown_0.2s_ease-out]">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(link.path)
                    ? 'text-gold bg-white/10'
                    : 'text-white/90 hover:text-gold hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth */}
            {!user && (
              <Link
                to={ROUTES.LOGIN}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gold hover:bg-white/5 rounded-md"
              >
                <User className="w-4 h-4" />
                登录/注册
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
