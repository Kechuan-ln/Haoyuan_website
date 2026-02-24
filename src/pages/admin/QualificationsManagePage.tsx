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
  Database,
  Send,
  Check,
  Ban,
  Info,
  AlertTriangle,
} from 'lucide-react'
import {
  getQualifications,
  createQualification,
  updateQualification,
  deleteQualification,
} from '@/services/qualifications.service'
import { DEFAULT_QUALIFICATIONS } from '@/config/qualification-defaults'
import { submitForReview, publishDirectly, approveContent, rejectContent, unpublishContent } from '@/services/workflow.service'
import { notifyManagers, createNotification } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import { getIcon, ICON_MAP } from '@/config/icon-map'
import ContentStatusBadge from '@/components/shared/ContentStatusBadge'
import type { Qualification } from '@/types/qualification'
import type { ContentStatus } from '@/types/content-status'

/* ---------- Types ---------- */

type FormData = {
  title: string
  issuer: string
  description: string
  iconName: string
  colorTheme: 'navy' | 'teal' | 'gold'
  sortOrder: string
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
}

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending_review' },
  { label: '已发布', value: 'published' },
  { label: '已退回', value: 'rejected' },
]

/* ---------- Helpers ---------- */

function getContentStatus(item: Qualification): ContentStatus {
  return item.status ?? (item.isPublished ? 'published' : 'draft')
}

/* ---------- Component ---------- */

