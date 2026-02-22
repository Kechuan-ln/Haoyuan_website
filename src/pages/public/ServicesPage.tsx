import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Phone,
} from 'lucide-react'
import { SERVICES_DATA } from '@/data/services'
import { ROUTES } from '@/config/routes'

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-28 px-4 overflow-hidden">
        {/* Decorative geometric pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
          <div className="absolute bottom-10 right-1/3 w-20 h-20 border-2 border-white rotate-45" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-sm text-white/90">专业技术服务</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            业务范围
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            五大核心业务板块，提供工程建设全过程技术服务
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            {SERVICES_DATA.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Icon and Number */}
                  <div
                    className={`lg:w-64 shrink-0 p-8 flex flex-col items-center justify-center ${
                      index % 2 === 0
                        ? 'bg-gradient-to-br from-navy to-navy-dark'
                        : 'bg-gradient-to-br from-teal to-teal-dark'
                    }`}
                  >
                    <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-4">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white/50 text-sm font-medium">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 p-8 lg:p-10">
                    <h3 className="text-2xl font-bold text-navy mb-4">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Key Points */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {service.keyPoints.map((point) => (
                        <span
                          key={point}
                          className="inline-flex items-center gap-1.5 text-sm bg-bg-gray text-text-primary px-3 py-1.5 rounded-full"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-teal" />
                          {point}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`${ROUTES.SERVICES}/${service.id}`}
                      className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium transition-colors group"
                    >
                      查看详情
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-navy via-navy to-navy-dark rounded-2xl p-10 sm:p-14 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              需要专业的工程技术服务？
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              联系我们获取专属解决方案，我们将根据您的项目需求提供最优的技术服务方案
            </p>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
            >
              <Phone className="w-4 h-4" />
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
