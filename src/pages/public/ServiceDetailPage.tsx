import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Home,
  Phone,
} from 'lucide-react'
import { getServiceById, SERVICES_DATA } from '@/data/services'
import { ROUTES } from '@/config/routes'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const service = id ? getServiceById(id) : undefined

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">服务未找到</h1>
          <p className="text-text-secondary mb-8">
            您请求的服务页面不存在，请返回业务范围页面查看。
          </p>
          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            返回业务范围
          </Link>
        </div>
      </div>
    )
  }

  // Find adjacent services for navigation
  const currentIndex = SERVICES_DATA.findIndex((s) => s.id === service.id)
  const prevService = currentIndex > 0 ? SERVICES_DATA[currentIndex - 1] : undefined
  const nextService =
    currentIndex < SERVICES_DATA.length - 1 ? SERVICES_DATA[currentIndex + 1] : undefined

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-bg-gray border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <Link
              to={ROUTES.HOME}
              className="hover:text-navy transition-colors inline-flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={ROUTES.SERVICES}
              className="hover:text-navy transition-colors"
            >
              业务范围
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium">{service.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 sm:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 right-20 w-32 h-32 border-2 border-white rotate-12" />
          <div className="absolute bottom-10 left-1/4 w-24 h-24 border-2 border-white -rotate-12" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <service.icon className="w-10 h-10 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {service.title}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Content */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Detailed Description */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-navy mb-6">服务介绍</h2>
                <p className="text-text-secondary leading-relaxed text-lg">
                  {service.detailDescription}
                </p>
              </div>

              {/* Service Scope */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-navy mb-6">服务范围</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.scopeItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 bg-bg-gray rounded-xl p-4"
                    >
                      <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                      <span className="text-text-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-navy mb-6">核心优势</h2>
                <div className="flex flex-wrap gap-3">
                  {service.keyPoints.map((point) => (
                    <span
                      key={point}
                      className="inline-flex items-center gap-2 bg-navy/5 text-navy font-medium px-5 py-2.5 rounded-full border border-navy/10"
                    >
                      <CheckCircle className="w-4 h-4 text-gold" />
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Projects */}
              <div className="bg-bg-gray rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-navy mb-4">相关项目</h3>
                <div className="space-y-3">
                  {service.relatedProjects.map((project) => (
                    <div
                      key={project}
                      className="bg-white rounded-lg p-4 border border-border"
                    >
                      <p className="text-sm text-text-primary leading-snug">
                        {project}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  to={ROUTES.PROJECTS}
                  className="inline-flex items-center gap-1 text-teal text-sm font-medium mt-4 hover:text-teal-dark transition-colors"
                >
                  查看全部项目
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Contact CTA */}
              <div className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">联系我们了解更多</h3>
                <p className="text-white/70 text-sm mb-5">
                  如需了解{service.title}服务的更多详情，欢迎随时与我们联系
                </p>
                <Link
                  to={ROUTES.CONTACT}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light w-full justify-center"
                >
                  <Phone className="w-4 h-4" />
                  联系我们
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation between services */}
      <section className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {prevService ? (
            <Link
              to={`${ROUTES.SERVICES}/${prevService.id}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-navy transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-text-muted">上一项</div>
                <div className="text-sm font-medium">{prevService.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link
            to={ROUTES.SERVICES}
            className="text-sm text-text-muted hover:text-navy transition-colors"
          >
            返回业务范围
          </Link>

          {nextService ? (
            <Link
              to={`${ROUTES.SERVICES}/${nextService.id}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-navy transition-colors group"
            >
              <div className="text-right">
                <div className="text-xs text-text-muted">下一项</div>
                <div className="text-sm font-medium">{nextService.title}</div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>
    </div>
  )
}
