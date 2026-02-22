import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

const SERVICE_LINKS = [
  { label: '工程设计', path: ROUTES.SERVICES },
  { label: '工程咨询', path: ROUTES.SERVICES },
  { label: '项目管理', path: ROUTES.SERVICES },
  { label: '工程监理', path: ROUTES.SERVICES },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            浩远工程管理有限公司
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            专业工程咨询与管理服务，助力每一个项目顺利落地
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={ROUTES.SERVICES}
              className="rounded-md bg-gold px-6 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold-dark"
            >
              了解我们的业务
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Service Links */}
      <section className="py-16 px-4 bg-bg-gray">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">
            业务范围
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="rounded-lg bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-lg font-semibold text-navy">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">
            精选工程业绩
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg bg-bg-gray p-6 text-center"
              >
                <div className="h-40 rounded bg-border mb-4 flex items-center justify-center text-text-muted">
                  项目图片占位
                </div>
                <h3 className="font-semibold text-text-primary mb-2">
                  项目名称 {i}
                </h3>
                <p className="text-sm text-text-secondary">
                  项目简介，正在建设中...
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to={ROUTES.PROJECTS}
              className="text-teal hover:text-teal-dark transition-colors text-sm font-medium"
            >
              查看全部业绩 &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
