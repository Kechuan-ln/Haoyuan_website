import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  ChevronRight,
  Clipboard,
  Home,
  MapPin,
  Tag,
} from 'lucide-react'
import {
  getProjectById,
  getProjectsByCategory,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PROJECTS_DATA,
} from '@/data/projects'
import { ROUTES } from '@/config/routes'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = id ? getProjectById(id) : undefined

  if (!project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">项目未找到</h1>
          <p className="text-text-secondary mb-8">
            您请求的项目页面不存在，请返回工程业绩页面查看。
          </p>
          <Link
            to={ROUTES.PROJECTS}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            返回工程业绩
          </Link>
        </div>
      </div>
    )
  }

  const colors = CATEGORY_COLORS[project.category] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  }
  const categoryLabel = CATEGORY_LABELS[project.category] ?? project.category

  // Related projects from same category, excluding current
  const relatedProjects = getProjectsByCategory(project.category)
    .filter((p) => p.id !== project.id)
    .slice(0, 3)

  // Navigation to next/prev project in full list
  const currentIndex = PROJECTS_DATA.findIndex((p) => p.id === project.id)
  const prevProject = currentIndex > 0 ? PROJECTS_DATA[currentIndex - 1] : undefined
  const nextProject =
    currentIndex < PROJECTS_DATA.length - 1
      ? PROJECTS_DATA[currentIndex + 1]
      : undefined

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
              to={ROUTES.PROJECTS}
              className="hover:text-navy transition-colors"
            >
              工程业绩
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-primary font-medium line-clamp-1">
              {project.title}
            </span>
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
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${colors.bg} ${colors.text}`}
          >
            {categoryLabel}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            {project.title}
          </h1>
        </div>
      </section>

      {/* Detail Content */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Project Details */}
              <div className="bg-white rounded-xl border border-border overflow-hidden mb-10">
                <div className="bg-bg-gray px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-bold text-navy">项目信息</h2>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-start px-6 py-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-text-muted text-sm">
                      <Clipboard className="w-4 h-4" />
                      项目名称
                    </div>
                    <div className="text-text-primary font-medium">
                      {project.title}
                    </div>
                  </div>
                  <div className="flex items-start px-6 py-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-text-muted text-sm">
                      <Tag className="w-4 h-4" />
                      项目类别
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {categoryLabel}
                    </span>
                  </div>
                  <div className="flex items-start px-6 py-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-text-muted text-sm">
                      <MapPin className="w-4 h-4" />
                      项目地点
                    </div>
                    <div className="text-text-primary">{project.location}</div>
                  </div>
                  <div className="flex items-start px-6 py-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-text-muted text-sm">
                      <Building2 className="w-4 h-4" />
                      施工内容
                    </div>
                    <div className="text-text-primary">{project.scope}</div>
                  </div>
                </div>
              </div>

              {/* Image Gallery Placeholder */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-navy mb-6">项目图片</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] bg-bg-gray rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border"
                    >
                      <Camera className="w-8 h-8 text-text-muted/30 mb-2" />
                      <span className="text-xs text-text-muted/50">
                        项目图片
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Back Link */}
              <Link
                to={ROUTES.PROJECTS}
                className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                返回工程业绩
              </Link>

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div className="bg-bg-gray rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-bold text-navy mb-4">
                    同类型项目
                  </h3>
                  <div className="space-y-3">
                    {relatedProjects.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`${ROUTES.PROJECTS}/${rp.id}`}
                        className="block bg-white rounded-lg p-4 border border-border hover:shadow-md hover:border-teal/30 transition-all"
                      >
                        <p className="text-sm text-text-primary leading-snug font-medium line-clamp-2 mb-1">
                          {rp.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin className="w-3 h-3" />
                          {rp.location}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation between projects */}
      <section className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {prevProject ? (
            <Link
              to={`${ROUTES.PROJECTS}/${prevProject.id}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-navy transition-colors group max-w-[40%]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
              <div className="text-left min-w-0">
                <div className="text-xs text-text-muted">上一个项目</div>
                <div className="text-sm font-medium truncate">
                  {prevProject.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <Link
            to={ROUTES.PROJECTS}
            className="text-sm text-text-muted hover:text-navy transition-colors shrink-0"
          >
            全部项目
          </Link>

          {nextProject ? (
            <Link
              to={`${ROUTES.PROJECTS}/${nextProject.id}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-navy transition-colors group max-w-[40%]"
            >
              <div className="text-right min-w-0">
                <div className="text-xs text-text-muted">下一个项目</div>
                <div className="text-sm font-medium truncate">
                  {nextProject.title}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>
    </div>
  )
}
