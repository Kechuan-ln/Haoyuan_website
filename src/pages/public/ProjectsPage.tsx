import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  ArrowRight,
  Briefcase,
  Layers,
  Navigation,
  AlertCircle,
} from 'lucide-react'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionHeading } from '@/components/shared/SectionHeading'
import HeroSection from '@/components/shared/HeroSection'
import AnimatedSection from '@/components/shared/AnimatedSection'
import { ImageWithFallback } from '@/components/shared/ImageWithFallback'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/data/projects'
import { PROJECT_CATEGORIES } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { getProjects } from '@/services/projects.service'
import type { Project } from '@/types/project'

const ALL_CATEGORIES = [
  { value: 'all', label: '全部' },
  ...PROJECT_CATEGORIES,
] as const

const STAGGER_DELAYS = [0, 100, 200, 300, 400] as const

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      setError(null)
      try {
        const data = await getProjects({ isPublished: true })
        setProjects(data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        setError('加载项目数据失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection
        title="工程案例"
        subtitle="丰富的项目经验，涵盖医疗、教育、住房、产业园等多个领域"
        badge={{ icon: Building2, text: '精选工程案例' }}
      />

      {/* Category Filter */}
      <section className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-bg-gray text-text-secondary hover:bg-navy/5 hover:text-navy'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 sm:py-20 px-4 bg-bg-gray">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="项目案例" subtitle="丰富的工程业绩，覆盖医疗、教育、住房、产业园等多个领域" />
          {/* Results count */}
          {!loading && (
            <p className="text-sm text-text-muted mb-8">
              共 <span className="text-navy font-semibold">{filteredProjects.length}</span> 个项目
            </p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
              : filteredProjects.map((project, i) => {
              const colors = CATEGORY_COLORS[project.category] ?? {
                bg: 'bg-gray-100',
                text: 'text-text-secondary',
              }
              const categoryLabel =
                CATEGORY_LABELS[project.category] ?? project.category

              return (
                <AnimatedSection key={project.id} delay={STAGGER_DELAYS[i % 3]}>
                  <Link
                    to={`${ROUTES.PROJECTS}/${project.id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] block"
                  >
                    {/* Image / Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center relative overflow-hidden">
                      <ImageWithFallback
                        src={project.coverImageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallback={
                          <div className="w-full h-full bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-navy/15" />
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-text-primary mb-3 leading-snug line-clamp-2 group-hover:text-navy transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-text-muted mb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {project.location}
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-1">
                        {project.scope}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border">
                        <span className="inline-flex items-center gap-1 text-teal text-sm font-medium group-hover:gap-2 transition-all">
                          查看详情
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>


          {/* Empty state */}
          {!loading && filteredProjects.length === 0 && (
            <EmptyState title="暂无项目案例" description="项目信息正在整理中" />
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, value: `${projects.length}+`, label: '完成项目', color: 'navy' as const },
              { icon: Layers, value: '6', label: '业务领域', color: 'teal' as const },
              { icon: Navigation, value: '深圳', label: '主要服务区域', color: 'gold' as const },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} variant="scale" delay={STAGGER_DELAYS[i]}>
                <div className="text-center p-6 rounded-xl bg-bg-gray">
                  <div className={`w-12 h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${stat.color === 'navy' ? 'text-navy' : stat.color === 'teal' ? 'text-teal' : 'text-gold-dark'}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
