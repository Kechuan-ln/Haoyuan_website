import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  ArrowRight,
  Briefcase,
  Layers,
  Navigation,
} from 'lucide-react'
import {
  PROJECTS_DATA,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/data/projects'
import { PROJECT_CATEGORIES } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const ALL_CATEGORIES = [
  { value: 'all', label: '全部' },
  ...PROJECT_CATEGORIES,
] as const

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProjects =
    activeCategory === 'all'
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rotate-45" />
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rotate-12" />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border-2 border-white -rotate-12" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-sm text-white/90">精选工程案例</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            工程业绩
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            丰富的项目经验，涵盖医疗、教育、住房、产业园等多个领域
          </p>
        </div>
      </section>

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
          {/* Results count */}
          <p className="text-sm text-text-muted mb-8">
            共 <span className="text-navy font-semibold">{filteredProjects.length}</span> 个项目
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const colors = CATEGORY_COLORS[project.category] ?? {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
              }
              const categoryLabel =
                CATEGORY_LABELS[project.category] ?? project.category

              return (
                <Link
                  key={project.id}
                  to={`${ROUTES.PROJECTS}/${project.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
                >
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-navy/5 to-navy/10 flex items-center justify-center relative">
                    <Building2 className="w-12 h-12 text-navy/15" />
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
              )
            })}
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
              <p className="text-text-muted text-lg">
                该类别暂无项目
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-bg-gray">
              <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-navy" />
              </div>
              <div className="text-3xl font-bold text-navy mb-1">13+</div>
              <div className="text-sm text-text-secondary">完成项目</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-bg-gray">
              <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-teal" />
              </div>
              <div className="text-3xl font-bold text-teal mb-1">6</div>
              <div className="text-sm text-text-secondary">业务领域</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-bg-gray">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Navigation className="w-6 h-6 text-gold" />
              </div>
              <div className="text-3xl font-bold text-gold-dark mb-1">深圳</div>
              <div className="text-sm text-text-secondary">主要服务区域</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
