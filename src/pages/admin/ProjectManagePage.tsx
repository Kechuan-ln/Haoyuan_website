import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save, Building2, Loader2, AlertCircle } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/projects'
import { getProjects, createProject, updateProject, deleteProject } from '@/services/projects.service'
import type { Project } from '@/types/project'

/* ---------- Types ---------- */

type FormData = {
  title: string
  slug: string
  category: string
  location: string
  scope: string
  client: string
  description: string
  coverImageUrl: string
  galleryImageUrls: string[]
  isPublished: boolean
  serviceType: string
  sortOrder: number
}

/* ---------- Constants ---------- */

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS)

const EMPTY_FORM: FormData = {
  title: '',
  slug: '',
  category: 'medical',
  location: '',
  scope: '',
  client: '',
  description: '',
  coverImageUrl: '',
  galleryImageUrls: [],
  isPublished: true,
  serviceType: 'medical',
  sortOrder: 0,
}

const PUBLISH_FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '已发布', value: 'published' },
  { label: '未发布', value: 'unpublished' },
] as const

/* ---------- Component ---------- */

export default function ProjectManagePage() {
  // Data
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  // Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ---- Fetch data ---- */

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('加载项目数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (publishFilter === 'published' && !p.isPublished) return false
      if (publishFilter === 'unpublished' && p.isPublished) return false
      if (searchQuery.trim() && !p.title.includes(searchQuery.trim())) return false
      return true
    })
  }, [projects, categoryFilter, searchQuery, publishFilter])

  const projectCount = filtered.length

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(project: Project) {
    setEditingId(project.id)
    setForm({
      title: project.title,
      slug: project.slug ?? '',
      category: project.category,
      location: project.location,
      scope: project.scope,
      client: project.client,
      description: project.description,
      coverImageUrl: project.coverImageUrl,
      galleryImageUrls: project.galleryImageUrls ?? [],
      isPublished: project.isPublished,
      serviceType: project.serviceType,
      sortOrder: project.sortOrder ?? 0,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateProject(editingId, {
          title: form.title,
          slug: form.slug,
          category: form.category,
          location: form.location,
          scope: form.scope,
          client: form.client,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          galleryImageUrls: form.galleryImageUrls,
          isPublished: form.isPublished,
          serviceType: form.category,
          sortOrder: form.sortOrder,
        })
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...form, serviceType: form.category }
              : p,
          ),
        )
      } else {
        const newId = await createProject({
          title: form.title,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
          category: form.category,
          location: form.location,
          scope: form.scope,
          client: form.client,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          galleryImageUrls: form.galleryImageUrls,
          isPublished: form.isPublished,
          serviceType: form.category,
          sortOrder: form.sortOrder,
        })
        const newProject: Project = {
          id: newId,
          title: form.title,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
          category: form.category,
          location: form.location,
          scope: form.scope,
          client: form.client,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          galleryImageUrls: form.galleryImageUrls,
          isPublished: form.isPublished,
          serviceType: form.category,
          sortOrder: form.sortOrder,
          createdAt: { toDate: () => new Date() } as Project['createdAt'],
          updatedAt: { toDate: () => new Date() } as Project['updatedAt'],
        }
        setProjects((prev) => [newProject, ...prev])
      }
      closeForm()
    } catch (err) {
      console.error('Failed to save project:', err)
      setError(editingId ? '更新项目失败，请稍后重试' : '创建项目失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError('删除项目失败，请稍后重试')
    }
  }

  async function togglePublish(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    try {
      await updateProject(id, { isPublished: !project.isPublished })
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: !p.isPublished } : p)),
      )
    } catch (err) {
      console.error('Failed to toggle publish:', err)
      setError('更新发布状态失败，请稍后重试')
    }
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /* ---- Render ---- */

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载项目数据...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">业绩管理</h1>
          <p className="text-text-secondary mt-1 text-sm">
            共 {projects.length} 个项目，当前显示 {projectCount} 个
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加业绩
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4 space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-navy text-white'
                : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {CATEGORY_KEYS.map((key) => {
            const colors = CATEGORY_COLORS[key]
            const isActive = categoryFilter === key
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? `${colors.bg} ${colors.text} ring-1 ring-current`
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[key]}
              </button>
            )
          })}
        </div>

        {/* Search + Publish Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索项目名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {PUBLISH_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPublishFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  publishFilter === opt.value
                    ? 'bg-navy text-white'
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Panel */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy">
              {editingId ? '编辑业绩' : '添加业绩'}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-bg-gray transition-colors text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 项目名称 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="请输入项目名称"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">分类</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white"
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* 项目地点 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                项目地点
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="请输入项目地点"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 服务范围 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                服务范围
              </label>
              <textarea
                value={form.scope}
                onChange={(e) => updateField('scope', e.target.value)}
                placeholder="请输入服务范围"
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
              />
            </div>

            {/* 业主单位 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                业主单位
              </label>
              <input
                type="text"
                value={form.client}
                onChange={(e) => updateField('client', e.target.value)}
                placeholder="请输入业主单位"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 封面图片 URL */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                封面图片 URL
              </label>
              <input
                type="text"
                value={form.coverImageUrl}
                onChange={(e) => updateField('coverImageUrl', e.target.value)}
                placeholder="请输入图片链接"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 发布状态 */}
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateField('isPublished', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-navy/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-navy" />
              </label>
              <span className="text-sm text-text-primary">
                {form.isPublished ? '已发布' : '未发布'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={closeForm}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary rounded-lg border border-border hover:bg-bg-gray transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || saving}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}

      {/* Project Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-gray border-b border-border">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  项目名称
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  分类
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  地点
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  范围
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  状态
                </th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((project) => {
                const catColors = CATEGORY_COLORS[project.category] ?? {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                }
                return (
                  <tr
                    key={project.id}
                    className="hover:bg-bg-gray transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                        <span
                          className="text-sm font-medium text-text-primary truncate max-w-[280px]"
                          title={project.title}
                        >
                          {project.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${catColors.bg} ${catColors.text}`}
                      >
                        {CATEGORY_LABELS[project.category] ?? project.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary">
                      {project.location}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-sm text-text-secondary truncate block max-w-[200px]"
                        title={project.scope}
                      >
                        {project.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {project.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          <Eye className="w-3 h-3" />
                          已发布
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-gray-100 px-2 py-0.5 rounded">
                          <EyeOff className="w-3 h-3" />
                          未发布
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePublish(project.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                          title={project.isPublished ? '取消发布' : '发布'}
                        >
                          {project.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {deleteConfirmId === project.id ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs font-medium text-text-secondary bg-bg-gray hover:bg-gray-200 rounded transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(project.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((project) => {
            const catColors = CATEGORY_COLORS[project.category] ?? {
              bg: 'bg-gray-100',
              text: 'text-gray-700',
            }
            return (
              <div key={project.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">{project.location}</p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${catColors.bg} ${catColors.text}`}
                  >
                    {CATEGORY_LABELS[project.category] ?? project.category}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate">{project.scope}</p>
                <div className="flex items-center justify-between">
                  {project.isPublished ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      <Eye className="w-3 h-3" />
                      已发布
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-gray-100 px-2 py-0.5 rounded">
                      <EyeOff className="w-3 h-3" />
                      未发布
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(project)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePublish(project.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                    >
                      {project.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {deleteConfirmId === project.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-xs font-medium text-text-secondary bg-bg-gray hover:bg-gray-200 rounded transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(project.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">没有找到匹配的项目</p>
            <p className="text-sm text-text-muted mt-1">
              尝试调整筛选条件或搜索关键词
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
