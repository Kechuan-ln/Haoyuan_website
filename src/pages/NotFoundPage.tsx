import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-gray">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
        <p className="text-xl text-text-primary mb-2">页面未找到</p>
        <p className="text-text-secondary mb-8">
          您访问的页面不存在或已被移除
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-block rounded-md bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-dark"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
