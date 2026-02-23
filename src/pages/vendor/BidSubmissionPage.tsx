import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChangeEvent } from 'react'
import {
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Hash,
  DollarSign,
  Calendar,
  FolderOpen,
  ArrowLeft,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import type { Bid, BidSubmission, SubmissionDocument } from '@/types/bid'
import type { Timestamp } from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { getBid, getMySubmissions, submitBid, updateSubmission } from '@/services/bids.service'
import { uploadFile } from '@/services/storage.service'
import { computeSHA256 } from '@/utils/hash'
import { formatDate, formatCurrency } from '@/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/routes'

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isFileAllowed(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (ALLOWED_EXTENSIONS.includes(ext)) return true
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true
  return false
}

export default function BidSubmissionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, appUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bid, setBid] = useState<Bid | null>(null)
  const [existingSubmission, setExistingSubmission] = useState<BidSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // File management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingDocs, setExistingDocs] = useState<SubmissionDocument[]>([])

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadData = useCallback(async () => {
    if (!id || !user) return
    try {
      setLoading(true)
      setError(null)

      const [bidData, submissions] = await Promise.all([
        getBid(id),
        getMySubmissions(user.uid),
      ])

      setBid(bidData)

      // Find existing submission for this bid
      const existing = submissions.find((s) => s.bidId === id)
      if (existing) {
        setExistingSubmission(existing)
        setExistingDocs(existing.documents || [])
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Redirect if not a vendor with approved profile
  useEffect(() => {
    if (!loading && appUser) {
      if (appUser.role !== 'vendor' || appUser.vendorProfile?.status !== 'approved') {
        navigate(ROUTES.VENDOR_REGISTER)
      }
    }
  }, [loading, appUser, navigate])

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validFiles: File[] = []
    const invalidNames: string[] = []

    for (const file of Array.from(files)) {
      if (isFileAllowed(file)) {
        validFiles.push(file)
      } else {
        invalidNames.push(file.name)
      }
    }

    if (invalidNames.length > 0) {
      setSubmitError(`以下文件格式不支持: ${invalidNames.join(', ')}。支持的格式: PDF, DOC, DOCX, XLS, XLSX, ZIP`)
    } else {
      setSubmitError(null)
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingDoc = (index: number) => {
    setExistingDocs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!id || !user || !bid || !appUser?.vendorProfile) return

    const totalFiles = existingDocs.length + selectedFiles.length
    if (totalFiles === 0) {
      setSubmitError('请至少上传一个投标文件')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      // Upload new files
      const newDocs: SubmissionDocument[] = []
      for (const file of selectedFiles) {
        const storagePath = `bid-documents/${id}/${user.uid}/${file.name}`
        const [fileUrl, sha256Hash] = await Promise.all([
          uploadFile(file, storagePath),
          computeSHA256(file),
        ])
        newDocs.push({
          name: file.name,
          url: fileUrl,
          sha256Hash,
          uploadedAt: serverTimestamp() as unknown as Timestamp,
        })
      }

      const allDocs = [...existingDocs, ...newDocs]

      if (existingSubmission) {
        // Update existing submission
        await updateSubmission(existingSubmission.id, {
          documents: allDocs,
        })
      } else {
        // Create new submission
        await submitBid({
          bidId: id,
          vendorId: user.uid,
          vendorCompanyName: appUser.vendorProfile.companyName,
          documents: allDocs,
          status: 'submitted',
          isLocked: false,
          submittedAt: serverTimestamp() as unknown as Timestamp,
        })
      }

      setSubmitSuccess(true)
      // Navigate after brief delay
      setTimeout(() => {
        navigate(ROUTES.VENDOR_MY_BIDS)
      }, 1500)
    } catch (err) {
      console.error('提交失败:', err)
      setSubmitError('提交投标文件失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">加载投标信息中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-teal px-5 py-2.5 text-sm font-semibold text-teal transition-all hover:bg-teal hover:text-white"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // Bid not found
  if (!bid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">招标项目未找到</h2>
          <p className="text-text-secondary mb-6">您访问的招标项目不存在或已被删除</p>
          <button
            onClick={() => navigate(ROUTES.BIDDING)}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回招标大厅
          </button>
        </div>
      </div>
    )
  }

  // Bid not in bidding status
  const isBiddingOpen = bid.status === 'bidding'
  const deadlinePassed = bid.biddingDeadline.toDate() < new Date()

  if (!isBiddingOpen || deadlinePassed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {deadlinePassed ? '投标截止时间已过' : '投标已截止'}
          </h2>
          <p className="text-text-secondary mb-6">
            {deadlinePassed
              ? '该招标项目的投标截止时间已过，无法继续提交投标文件'
              : '该招标项目当前不接受投标'}
          </p>
          <button
            onClick={() => navigate(ROUTES.BIDDING)}
            className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回招标大厅
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {existingSubmission ? '投标文件已更新' : '投标提交成功'}
          </h2>
          <p className="text-text-secondary">正在跳转到我的投标...</p>
        </div>
      </div>
    )
  }

  const isEditMode = !!existingSubmission

  return (
    <div className="py-8 sm:py-12 px-4 bg-bg-gray min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* Page title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
          {isEditMode ? '修改投标文件' : '提交投标'}
        </h1>

        {/* Bid summary card */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">招标项目信息</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-navy" />
              </div>
              <div>
                <p className="text-xs text-text-muted">项目名称</p>
                <p className="font-semibold text-text-primary">{bid.title}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Hash className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">编号</p>
                  <p className="text-sm font-medium text-text-primary">{bid.bidNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">类别</p>
                  <p className="text-sm font-medium text-text-primary">{bid.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">预算金额</p>
                  <p className="text-sm font-medium text-text-primary">{formatCurrency(bid.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">截止日期</p>
                  <p className="text-sm font-medium text-text-primary">{formatDate(bid.biddingDeadline)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File upload area */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            投标文件上传
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            支持格式: PDF, DOC, DOCX, XLS, XLSX, ZIP
          </p>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-teal hover:bg-teal/5"
          >
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-1">点击选择文件上传</p>
            <p className="text-xs text-text-muted">支持多文件同时上传</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Existing documents (edit mode) */}
          {existingDocs.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary mb-2">已上传文件</p>
              <div className="space-y-2">
                {existingDocs.map((doc, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="flex items-center justify-between bg-bg-gray rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-teal" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                        <p className="text-xs text-text-muted">已上传</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExistingDoc(idx)}
                      className="shrink-0 p-1 text-text-muted hover:text-red-500 transition-colors"
                      title="移除文件"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly selected files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-text-primary mb-2">待上传文件</p>
              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="flex items-center justify-between bg-bg-gray rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-gold-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                        <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(idx)}
                      className="shrink-0 p-1 text-text-muted hover:text-red-500 transition-colors"
                      title="移除文件"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vendor info (read-only) */}
        {appUser?.vendorProfile && (
          <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              投标企业信息
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">企业名称</p>
                <p className="text-sm font-medium text-text-primary">{appUser.vendorProfile.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">统一社会信用代码</p>
                <p className="text-sm font-medium text-text-primary">{appUser.vendorProfile.creditCode}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">法定代表人</p>
                <p className="text-sm font-medium text-text-primary">{appUser.vendorProfile.legalPerson}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">资质状态</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                  <ShieldCheck className="w-4 h-4" />
                  已认证
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-all hover:border-text-muted hover:text-text-primary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? '更新中...' : '提交中...'}
              </>
            ) : (
              isEditMode ? '更新投标文件' : '确认提交'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
