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
} from 'lucide-react'
import {
  getQualifications,
  createQualification,
  updateQualification,
  deleteQualification,
} from '@/services/qualifications.service'
import { getIcon, ICON_MAP } from '@/config/icon-map'
import type { Qualification } from '@/types/qualification'

/* ---------- Types ---------- */

type FormData = {
  title: string
  issuer: string
  description: string
  iconName: string
  colorTheme: 'navy' | 'teal' | 'gold'
  sortOrder: string
  isPublished: boolean
}

/* ---------- Constants ---------- */

const ICON_NAMES = Object.keys(ICON_MAP)

const COLOR_OPTIONS: { value: 'navy' | 'teal' | 'gold'; label: string; cls: string }[] = [
  { value: 'navy', label: '深蓝', cls: 'bg-navy/10 text-navy' },
  { value: 'teal', label: '青色', cls: 'bg-teal/10 text-teal' },
  { value: 'gold', label: '金色', cls: 'bg-gold/10 text-gold-dark' },
]

const EMPTY_FORM: FormData = {
  title: '',
  issuer: '',
  description: '',
  iconName: 'Shield',
  colorTheme: 'navy',
  sortOrder: '0',
  isPublished: true,
}

/* ---------- Component ---------- */

export default function QualificationsManagePage() {
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ---- Fetch ---- */

  const fetchQualifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getQualifications()
      setQualifications(data)
    } catch (err) {
      console.error('Failed to fetch qualifications:', err)
      setError('加载资质数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQualifications()
  }, [fetchQualifications])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    return qualifications.filter((q) => {
      if (publishFilter === 'published' && !q.isPublished) return false
      if (publishFilter === 'unpublished' && q.isPublished) return false
      if (
        searchQuery.trim() &&
        !q.title.includes(searchQuery.trim()) &&
        !q.issuer.includes(searchQuery.trim())
      )
        return false
      return true
    })
  }, [qualifications, searchQuery, publishFilter])

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(q: Qualification) {
    setEditingId(q.id)
    setForm({
      title: q.title,
      issuer: q.issuer,
      description: q.description,
      iconName: q.iconName,
      colorTheme: q.colorTheme,
      sortOrder: String(q.sortOrder ?? 0),
      isPublished: q.isPublished,
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
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        description: form.description.trim(),
        iconName: form.iconName,
        colorTheme: form.colorTheme,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: form.isPublished,
      }

      if (editingId) {
        await updateQualification(editingId, payload)
        setQualifications((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...payload } : q)),
        )
      } else {
        const newId = await createQualification(payload)
        const newItem: Qualification = {
          id: newId,
          ...payload,
          createdAt: { toDate: () => new Date() } as Qualification['createdAt'],
          updatedAt: { toDate: () => new Date() } as Qualification['updatedAt'],
        }
        setQualifications((prev) => [...prev, newItem])
      }
      closeForm()
    } catch (err) {
      console.error('Failed to save qualification:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteQualification(id)
      setQualifications((prev) => prev.filter((q) => q.id !== id))
    } catch (err) {
      console.error('Failed to delete qualification:', err)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  async function handleTogglePublish(q: Qualification) {
    try {
      await updateQualification(q.id, { isPublished: !q.isPublished })
      setQualifications((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, isPublished: !item.isPublished } : item,
        ),
      )
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">资质荣誉管理</h1>
          <p className="text-sm text-text-muted mt-1">
            共 {qualifications.length} 项资质，已发布 {qualifications.filter((q) => q.isPublished).length} 项
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加资质
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索资质名称或颁发机构..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'unpublished'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPublishFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                publishFilter === f
                  ? 'bg-navy text-white'
                  : 'bg-white border border-border text-text-secondary hover:bg-bg-gray'
              }`}
            >
              {f === 'all' ? '全部' : f === 'published' ? '已发布' : '未发布'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => {
            const Icon = getIcon(q.iconName)
            const colorOpt = COLOR_OPTIONS.find((c) => c.value === q.colorTheme) ?? COLOR_OPTIONS[0]
            return (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow-sm border border-border overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 ${colorOpt.cls} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        q.isPublished
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {q.isPublished ? '已发布' : '未发布'}
                    </span>
                  </div>
                  <h3 className="font-bold text-text-primary mb-1 line-clamp-1">{q.title}</h3>
                  <p className="text-xs text-teal font-medium mb-2">{q.issuer}</p>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>
                </div>
                <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleTogglePublish(q)}
                    className="p-1.5 rounded-md hover:bg-bg-gray transition-colors text-text-muted"
                    title={q.isPublished ? '取消发布' : '发布'}
                  >
                    {q.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(q)}
                    className="p-1.5 rounded-md hover:bg-bg-gray transition-colors text-text-muted"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(q.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-text-muted hover:text-red-500"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-text-muted text-sm">
              暂无资质数据
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-2">确认删除</h3>
            <p className="text-sm text-text-secondary mb-6">此操作不可撤销，确定要删除该资质吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-bg-gray transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">
                {editingId ? '编辑资质' : '添加资质'}
              </h2>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-md hover:bg-bg-gray transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  资质名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="如：工程监理乙级资质"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>

              {/* Issuer */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  颁发机构
                </label>
                <input
                  type="text"
                  value={form.issuer}
                  onChange={(e) => setForm((prev) => ({ ...prev, issuer: e.target.value }))}
                  placeholder="如：住房和城乡建设部"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  简介
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="资质说明..."
                  rows={3}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-none"
                />
              </div>

              {/* Icon + Color Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">图标</label>
                  <select
                    value={form.iconName}
                    onChange={(e) => setForm((prev) => ({ ...prev, iconName: e.target.value }))}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white"
                  >
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">颜色</label>
                  <select
                    value={form.colorTheme}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        colorTheme: e.target.value as 'navy' | 'teal' | 'gold',
                      }))
                    }
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Order + Published Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">排序</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                      className="w-4 h-4 rounded border-border accent-navy"
                    />
                    <span className="text-sm font-medium text-text-primary">立即发布</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={closeForm}
                className="rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-bg-gray transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
