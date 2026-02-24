import { useState, useMemo, useEffect, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import {
  Plus, Search, Edit2, Trash2, X, Save, FileText, Loader2, AlertCircle,
  Upload, ChevronRight, Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getBids, createBid, updateBid, deleteBid, updateBidStatus, getSubmissionsForBid } from '@/services/bids.service'
import { uploadFile } from '@/services/storage.service'
import { PROJECT_CATEGORIES, BID_STATUSES } from '@/config/constants'
import { formatDate, formatCurrency } from '@/utils/format'
import type { Bid, BidStatus, BidDocument } from '@/types/bid'

/* ---------- Types ---------- */

type FormData = {
  title: string
  bidNumber: string
  description: string
  category: string
  requirements: string
  budget: string
  biddingDeadline: string
  openingAt: string
  documents: BidDocument[]
}

/* ---------- Constants ---------- */

const EMPTY_FORM: FormData = {
  title: '',
  bidNumber: '',
  description: '',
  category: 'medical',
  requirements: '',
  budget: '',
  biddingDeadline: '',
  openingAt: '',
  documents: [],
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
  navy: 'bg-[#1B3A5C]/10 text-[#1B3A5C]',
}

/** Next status transitions and their button labels */
const STATUS_ACTIONS: Partial<Record<BidStatus, { next: BidStatus; label: string }>> = {
  draft: { next: 'published', label: '发布' },
  published: { next: 'bidding', label: '开始投标' },
  bidding: { next: 'closed', label: '截止投标' },
  closed: { next: 'evaluating', label: '开始评标' },
}

/* ---------- Helpers ---------- */

function getStatusLabel(status: BidStatus): string {
  return BID_STATUSES.find((s) => s.value === status)?.label ?? status
}

function getStatusColor(status: BidStatus): string {
  const color = BID_STATUSES.find((s) => s.value === status)?.color ?? 'gray'
  return STATUS_BADGE_COLORS[color] ?? STATUS_BADGE_COLORS.gray
}

function getCategoryLabel(category: string): string {
  return PROJECT_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/** Convert a datetime-local string to a Firestore Timestamp */
function toTimestamp(datetimeStr: string): Timestamp {
  return Timestamp.fromDate(new Date(datetimeStr))
}

/** Convert a Firestore Timestamp to a datetime-local string */
function toDatetimeLocal(ts: Timestamp): string {
  const d = ts.toDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ---------- Component ---------- */

export default function BidManagePage() {
  const { user, isManager } = useAuth()

  // Data
  const [bids, setBids] = useState<Bid[]>([])
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /* ---- Fetch data ---- */

  const fetchBids = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBids()
      setBids(data)

      // Fetch submission counts in parallel
      const counts: Record<string, number> = {}
      await Promise.all(
        data.map(async (bid) => {
          try {
            const subs = await getSubmissionsForBid(bid.id)
            counts[bid.id] = subs.length
          } catch {
            counts[bid.id] = 0
          }
        }),
      )
      setSubmissionCounts(counts)
    } catch (err) {
      console.error('Failed to fetch bids:', err)
      setError('加载招标数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBids()
  }, [fetchBids])

  /* ---- Derived ---- */

  const filtered = useMemo(() => {
    return bids.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (searchQuery.trim() && !b.title.includes(searchQuery.trim()) && !b.bidNumber.includes(searchQuery.trim())) return false
      return true
    })
  }, [bids, statusFilter, searchQuery])

  const bidCount = filtered.length

  /* ---- Handlers ---- */

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEditForm(bid: Bid) {
    setEditingId(bid.id)
    setForm({
      title: bid.title,
      bidNumber: bid.bidNumber,
      description: bid.description,
      category: bid.category,
      requirements: bid.requirements,
      budget: String(bid.budget),
      biddingDeadline: bid.biddingDeadline ? toDatetimeLocal(bid.biddingDeadline) : '',
      openingAt: bid.openingAt ? toDatetimeLocal(bid.openingAt) : '',
      documents: bid.documents ?? [],
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingFiles(true)
    try {
      const newDocs: BidDocument[] = []
      for (const file of Array.from(files)) {
        const path = `bids/${editingId ?? 'new'}/${Date.now()}_${file.name}`
        const url = await uploadFile(file, path)
        newDocs.push({
          name: file.name,
          url,
          uploadedAt: Timestamp.now(),
        })
      }
      setForm((prev) => ({ ...prev, documents: [...prev.documents, ...newDocs] }))
    } catch (err) {
      console.error('Failed to upload files:', err)
      setError('文件上传失败，请稍后重试')
    } finally {
      setUploadingFiles(false)
    }
  }

  function removeDocument(index: number) {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.bidNumber.trim()) return
    setSaving(true)
    try {
      const bidData = {
        title: form.title,
        bidNumber: form.bidNumber,
        description: form.description,
        category: form.category,
        requirements: form.requirements,
        budget: Number(form.budget) || 0,
        biddingDeadline: form.biddingDeadline ? toTimestamp(form.biddingDeadline) : Timestamp.now(),
        openingAt: form.openingAt ? toTimestamp(form.openingAt) : Timestamp.now(),
        documents: form.documents,
      }

      if (editingId) {
        await updateBid(editingId, bidData)
        setBids((prev) =>
          prev.map((b) =>
            b.id === editingId
              ? { ...b, ...bidData }
              : b,
          ),
        )
      } else {
        const newId = await createBid({
          ...bidData,
          status: 'draft' as const,
          reviewerIds: [],
          createdBy: user?.uid ?? '',
        })
        const newBid: Bid = {
          id: newId,
          ...bidData,
          status: 'draft',
          reviewerIds: [],
          createdBy: user?.uid ?? '',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
        setBids((prev) => [newBid, ...prev])
      }
      closeForm()
    } catch (err) {
      console.error('Failed to save bid:', err)
      setError(editingId ? '更新招标失败，请稍后重试' : '创建招标失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBid(id)
      setBids((prev) => prev.filter((b) => b.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Failed to delete bid:', err)
      setError('删除招标失败，请稍后重试')
    }
  }

  async function handleStatusChange(id: string, newStatus: BidStatus) {
    try {
      await updateBidStatus(id, newStatus)
      setBids((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      )
    } catch (err) {
      console.error('Failed to update bid status:', err)
      setError('更新招标状态失败，请稍后重试')
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
        <span className="ml-3 text-text-secondary">加载招标数据...</span>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">招标管理</h1>
          <p className="text-text-secondary mt-1 text-sm">
            共 {bids.length} 个招标，当前显示 {bidCount} 个
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-navy hover:bg-navy-dark text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建招标
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-border p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-navy text-white'
                : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {BID_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s.value
                  ? 'bg-navy text-white'
                  : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="搜索标题或标号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
          />
        </div>
      </div>

      {/* Add/Edit Form Panel */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy">
              {editingId ? '编辑招标' : '新建招标'}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-bg-gray transition-colors text-text-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 标题 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                招标标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="请输入招标标题"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 标号 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                招标编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.bidNumber}
                onChange={(e) => updateField('bidNumber', e.target.value)}
                placeholder="例: BID-2026-001"
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
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 描述 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                招标描述
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="请输入招标描述"
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
              />
            </div>

            {/* 招标要求 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                招标要求
              </label>
              <textarea
                value={form.requirements}
                onChange={(e) => updateField('requirements', e.target.value)}
                placeholder="请输入投标资质要求、技术要求等"
                rows={3}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors resize-none"
              />
            </div>

            {/* 预算 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                预算金额（元）
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => updateField('budget', e.target.value)}
                placeholder="请输入预算金额"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 投标截止日期 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                投标截止时间
              </label>
              <input
                type="datetime-local"
                value={form.biddingDeadline}
                onChange={(e) => updateField('biddingDeadline', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 开标时间 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                开标时间
              </label>
              <input
                type="datetime-local"
                value={form.openingAt}
                onChange={(e) => updateField('openingAt', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-colors"
              />
            </div>

            {/* 占位以对齐 */}
            <div />

            {/* 文件上传 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                招标文件
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <div className="flex flex-col items-center gap-2">
                  {uploadingFiles ? (
                    <Loader2 className="w-6 h-6 text-navy animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-text-muted" />
                  )}
                  <label className="cursor-pointer text-sm text-navy hover:underline font-medium">
                    {uploadingFiles ? '上传中...' : '点击上传文件'}
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploadingFiles}
                    />
                  </label>
                  <p className="text-xs text-text-muted">支持 PDF、DOC、DOCX 等文件格式</p>
                </div>

                {/* Uploaded files list */}
                {form.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.documents.map((docItem, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-bg-gray rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-text-muted shrink-0" />
                          <a
                            href={docItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-navy hover:underline truncate"
                          >
                            {docItem.name}
                          </a>
                        </div>
                        <button
                          onClick={() => removeDocument(idx)}
                          className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              disabled={!form.title.trim() || !form.bidNumber.trim() || saving}
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

      {/* Bid Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-gray border-b border-border">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  标号
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  标题
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  分类
                </th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  预算
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  截止日期
                </th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  状态
                </th>
                <th className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  投标数
                </th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((bid) => {
                const action = STATUS_ACTIONS[bid.status]
                return (
                  <tr key={bid.id} className="hover:bg-bg-gray transition-colors">
                    <td className="px-4 py-3.5 text-sm text-text-secondary font-mono">
                      {bid.bidNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-sm font-medium text-text-primary truncate block max-w-[240px]"
                        title={bid.title}
                      >
                        {bid.title}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getCategoryLabel(bid.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary text-right whitespace-nowrap">
                      {formatCurrency(bid.budget)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                      {bid.biddingDeadline ? formatDate(bid.biddingDeadline) : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {getStatusLabel(bid.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                        <Users className="w-3.5 h-3.5" />
                        {submissionCounts[bid.id] ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(bid)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Status action button (hide evaluating transition for workers) */}
                        {action && !(action.next === 'evaluating' && !isManager) && (
                          <button
                            onClick={() => handleStatusChange(bid.id, action.next)}
                            className="px-2 py-1 text-xs font-medium text-white bg-gold hover:bg-gold/90 rounded transition-colors"
                            title={action.label}
                          >
                            {action.label}
                          </button>
                        )}

                        {/* Evaluate link for evaluating/awarded (manager only) */}
                        {isManager && (bid.status === 'evaluating' || bid.status === 'awarded') && (
                          <a
                            href={`/admin/bids/${bid.id}/evaluate`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal hover:text-teal/80 hover:bg-teal/10 rounded transition-colors"
                          >
                            评标 <ChevronRight className="w-3 h-3" />
                          </a>
                        )}

                        {/* Delete */}
                        {deleteConfirmId === bid.id ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleDelete(bid.id)}
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
                            onClick={() => setDeleteConfirmId(bid.id)}
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
          {filtered.map((bid) => {
            const action = STATUS_ACTIONS[bid.status]
            return (
              <div key={bid.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {bid.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">{bid.bidNumber}</p>
                  </div>
                  <span className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bid.status)}`}>
                    {getStatusLabel(bid.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span>{getCategoryLabel(bid.category)}</span>
                  <span>{formatCurrency(bid.budget)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {submissionCounts[bid.id] ?? 0} 投标
                  </span>
                </div>

                <div className="text-xs text-text-muted">
                  截止: {bid.biddingDeadline ? formatDate(bid.biddingDeadline) : '-'}
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditForm(bid)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-navy/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {action && !(action.next === 'evaluating' && !isManager) && (
                    <button
                      onClick={() => handleStatusChange(bid.id, action.next)}
                      className="px-2 py-1 text-xs font-medium text-white bg-gold hover:bg-gold/90 rounded transition-colors"
                    >
                      {action.label}
                    </button>
                  )}

                  {isManager && (bid.status === 'evaluating' || bid.status === 'awarded') && (
                    <a
                      href={`/admin/bids/${bid.id}/evaluate`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal hover:bg-teal/10 rounded transition-colors"
                    >
                      评标 <ChevronRight className="w-3 h-3" />
                    </a>
                  )}

                  {deleteConfirmId === bid.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(bid.id)}
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
                      onClick={() => setDeleteConfirmId(bid.id)}
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
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">没有找到匹配的招标</p>
            <p className="text-sm text-text-muted mt-1">
              尝试调整筛选条件或搜索关键词
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
