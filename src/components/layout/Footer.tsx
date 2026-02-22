import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const QUICK_LINKS = [
  { label: '首页', path: ROUTES.HOME },
  { label: '关于我们', path: ROUTES.ABOUT },
  { label: '业务范围', path: ROUTES.SERVICES },
  { label: '工程业绩', path: ROUTES.PROJECTS },
  { label: '资质荣誉', path: ROUTES.QUALIFICATIONS },
  { label: '新闻动态', path: ROUTES.NEWS },
  { label: '联系我们', path: ROUTES.CONTACT },
  { label: '招标大厅', path: ROUTES.BIDDING },
] as const

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">关于我们</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              {COMPANY.name}成立于{COMPANY.foundedYear}年，致力于为客户提供专业的工程建设技术服务，涵盖工程造价、招标代理、工程监理、项目管理及工程咨询等领域。
            </p>
            <p className="text-white/50 text-sm italic">{COMPANY.slogan}</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-4">联系方式</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{COMPANY.phone}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{COMPANY.email}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
                <span>{COMPANY.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-white/50">
            &copy; 2025 {COMPANY.name} 版权所有
          </p>
        </div>
      </div>
    </footer>
  )
}
