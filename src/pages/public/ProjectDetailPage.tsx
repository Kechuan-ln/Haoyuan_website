import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Camera,
  ChevronRight,
  Clipboard,
  Home,
  Loader2,
  MapPin,
  Tag,
} from 'lucide-react'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/data/projects'
import { ROUTES } from '@/config/routes'
import { getProject, getProjects } from '@/services/projects.service'
import type { Project } from '@/types/project'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getProject(id)
        setProject(data)

        if (data) {
          const related = await getProjects({ category: data.category, isPublished: true })
          setRelatedProjects(related.filter((p) => p.id !== data.id).slice(0, 3))
        }
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载项目数据...</span>
      </div>
    )
  }

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

  const galleryImages = project.galleryImageUrls?.length
    ? project.galleryImageUrls
    : []

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

              {/* Description */}
              {project.description && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-navy mb-4">项目描述</h2>
                  <p className="text-text-secondary leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-navy mb-6">项目图片</h2>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-xl overflow-hidden border border-border"
                      >
                        <img
                          src={url}
                          alt={`${project.title} - 图片 ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
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

      {/* Simple back navigation */}
      <section className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link
            to={ROUTES.PROJECTS}
            className="text-sm text-text-muted hover:text-navy transition-colors"
          >
            全部项目
          </Link>
        </div>
      </section>
    </div>
  )
}
