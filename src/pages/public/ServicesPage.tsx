import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Phone,
} from 'lucide-react'
import { getServices } from '@/services/services.service'
import { getIcon } from '@/config/icon-map'
import { ROUTES } from '@/config/routes'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import HeroSection from '@/components/shared/HeroSection'
import AnimatedSection from '@/components/shared/AnimatedSection'
import CTASection from '@/components/shared/CTASection'
import type { Service } from '@/types/service'

const STAGGER_DELAYS = [0, 100, 200, 300, 400] as const

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await getServices({ isPublished: true })
        setServices(data)
      } catch (err) {
        console.error('Failed to fetch services:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="服务项目"
        subtitle="五大核心业务板块，提供工程建设全过程技术服务"
        badge={{ icon: Building2, text: '专业技术服务' }}
      />

      {/* Services Grid */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="核心业务" subtitle="五大专业服务领域，为工程建设全过程提供技术支持" />
          {loading ? (
            <div className="flex flex-col gap-8">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : services.length > 0 ? (
            <div className="flex flex-col gap-8">
              {services.map((service, index) => {
                const Icon = getIcon(service.iconName)
                return (
                  <AnimatedSection key={service.id} delay={STAGGER_DELAYS[index % 4]}>
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] overflow-hidden">
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
                            <Icon className="w-8 h-8 text-white" />
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
                  </AnimatedSection>
                )
              })}
            </div>
          ) : (
            <EmptyState title="暂无服务信息" description="管理员正在完善内容，请稍后访问" />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        variant="navy-bg"
        inset
        title="需要专业的工程技术服务？"
        subtitle="联系我们获取专属解决方案，我们将根据您的项目需求提供最优的技术服务方案"
        primaryAction={{ label: '联系我们', href: ROUTES.CONTACT, icon: Phone }}
      />
    </div>
  )
}
