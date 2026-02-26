import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  GripVertical,
  Send,
  Check,
  Ban,
  Info,
  AlertTriangle,
} from 'lucide-react'
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '@/services/services.service'
import { submitForReview, publishDirectly, approveContent, rejectContent, unpublishContent } from '@/services/workflow.service'
import { notifyManagers, createNotification } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import { getIcon, ICON_MAP } from '@/config/icon-map'
import ContentStatusBadge from '@/components/shared/ContentStatusBadge'
import type { Service } from '@/types/service'
import type { ContentStatus } from '@/types/content-status'

/* ---------- Types ---------- */

type FormData = {
  title: string
  iconName: string
  description: string
  keyPoints: string
  detailDescription: string
  scopeItems: string
  relatedProjects: string
  sortOrder: string
}

/* ---------- Constants ---------- */

const ICON_NAMES = Object.keys(ICON_MAP)

const EMPTY_FORM: FormData = {
  title: '',
  iconName: 'Calculator',
  description: '',
  keyPoints: '',
  detailDescription: '',
  scopeItems: '',
  relatedProjects: '',
  sortOrder: '0',
}

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending_review' },
  { label: '已发布', value: 'published' },
  { label: '已退回', value: 'rejected' },
]

/* ---------- Helpers ---------- */

function splitComma(str: string): string[] {
  return str
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinComma(arr: string[]): string {
  return arr.join('，')
}

function getContentStatus(item: Service): ContentStatus {
  return item.status ?? (item.isPublished ? 'published' : 'draft')
}

/* ---------- Component ---------- */

export default function ServiceManagePage() {
  const { user, appUser, isManager, isWorker } = useAuth()

  // Data
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  // Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Derived content status for form
  const formContentStatus: ContentStatus = editingService
    ? getContentStatus(editingService)
    : 'draft'

  const isLockedForWorker = isWorker && formContentStatus === 'pending_review'

  /* ---- Fetch data ---- */

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getServices()
      setServices(data)
    } catch (err) {
      console.error('Failed to fetch services:', err)
      setError('加载服务数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const status = getContentStatus(s)
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (
        searchQuery.trim() &&
        !s.title.includes(searchQuery.trim()) &&
        !s.description.includes(searchQuery.trim())
      )
        return false
      return true
    })
  }, [services, searchQuery, statusFilter])

  const serviceCount = filtered.length

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setEditingService(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(service: Service) {
    setEditingId(service.id)
    setEditingService(service)
    setForm({
      title: service.title,
      iconName: service.iconName,
      description: service.description,
      keyPoints: joinComma(service.keyPoints ?? []),
      detailDescription: service.detailDescription,
      scopeItems: joinComma(service.scopeItems ?? []),
      relatedProjects: joinComma(service.relatedProjects ?? []),
      sortOrder: String(service.sortOrder ?? 0),
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setEditingService(null)
    setForm(EMPTY_FORM)
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const isWorkerEditingPublished = isWorker && editingService && getContentStatus(editingService) === 'published'

      const payload = {
        title: form.title,
        iconName: form.iconName,
        description: form.description,
        keyPoints: splitComma(form.keyPoints),
        detailDescription: form.detailDescription,
        scopeItems: splitComma(form.scopeItems),
        relatedProjects: splitComma(form.relatedProjects),
        isPublished: false,
        status: 'draft' as ContentStatus,
        sortOrder: Number(form.sortOrder) || 0,
      }

      if (editingId) {
        await updateService(editingId, payload)
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId ? { ...s, ...payload } : s,
          ),
        )
        if (isWorkerEditingPublished) {
          alert('已保存为草稿，内容已下线，需重新提交审核')
        }
      } else {
        const newId = await createService(payload)
        const newService: Service = {
          id: newId,
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setServices((prev) => [...prev, newService])
      }
      closeForm()
    } catch (err) {
      console.error('Failed to save service:', err)
      setError(editingId ? '更新服务失败，请稍后重试' : '创建服务失败，请稍后重试')
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
        iconName: form.iconName,
        description: form.description,
        keyPoints: splitComma(form.keyPoints),
        detailDescription: form.detailDescription,
        scopeItems: splitComma(form.scopeItems),
        relatedProjects: splitComma(form.relatedProjects),
        isPublished: false,
        status: 'draft' as ContentStatus,
        sortOrder: Number(form.sortOrder) || 0,
      }

      let serviceId = editingId
      if (editingId) {
        await updateService(editingId, payload)
      } else {
        serviceId = await createService(payload)
      }

      await submitForReview('services', serviceId!, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'service',
        contentId: serviceId!,
        contentTitle: form.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了服务「${form.title}」等待审核`,
      })

      if (editingId) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? { ...s, ...payload, status: 'pending_review' as ContentStatus }
              : s,
          ),
        )
      } else {
        await fetchServices()
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
    if (!window.confirm('确认发布此服务？发布后将在官网公开展示。')) return
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        iconName: form.iconName,
        description: form.description,
        keyPoints: splitComma(form.keyPoints),
        detailDescription: form.detailDescription,
        scopeItems: splitComma(form.scopeItems),
        relatedProjects: splitComma(form.relatedProjects),
        isPublished: true,
        status: 'published' as ContentStatus,
        sortOrder: Number(form.sortOrder) || 0,
      }

      if (editingId) {
        await updateService(editingId, payload)
        await publishDirectly('services', editingId, user?.uid ?? '')
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId ? { ...s, ...payload } : s,
          ),
        )
      } else {
        const newId = await createService(payload)
        await publishDirectly('services', newId, user?.uid ?? '')
        const newService: Service = {
          id: newId,
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setServices((prev) => [...prev, newService])
      }
      closeForm()
      alert('发布成功！')
    } catch (err) {
      console.error('Failed to publish service:', err)
      setError('发布失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteService(id)
      setServices((prev) => prev.filter((s) => s.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Failed to delete service:', err)
      setError('删除服务失败，请稍后重试')
    }
  }

  // List-level actions for Manager
  async function handleListApprove(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    try {
      await approveContent('services', id, user?.uid ?? '')
      if (service.submittedBy) {
        await createNotification({
          type: 'approved',
          contentType: 'service',
          contentId: id,
          contentTitle: service.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: service.submittedBy,
          message: `您的服务「${service.title}」已通过审核并发布`,
        })
      }
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'published' as ContentStatus, isPublished: true } : s),
      )
      alert('已通过审核并发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListReject(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    const reason = window.prompt('请输入退回原因：')
    if (reason === null) return
    if (!reason.trim()) { alert('请输入退回原因'); return }
    try {
      await rejectContent('services', id, user?.uid ?? '', reason)
      if (service.submittedBy) {
        await createNotification({
          type: 'rejected',
          contentType: 'service',
          contentId: id,
          contentTitle: service.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: service.submittedBy,
          message: `您的服务「${service.title}」已被退回，原因：${reason}`,
        })
      }
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'rejected' as ContentStatus, isPublished: false, rejectionReason: reason } : s),
      )
      alert('已退回')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListPublish(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    if (!window.confirm(`确认发布服务「${service.title}」？`)) return
    try {
      await publishDirectly('services', id, user?.uid ?? '')
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'published' as ContentStatus, isPublished: true } : s),
      )
      alert('已发布')
    } catch (err) {
      alert('发布失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListUnpublish(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    if (!window.confirm(`确认取消发布服务「${service.title}」？`)) return
    try {
      await unpublishContent('services', id)
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'draft' as ContentStatus, isPublished: false } : s),
      )
      alert('已取消发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListSubmitReview(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    try {
      await submitForReview('services', id, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'service',
        contentId: id,
        contentTitle: service.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了服务「${service.title}」等待审核`,
      })
      setServices((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: 'pending_review' as ContentStatus, isPublished: false } : s),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
        <span className="ml-3 text-text-secondary">加载服务数据...</span>
      </div>
    )
  }

  // Icon preview component
  const IconPreview = ({ name }: { name: string }) => {
    const Icon = getIcon(name)
    return <Icon className="w-5 h-5" />
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
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">服务管理</h1>
          <p className="text-text-secondary mt-1 text-sm">
            共 {services.length} 项服务，当前显示 {serviceCount} 项
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建服务
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="搜索服务名称或描述..."
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
                {editingId ? '编辑服务' : '新建服务'}
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

          {/* Rejected Banner */}
          {formContentStatus === 'rejected' && editingService?.rejectionReason && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">内容已被退回</p>
                <p className="mt-1">退回原因：{editingService.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Pending review lockout */}
          {isLockedForWorker && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm mb-6">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>内容审核中，请等待管理员审核</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 服务名称 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                服务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="请输入服务名称"
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 图标选择 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                图标
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center text-navy shrink-0">
                  <IconPreview name={form.iconName} />
                </div>
                <select
                  value={form.iconName}
                  onChange={(e) => updateField('iconName', e.target.value)}
                  disabled={isLockedForWorker}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 简要描述 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                简要描述
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="请输入服务简要描述"
                rows={3}
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 详细描述 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                详细描述
              </label>
              <textarea
                value={form.detailDescription}
                onChange={(e) =>
                  updateField('detailDescription', e.target.value)
                }
                placeholder="请输入服务详细描述"
                rows={5}
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 核心要点 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                核心要点 <span className="text-text-muted text-xs">(逗号分隔)</span>
              </label>
              <input
                type="text"
                value={form.keyPoints}
                onChange={(e) => updateField('keyPoints', e.target.value)}
                placeholder="投资估算，预算编制，结算审核"
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 服务范围 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                服务范围 <span className="text-text-muted text-xs">(逗号分隔)</span>
              </label>
              <textarea
                value={form.scopeItems}
                onChange={(e) => updateField('scopeItems', e.target.value)}
                placeholder="投资估算编制与审核，设计概算编制与审核，施工图预算编制与审核"
                rows={3}
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 相关项目 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                相关项目 <span className="text-text-muted text-xs">(逗号分隔)</span>
              </label>
              <textarea
                value={form.relatedProjects}
                onChange={(e) =>
                  updateField('relatedProjects', e.target.value)
                }
                placeholder="项目名称1，项目名称2，项目名称3"
                rows={2}
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 排序 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                排序权重
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField('sortOrder', e.target.value)}
                placeholder="0"
                disabled={isLockedForWorker}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
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

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-gray border-b border-border">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  排序
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  图标
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  服务名称
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  描述
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
              {filtered.map((service) => {
                const Icon = getIcon(service.iconName)
                const status = getContentStatus(service)
                return (
                  <tr
                    key={service.id}
                    className="hover:bg-bg-gray transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-text-muted">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm">{service.sortOrder}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center text-navy">
                        <Icon className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-text-primary">
                        {service.title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-sm text-text-secondary truncate block max-w-[300px]"
                        title={service.description}
                      >
                        {service.description}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ContentStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => openEditForm(service)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Worker actions */}
                        {isWorker && (status === 'draft' || status === 'rejected') && (
                          <button
                            onClick={() => handleListSubmitReview(service.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-gold-dark hover:bg-gold/10 transition-colors"
                            title="提交审核"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Manager actions */}
                        {isManager && status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleListApprove(service.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleListReject(service.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="退回"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isManager && status === 'draft' && (
                          <button
                            onClick={() => handleListPublish(service.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="发布"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {isManager && status === 'published' && (
                          <button
                            onClick={() => handleListUnpublish(service.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="取消发布"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {(isManager || (isWorker && (status === 'draft' || status === 'rejected'))) && (
                          <>
                            {deleteConfirmId === service.id ? (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  onClick={() => handleDelete(service.id)}
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
                                onClick={() =>
                                  setDeleteConfirmId(service.id)
                                }
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
          {filtered.map((service) => {
            const Icon = getIcon(service.iconName)
            const status = getContentStatus(service)
            return (
              <div key={service.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center text-navy shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-text-primary truncate">
                        {service.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        排序: {service.sortOrder}
                      </p>
                    </div>
                  </div>
                  <ContentStatusBadge status={status} />
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditForm(service)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {isWorker && (status === 'draft' || status === 'rejected') && (
                    <button
                      onClick={() => handleListSubmitReview(service.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-gold-dark hover:bg-gold/10 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  {isManager && status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => handleListApprove(service.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleListReject(service.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isManager && status === 'draft' && (
                    <button
                      onClick={() => handleListPublish(service.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {isManager && status === 'published' && (
                    <button
                      onClick={() => handleListUnpublish(service.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}

                  {(isManager || (isWorker && (status === 'draft' || status === 'rejected'))) && (
                    <>
                      {deleteConfirmId === service.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(service.id)}
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
                          onClick={() => setDeleteConfirmId(service.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <GripVertical className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">没有找到匹配的服务</p>
            <p className="text-sm text-text-muted mt-1">
              尝试调整筛选条件或搜索关键词
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
