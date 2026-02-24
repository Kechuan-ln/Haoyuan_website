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
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '@/services/services.service'
import { getIcon, ICON_MAP } from '@/config/icon-map'
import type { Service } from '@/types/service'

/* ---------- Types ---------- */

type FormData = {
  title: string
  iconName: string
  description: string
  keyPoints: string
  detailDescription: string
  scopeItems: string
  relatedProjects: string
  isPublished: boolean
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
  isPublished: true,
  sortOrder: '0',
}

const PUBLISH_FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '已发布', value: 'published' },
  { label: '未发布', value: 'unpublished' },
] as const

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

/* ---------- Component ---------- */

export default function ServiceManagePage() {
  // Data
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [publishFilter, setPublishFilter] = useState<
    'all' | 'published' | 'unpublished'
  >('all')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  // Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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
      if (publishFilter === 'published' && !s.isPublished) return false
      if (publishFilter === 'unpublished' && s.isPublished) return false
      if (
        searchQuery.trim() &&
        !s.title.includes(searchQuery.trim()) &&
        !s.description.includes(searchQuery.trim())
      )
        return false
      return true
    })
  }, [services, searchQuery, publishFilter])

  const serviceCount = filtered.length

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(service: Service) {
    setEditingId(service.id)
    setForm({
      title: service.title,
      iconName: service.iconName,
      description: service.description,
      keyPoints: joinComma(service.keyPoints ?? []),
      detailDescription: service.detailDescription,
      scopeItems: joinComma(service.scopeItems ?? []),
      relatedProjects: joinComma(service.relatedProjects ?? []),
      isPublished: service.isPublished,
      sortOrder: String(service.sortOrder ?? 0),
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
      const payload = {
        title: form.title,
        iconName: form.iconName,
        description: form.description,
        keyPoints: splitComma(form.keyPoints),
        detailDescription: form.detailDescription,
        scopeItems: splitComma(form.scopeItems),
        relatedProjects: splitComma(form.relatedProjects),
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder) || 0,
      }

      if (editingId) {
        await updateService(editingId, payload)
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId ? { ...s, ...payload } : s,
          ),
        )
      } else {
        const newId = await createService(payload)
        const newService: Service = {
          id: newId,
          ...payload,
          createdAt: { toDate: () => new Date() } as Service['createdAt'],
          updatedAt: { toDate: () => new Date() } as Service['updatedAt'],
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

  async function togglePublish(id: string) {
    const service = services.find((s) => s.id === id)
    if (!service) return
    try {
      await updateService(id, { isPublished: !service.isPublished })
      setServices((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, isPublished: !s.isPublished } : s,
        ),
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
              {editingId ? '编辑服务' : '新建服务'}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-bg-gray transition-colors text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
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
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors bg-white"
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
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
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
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
              />
            </div>

            {/* 核心要点 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                核心要点 <span className="text-text-muted text-xs">（逗号分隔）</span>
              </label>
              <input
                type="text"
                value={form.keyPoints}
                onChange={(e) => updateField('keyPoints', e.target.value)}
                placeholder="投资估算，预算编制，结算审核"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 服务范围 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                服务范围 <span className="text-text-muted text-xs">（逗号分隔）</span>
              </label>
              <textarea
                value={form.scopeItems}
                onChange={(e) => updateField('scopeItems', e.target.value)}
                placeholder="投资估算编制与审核，设计概算编制与审核，施工图预算编制与审核"
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
              />
            </div>

            {/* 相关项目 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                相关项目 <span className="text-text-muted text-xs">（逗号分隔）</span>
              </label>
              <textarea
                value={form.relatedProjects}
                onChange={(e) =>
                  updateField('relatedProjects', e.target.value)
                }
                placeholder="项目名称1，项目名称2，项目名称3"
                rows={2}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
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
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 发布状态 */}
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      updateField('isPublished', e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-navy/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-navy" />
                </label>
                <span className="text-sm text-text-primary">
                  {form.isPublished ? '已发布' : '未发布'}
                </span>
              </div>
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
                      {service.isPublished ? (
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
                          onClick={() => openEditForm(service)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePublish(service.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                          title={
                            service.isPublished ? '取消发布' : '发布'
                          }
                        >
                          {service.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
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
                  {service.isPublished ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      <Eye className="w-3 h-3" />
                      已发布
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-gray-100 px-2 py-0.5 rounded">
                      <EyeOff className="w-3 h-3" />
                      未发布
                    </span>
                  )}
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
                  <button
                    onClick={() => togglePublish(service.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-teal hover:bg-teal/10 transition-colors"
                  >
                    {service.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
