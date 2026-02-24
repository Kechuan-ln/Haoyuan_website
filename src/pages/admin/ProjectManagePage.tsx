import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X, Save, Building2, Loader2, AlertCircle, Send, Check, Ban, Info, AlertTriangle } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/projects'
import { getProjects, createProject, updateProject, deleteProject } from '@/services/projects.service'
import { submitForReview, publishDirectly, approveContent, rejectContent, unpublishContent } from '@/services/workflow.service'
import { notifyManagers, createNotification } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import ImageUploader from '@/components/shared/ImageUploader'
import ContentStatusBadge from '@/components/shared/ContentStatusBadge'
import type { Project } from '@/types/project'
import type { ContentStatus } from '@/types/content-status'

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
  sortOrder: 0,
}

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending_review' },
  { label: '已发布', value: 'published' },
  { label: '已退回', value: 'rejected' },
]

/* ---------- Helpers ---------- */

function getContentStatus(item: Project): ContentStatus {
  return item.status ?? (item.isPublished ? 'published' : 'draft')
}

/* ---------- Component ---------- */

export default function ProjectManagePage() {
  const { user, appUser, isManager, isWorker } = useAuth()

  // Data
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  // Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Derived content status for form
  const formContentStatus: ContentStatus = editingProject
    ? getContentStatus(editingProject)
    : 'draft'

  const isLockedForWorker = isWorker && formContentStatus === 'pending_review'

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
      const status = getContentStatus(p)
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (searchQuery.trim() && !p.title.includes(searchQuery.trim())) return false
      return true
    })
  }, [projects, categoryFilter, searchQuery, statusFilter])

  const projectCount = filtered.length

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setEditingProject(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(project: Project) {
    setEditingId(project.id)
    setEditingProject(project)
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
      sortOrder: project.sortOrder ?? 0,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setEditingProject(null)
    setForm(EMPTY_FORM)
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const isWorkerEditingPublished = isWorker && editingProject && getContentStatus(editingProject) === 'published'

      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        location: form.location,
        scope: form.scope,
        client: form.client,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        galleryImageUrls: form.galleryImageUrls,
        isPublished: false,
        status: 'draft' as ContentStatus,
        serviceType: form.category,
        sortOrder: form.sortOrder,
      }

      if (editingId) {
        await updateProject(editingId, payload)
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...payload }
              : p,
          ),
        )
        if (isWorkerEditingPublished) {
          alert('已保存为草稿，内容已下线，需重新提交审核')
        }
      } else {
        const newId = await createProject({
          ...payload,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
        })
        const newProject: Project = {
          id: newId,
          ...payload,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
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

  async function handleSubmitForReview() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        location: form.location,
        scope: form.scope,
        client: form.client,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        galleryImageUrls: form.galleryImageUrls,
        isPublished: false,
        status: 'draft' as ContentStatus,
        serviceType: form.category,
        sortOrder: form.sortOrder,
      }

      let projectId = editingId
      if (editingId) {
        await updateProject(editingId, payload)
      } else {
        projectId = await createProject({
          ...payload,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
        })
      }

      await submitForReview('projects', projectId!, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'project',
        contentId: projectId!,
        contentTitle: form.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了业绩「${form.title}」等待审核`,
      })

      // Update local state
      if (editingId) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...payload, status: 'pending_review' as ContentStatus }
              : p,
          ),
        )
      } else {
        // Reload to get the new item
        await fetchProjects()
      }
      closeForm()
      alert('已提交审核')
    } catch (err) {
      console.error('Failed to submit for review:', err)
      setError('提交审核失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishDirectly() {
    if (!form.title.trim()) return
    if (!window.confirm('确认发布此项目？发布后将在官网公开展示。')) return
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        location: form.location,
        scope: form.scope,
        client: form.client,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        galleryImageUrls: form.galleryImageUrls,
        isPublished: true,
        status: 'published' as ContentStatus,
        serviceType: form.category,
        sortOrder: form.sortOrder,
      }

      if (editingId) {
        await updateProject(editingId, payload)
        await publishDirectly('projects', editingId, user?.uid ?? '')
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, ...payload } : p,
          ),
        )
      } else {
        const newId = await createProject({
          ...payload,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
        })
        await publishDirectly('projects', newId, user?.uid ?? '')
        const newProject: Project = {
          id: newId,
          ...payload,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
          createdAt: { toDate: () => new Date() } as Project['createdAt'],
          updatedAt: { toDate: () => new Date() } as Project['updatedAt'],
        }
        setProjects((prev) => [newProject, ...prev])
      }
      closeForm()
      alert('发布成功！')
    } catch (err) {
      console.error('Failed to publish project:', err)
      setError('发布失败，请稍后重试')
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

  // List-level actions for Manager
  async function handleListApprove(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    try {
      await approveContent('projects', id, user?.uid ?? '')
      if (project.submittedBy) {
        await createNotification({
          type: 'approved',
          contentType: 'project',
          contentId: id,
          contentTitle: project.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: project.submittedBy,
          message: `您的业绩「${project.title}」已通过审核并发布`,
        })
      }
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: 'published' as ContentStatus, isPublished: true } : p),
      )
      alert('已通过审核并发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListReject(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    const reason = window.prompt('请输入退回原因：')
    if (reason === null) return
    if (!reason.trim()) { alert('请输入退回原因'); return }
    try {
      await rejectContent('projects', id, user?.uid ?? '', reason)
      if (project.submittedBy) {
        await createNotification({
          type: 'rejected',
          contentType: 'project',
          contentId: id,
          contentTitle: project.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: project.submittedBy,
          message: `您的业绩「${project.title}」已被退回，原因：${reason}`,
        })
      }
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: 'rejected' as ContentStatus, isPublished: false, rejectionReason: reason } : p),
      )
      alert('已退回')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListPublish(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    if (!window.confirm(`确认发布业绩「${project.title}」？`)) return
    try {
      await publishDirectly('projects', id, user?.uid ?? '')
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: 'published' as ContentStatus, isPublished: true } : p),
      )
      alert('已发布')
    } catch (err) {
      alert('发布失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListUnpublish(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    if (!window.confirm(`确认取消发布业绩「${project.title}」？`)) return
    try {
      await unpublishContent('projects', id)
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: 'draft' as ContentStatus, isPublished: false } : p),
      )
      alert('已取消发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListSubmitReview(id: string) {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    try {
      await submitForReview('projects', id, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'project',
        contentId: id,
        contentTitle: project.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了业绩「${project.title}」等待审核`,
      })
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: 'pending_review' as ContentStatus, isPublished: false } : p),
      )
      alert('已提交审核')
    } catch (err) {
      alert('提交失败: ' + (err instanceof Error ? err.message : '未知错误'))
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

        {/* Search + Status Filter */}
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
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === opt.value
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
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-navy">
                {editingId ? '编辑业绩' : '添加业绩'}
              </h2>
              {editingId && (
                <ContentStatusBadge status={formContentStatus} />
              )}
            </div>
            <button
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-bg-gray transition-colors text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rejected Banner in form */}
          {formContentStatus === 'rejected' && editingProject?.rejectionReason && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">内容已被退回</p>
                <p className="mt-1">退回原因：{editingProject.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Pending review lockout for worker */}
          {isLockedForWorker && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm mb-6">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>内容审核中，请等待管理员审核</p>
            </div>
          )}

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
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">分类</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 封面图片 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                封面图片
              </label>
              {isLockedForWorker ? (
                form.coverImageUrl ? (
                  <img src={form.coverImageUrl} alt="封面" className="w-40 h-24 object-cover rounded-lg" />
                ) : (
                  <p className="text-sm text-text-muted">未上传</p>
                )
              ) : (
                <ImageUploader
                  value={form.coverImageUrl}
                  onChange={(url) => updateField('coverImageUrl', url as string)}
                  storagePath="projects"
                />
              )}
            </div>

            {/* 项目图片集 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                项目图片集
              </label>
              {isLockedForWorker ? (
                form.galleryImageUrls.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {form.galleryImageUrls.map((url, i) => (
                      <img key={i} src={url} alt={`图片${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">未上传</p>
                )
              ) : (
                <ImageUploader
                  value={form.galleryImageUrls || []}
                  onChange={(urls) => updateField('galleryImageUrls', urls as string[])}
                  storagePath="projects"
                  multiple
                  label="上传项目图片"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          {!isLockedForWorker && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={closeForm}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary rounded-lg border border-border hover:bg-bg-gray transition-colors"
            >
              取消
            </button>

            {/* Worker buttons */}
            {isWorker && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={!form.title.trim() || saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存草稿'}
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={!form.title.trim() || saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gold hover:bg-gold-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {saving ? '提交中...' : '提交审核'}
                </button>
              </>
            )}

            {/* Manager buttons */}
            {isManager && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={!form.title.trim() || saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg-gray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存草稿'}
                </button>
                <button
                  onClick={handlePublishDirectly}
                  disabled={!form.title.trim() || saving}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-navy hover:bg-navy-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {saving ? '发布中...' : '发布'}
                </button>
              </>
            )}
          </div>
          )}
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
                const status = getContentStatus(project)
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
                      <ContentStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => openEditForm(project)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Worker actions */}
                        {isWorker && (status === 'draft' || status === 'rejected') && (
                          <>
                            <button
                              onClick={() => handleListSubmitReview(project.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-gold-dark hover:bg-gold/10 transition-colors"
                              title="提交审核"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Manager actions */}
                        {isManager && status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleListApprove(project.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleListReject(project.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="退回"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isManager && status === 'draft' && (
                          <button
                            onClick={() => handleListPublish(project.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="发布"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {isManager && status === 'published' && (
                          <button
                            onClick={() => handleListUnpublish(project.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="取消发布"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete - worker only for draft/rejected, manager always */}
                        {(isManager || (isWorker && (status === 'draft' || status === 'rejected'))) && (
                          <>
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
                          </>
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
            const status = getContentStatus(project)
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
                  <ContentStatusBadge status={status} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(project)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {isWorker && (status === 'draft' || status === 'rejected') && (
                      <button
                        onClick={() => handleListSubmitReview(project.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-gold-dark hover:bg-gold/10 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {isManager && status === 'pending_review' && (
                      <>
                        <button
                          onClick={() => handleListApprove(project.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleListReject(project.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {isManager && status === 'draft' && (
                      <button
                        onClick={() => handleListPublish(project.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {isManager && status === 'published' && (
                      <button
                        onClick={() => handleListUnpublish(project.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {(isManager || (isWorker && (status === 'draft' || status === 'rejected'))) && (
                      <>
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
                      </>
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