export default function QualificationsManagePage() {
  const { user, appUser, isManager, isWorker } = useAuth()

  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Derived content status for form
  const formContentStatus: ContentStatus = editingQualification
    ? getContentStatus(editingQualification)
    : 'draft'

  const isLockedForWorker = isWorker && formContentStatus === 'pending_review'

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
      const status = getContentStatus(q)
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (
        searchQuery.trim() &&
        !q.title.includes(searchQuery.trim()) &&
        !q.issuer.includes(searchQuery.trim())
      )
        return false
      return true
    })
  }, [qualifications, searchQuery, statusFilter])

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setEditingQualification(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(q: Qualification) {
    setEditingId(q.id)
    setEditingQualification(q)
    setForm({
      title: q.title,
      issuer: q.issuer,
      description: q.description,
      iconName: q.iconName,
      colorTheme: q.colorTheme,
      sortOrder: String(q.sortOrder ?? 0),
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setEditingQualification(null)
    setForm(EMPTY_FORM)
  }

  async function handleSaveDraft() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const isWorkerEditingPublished = isWorker && editingQualification && getContentStatus(editingQualification) === 'published'

      const payload = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        description: form.description.trim(),
        iconName: form.iconName,
        colorTheme: form.colorTheme,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: false,
        status: 'draft' as ContentStatus,
      }

      if (editingId) {
        await updateQualification(editingId, payload)
        setQualifications((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...payload } : q)),
        )
        if (isWorkerEditingPublished) {
          alert('已保存为草稿，内容已下线，需重新提交审核')
        }
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
      setError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitForReview() {
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
        isPublished: false,
        status: 'draft' as ContentStatus,
      }

      let qualId = editingId
      if (editingId) {
        await updateQualification(editingId, payload)
      } else {
        qualId = await createQualification(payload)
      }

      await submitForReview('qualifications', qualId!, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'qualification',
        contentId: qualId!,
        contentTitle: form.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了资质「${form.title}」等待审核`,
      })

      if (editingId) {
        setQualifications((prev) =>
          prev.map((q) =>
            q.id === editingId
              ? { ...q, ...payload, status: 'pending_review' as ContentStatus }
              : q,
          ),
        )
      } else {
        await fetchQualifications()
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
    if (!window.confirm('确认发布此资质？发布后将在官网公开展示。')) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        description: form.description.trim(),
        iconName: form.iconName,
        colorTheme: form.colorTheme,
        sortOrder: Number(form.sortOrder) || 0,
        isPublished: true,
        status: 'published' as ContentStatus,
      }

      if (editingId) {
        await updateQualification(editingId, payload)
        await publishDirectly('qualifications', editingId, user?.uid ?? '')
        setQualifications((prev) =>
          prev.map((q) =>
            q.id === editingId ? { ...q, ...payload } : q,
          ),
        )
      } else {
        const newId = await createQualification(payload)
        await publishDirectly('qualifications', newId, user?.uid ?? '')
        const newItem: Qualification = {
          id: newId,
          ...payload,
          createdAt: { toDate: () => new Date() } as Qualification['createdAt'],
          updatedAt: { toDate: () => new Date() } as Qualification['updatedAt'],
        }
        setQualifications((prev) => [...prev, newItem])
      }
      closeForm()
      alert('发布成功！')
    } catch (err) {
      console.error('Failed to publish qualification:', err)
      setError('发布失败，请稍后重试')
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
      setError('删除失败，请稍后重试')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // List-level actions for Manager
  async function handleListApprove(id: string) {
    const qual = qualifications.find((q) => q.id === id)
    if (!qual) return
    try {
      await approveContent('qualifications', id, user?.uid ?? '')
      if (qual.submittedBy) {
        await createNotification({
          type: 'approved',
          contentType: 'qualification',
          contentId: id,
          contentTitle: qual.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: qual.submittedBy,
          message: `您的资质「${qual.title}」已通过审核并发布`,
        })
      }
      setQualifications((prev) =>
        prev.map((q) => q.id === id ? { ...q, status: 'published' as ContentStatus, isPublished: true } : q),
      )
      alert('已通过审核并发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListReject(id: string) {
    const qual = qualifications.find((q) => q.id === id)
    if (!qual) return
    const reason = window.prompt('请输入退回原因：')
    if (reason === null) return
    if (!reason.trim()) { alert('请输入退回原因'); return }
    try {
      await rejectContent('qualifications', id, user?.uid ?? '', reason)
      if (qual.submittedBy) {
        await createNotification({
          type: 'rejected',
          contentType: 'qualification',
          contentId: id,
          contentTitle: qual.title,
          fromUserId: user?.uid ?? '',
          fromUserName: appUser?.displayName ?? '管理员',
          toUserId: qual.submittedBy,
          message: `您的资质「${qual.title}」已被退回，原因：${reason}`,
        })
      }
      setQualifications((prev) =>
        prev.map((q) => q.id === id ? { ...q, status: 'rejected' as ContentStatus, isPublished: false, rejectionReason: reason } : q),
      )
      alert('已退回')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListPublish(id: string) {
    const qual = qualifications.find((q) => q.id === id)
    if (!qual) return
    if (!window.confirm(`确认发布资质「${qual.title}」？`)) return
    try {
      await publishDirectly('qualifications', id, user?.uid ?? '')
      setQualifications((prev) =>
        prev.map((q) => q.id === id ? { ...q, status: 'published' as ContentStatus, isPublished: true } : q),
      )
      alert('已发布')
    } catch (err) {
      alert('发布失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListUnpublish(id: string) {
    const qual = qualifications.find((q) => q.id === id)
    if (!qual) return
    if (!window.confirm(`确认取消发布资质「${qual.title}」？`)) return
    try {
      await unpublishContent('qualifications', id)
      setQualifications((prev) =>
        prev.map((q) => q.id === id ? { ...q, status: 'draft' as ContentStatus, isPublished: false } : q),
      )
      alert('已取消发布')
    } catch (err) {
      alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleListSubmitReview(id: string) {
    const qual = qualifications.find((q) => q.id === id)
    if (!qual) return
    try {
      await submitForReview('qualifications', id, user?.uid ?? '')
      await notifyManagers({
        type: 'review_request',
        contentType: 'qualification',
        contentId: id,
        contentTitle: qual.title,
        fromUserId: user?.uid ?? '',
        fromUserName: appUser?.displayName ?? '员工',
        message: `${appUser?.displayName ?? '员工'} 提交了资质「${qual.title}」等待审核`,
      })
      setQualifications((prev) =>
        prev.map((q) => q.id === id ? { ...q, status: 'pending_review' as ContentStatus, isPublished: false } : q),
      )
      alert('已提交审核')
    } catch (err) {
      alert('提交失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true)
    try {
      for (const qual of DEFAULT_QUALIFICATIONS) {
        await createQualification(qual)
      }
      await fetchQualifications()
    } catch (err) {
      console.error('Failed to seed qualifications:', err)
    } finally {
      setSeeding(false)
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
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-navy text-white'
                  : 'bg-white border border-border text-text-secondary hover:bg-bg-gray'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
            const status = getContentStatus(q)
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
                    <ContentStatusBadge status={status} />
                  </div>
                  <h3 className="font-bold text-text-primary mb-1 line-clamp-1">{q.title}</h3>
                  <p className="text-xs text-teal font-medium mb-2">{q.issuer}</p>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>
                </div>
                <div className="border-t border-border px-5 py-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditForm(q)}
                    className="p-1.5 rounded-md hover:bg-bg-gray transition-colors text-text-muted"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Worker actions */}
                  {isWorker && (status === 'draft' || status === 'rejected') && (
                    <button
                      onClick={() => handleListSubmitReview(q.id)}
                      className="p-1.5 rounded-md hover:bg-gold/10 transition-colors text-text-muted hover:text-gold-dark"
                      title="提交审核"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  {/* Manager actions */}
                  {isManager && status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => handleListApprove(q.id)}
                        className="p-1.5 rounded-md hover:bg-green-50 transition-colors text-text-muted hover:text-green-600"
                        title="通过"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleListReject(q.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-text-muted hover:text-red-500"
                        title="退回"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isManager && status === 'draft' && (
                    <button
                      onClick={() => handleListPublish(q.id)}
                      className="p-1.5 rounded-md hover:bg-green-50 transition-colors text-text-muted hover:text-green-600"
                      title="发布"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {isManager && status === 'published' && (
                    <button
                      onClick={() => handleListUnpublish(q.id)}
                      className="p-1.5 rounded-md hover:bg-amber-50 transition-colors text-text-muted hover:text-amber-600"
                      title="取消发布"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  {(isManager || (isWorker && (status === 'draft' || status === 'rejected'))) && (
                    <button
                      onClick={() => setDeleteConfirmId(q.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 transition-colors text-text-muted hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && qualifications.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted">
              <Database className="w-12 h-12 mb-4 text-text-muted/50" />
              <p className="text-sm mb-4">暂无资质数据</p>
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
              >
                {seeding && <Loader2 className="w-4 h-4 animate-spin" />}
                初始化默认资质数据
              </button>
            </div>
          )}
          {filtered.length === 0 && qualifications.length > 0 && (
            <div className="col-span-full text-center py-20 text-text-muted text-sm">
              没有匹配的资质
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
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingId ? '编辑资质' : '添加资质'}
                </h2>
                {editingId && (
                  <ContentStatusBadge status={formContentStatus} />
                )}
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 rounded-md hover:bg-bg-gray transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Rejected Banner */}
              {formContentStatus === 'rejected' && editingQualification?.rejectionReason && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">内容已被退回</p>
                    <p className="mt-1">退回原因：{editingQualification.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Pending review lockout */}
              {isLockedForWorker && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>内容审核中，请等待管理员审核</p>
                </div>
              )}

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
                  disabled={isLockedForWorker}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  disabled={isLockedForWorker}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  disabled={isLockedForWorker}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                    disabled={isLockedForWorker}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                    disabled={isLockedForWorker}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">排序</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  disabled={isLockedForWorker}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            {!isLockedForWorker && (
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={closeForm}
                className="rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-bg-gray transition-colors"
              >
                取消
              </button>

              {isWorker && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving || !form.title.trim()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-bg-gray transition-colors disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    保存草稿
                  </button>
                  <button
                    onClick={handleSubmitForReview}
                    disabled={saving || !form.title.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-white hover:bg-gold-dark transition-colors disabled:opacity-60"
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
                    disabled={saving || !form.title.trim()}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-bg-gray transition-colors disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    保存草稿
                  </button>
                  <button
                    onClick={handlePublishDirectly}
                    disabled={saving || !form.title.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {saving ? '发布中...' : '发布'}
                  </button>
                </>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
