import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { COMPANY } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { getProjects } from '@/services/projects.service'
import { getServices } from '@/services/services.service'
import { getHomeContent } from '@/services/home-content.service'
import { getSiteSettings } from '@/services/site-settings.service'
import { getIcon } from '@/config/icon-map'
import { CATEGORY_LABELS } from '@/data/projects'
import { SectionHeading } from '@/components/shared/SectionHeading'
import AnimatedSection from '@/components/shared/AnimatedSection'
import CTASection from '@/components/shared/CTASection'
import { ImageWithFallback } from '@/components/shared/ImageWithFallback'
import { HeroCarousel } from '@/components/shared/HeroCarousel'
import type { Project } from '@/types/project'
import type { Service } from '@/types/service'
import type { HomeContent } from '@/types/home'
import type { HeroSlide } from '@/types/contact'

/* ---------- Default values (used when Firestore doc is empty) ---------- */

const DEFAULT_BRAND_VALUES: HomeContent['brandValues'] = [
  { label: '专业', iconName: 'Target', description: '以精湛技术立身' },
  { label: '共赢', iconName: 'Handshake', description: '与客户共创价值' },
  { label: '责任', iconName: 'Shield', description: '对品质负责到底' },
  { label: '诚信', iconName: 'Heart', description: '以诚信赢得信赖' },
]

const DEFAULT_THREE_NO_WORRIES: HomeContent['threeNoWorries'] = [
  {
    title: '质量零事故',
    iconName: 'ShieldCheck',
    description: '严格把控工程质量，建立全过程质量管控体系，确保每一个环节都符合国家标准和行业规范。',
  },
  {
    title: '安全无隐患',
    iconName: 'HardHat',
    description: '贯彻安全生产责任制，落实安全防护措施，打造零隐患施工环境，保障人员与财产安全。',
  },
  {
    title: '进度可视化',
    iconName: 'BarChart3',
    description: '运用数字化管理工具，实时跟踪项目进度，让客户随时掌握工程动态，做到心中有数。',
  },
]

const DEFAULT_STATS: HomeContent['stats'] = [
  { value: '50+', label: '项目经验', iconName: 'Briefcase' },
  { value: '100%', label: '合格率', iconName: 'CheckCircle' },
  { value: '5+', label: '业务领域', iconName: 'Award' },
  { value: '2021', label: '成立年份', iconName: 'Calendar' },
]

const STAGGER_DELAYS = [0, 100, 200, 300, 400] as const

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [homeServices, setHomeServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await getProjects({ isPublished: true })
        setFeaturedProjects(data.slice(0, 4))
      } catch (err) {
        console.error('Failed to fetch featured projects:', err)
      } finally {
        setProjectsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await getServices({ isPublished: true })
        setHomeServices(data.slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch services:', err)
      } finally {
        setServicesLoading(false)
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const data = await getHomeContent()
        setHomeContent(data)
      } catch (err) {
        console.error('Failed to fetch home content:', err)
      }
    }
    fetchHomeContent()
  }, [])

  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        const settings = await getSiteSettings()
        if (settings?.heroSlides?.length) {
          setHeroSlides(settings.heroSlides)
        }
      } catch (err) {
        console.error('Failed to fetch hero slides:', err)
      }
    }
    fetchHeroSlides()
  }, [])

  const brandValues = homeContent?.brandValues?.length
    ? homeContent.brandValues
    : DEFAULT_BRAND_VALUES
  const threeNoWorries = homeContent?.threeNoWorries?.length
    ? homeContent.threeNoWorries
    : DEFAULT_THREE_NO_WORRIES
  const stats = homeContent?.stats?.length
    ? homeContent.stats
    : DEFAULT_STATS

  return (
    <div>
      {/* Hero Section */}
      <HeroCarousel slides={heroSlides} />

      {/* Brand Values Strip */}
      <section className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {brandValues.map((v) => {
              const Icon = getIcon(v.iconName)
              return (
                <div key={v.label} className="flex items-center justify-center gap-3 text-navy">
                  <Icon className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="text-lg font-bold">{v.label}</span>
                    <p className="text-xs text-navy/70 hidden sm:block">{v.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 全程三无忧 Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title='"全程三无忧" 服务理念'
            subtitle="以质量、安全、进度三大维度构建全方位服务保障体系，让客户安心无忧"
          />
          <div className="grid sm:grid-cols-3 gap-8">
            {threeNoWorries.map((item, i) => {
              const Icon = getIcon(item.iconName)
              return (
                <AnimatedSection key={item.title} delay={STAGGER_DELAYS[i]}>
                  <div className="bg-white rounded-xl p-8 border-l-4 border-navy shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                    <div className="w-14 h-14 bg-navy/10 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-navy" />
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{item.description}</p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Business Services Section */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="五大业务板块"
            subtitle="覆盖工程建设全生命周期的专业技术服务"
          />

          {servicesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-navy animate-spin" />
              <span className="ml-3 text-text-secondary">加载服务数据...</span>
            </div>
          ) : homeServices.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeServices.map((service, i) => {
                const Icon = getIcon(service.iconName)
                return (
                  <AnimatedSection key={service.id} delay={STAGGER_DELAYS[i % 5]}>
                    <Link
                      to={`${ROUTES.SERVICES}/${service.id}`}
                      className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-border block"
                    >
                      <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-colors">
                        <Icon className="w-7 h-7 text-teal" />
                      </div>
                      <h3 className="text-xl font-bold text-navy mb-3">{service.title}</h3>
                      <p className="text-text-secondary leading-relaxed mb-4">{service.description}</p>
                      <span className="inline-flex items-center gap-1 text-teal text-sm font-medium group-hover:gap-2 transition-all">
                        了解更多
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted">暂无服务数据</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 sm:py-24 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="精选工程业绩"
            subtitle="深耕工程建设领域，为众多标杆项目提供优质技术服务"
          />

          {projectsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-navy animate-spin" />
              <span className="ml-3 text-text-secondary">加载项目数据...</span>
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project, i) => {
                const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category
                return (
                  <AnimatedSection key={project.id} delay={STAGGER_DELAYS[i % 5]}>
                    <Link
                      to={`${ROUTES.PROJECTS}/${project.id}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] block"
                    >
                      <div className="h-44 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center relative overflow-hidden">
                        <ImageWithFallback
                          src={project.coverImageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fallback={
                            <div className="w-full h-full bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                              <Building2 className="w-12 h-12 text-navy/20" />
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
                        <span className="absolute top-3 left-3 bg-teal text-white text-xs font-medium px-3 py-1 rounded-full">
                          {categoryLabel}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-text-primary mb-2 leading-snug line-clamp-2 group-hover:text-navy transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-text-secondary">{project.scope}</p>
                      </div>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted">暂无项目数据</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to={ROUTES.PROJECTS}
              className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
            >
              查看全部业绩
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = getIcon(stat.iconName)
              return (
                <AnimatedSection key={stat.label} variant="scale" delay={STAGGER_DELAYS[i]}>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-gold" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-gold mb-2">{stat.value}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        variant="light-bg"
        title={COMPANY.fullSlogan}
        subtitle="我们期待与您携手合作，以专业技术和优质服务，共同实现工程项目的卓越目标"
        primaryAction={{ label: '联系我们', href: ROUTES.CONTACT, icon: ArrowRight }}
      />
    </div>
  )
}
