import { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  AlertCircle,
  X,
  Save,
  Upload,
  FileCheck,
  Clock,
  Award,
  Building2,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUser } from '@/services/users.service'
import { uploadFile } from '@/services/storage.service'
import type { VendorStatus } from '@/types/user'

/* ---------- Constants ---------- */

const STATUS_CONFIG: Record<VendorStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending: {
    label: '企业资料审核中，请耐心等待',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: Clock,
  },
  approved: {
    label: '企业资料已通过审核',
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    icon: Award,
  },
  rejected: {
    label: '企业资料未通过审核，请修改后重新提交',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    icon: AlertCircle,
  },
}

/* ---------- Component ---------- */

export default function VendorRegisterPage() {
  const { user, appUser } = useAuth()

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [creditCode, setCreditCode] = useState('')
  const [legalPerson, setLegalPerson] = useState('')
  const [licenseUrl, setLicenseUrl] = useState('')

  // UI state
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill form from existing vendor profile
  useEffect(() => {
    if (appUser?.vendorProfile) {
      const vp = appUser.vendorProfile
      setCompanyName(vp.companyName || '')
      setCreditCode(vp.creditCode || '')
      setLegalPerson(vp.legalPerson || '')
      setLicenseUrl(vp.licenseUrl || '')
    }
  }, [appUser])

  /* ---- File Upload ---- */

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type (image or pdf)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError('请上传 JPG、PNG、WebP 或 PDF 格式的文件')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `vendors/${user.uid}/license-${Date.now()}.${ext}`
      const url = await uploadFile(file, path)
      setLicenseUrl(url)
    } catch (err) {
      console.error('Failed to upload file:', err)
      setError('文件上传失败，请稍后重试')
    } finally {
      setUploading(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  /* ---- Save ---- */

  async function handleSave() {
    if (!user) return

    // Validation
    if (!companyName.trim()) {
      setError('请填写公司名称')
      return
    }
    if (!creditCode.trim() || creditCode.trim().length !== 18) {
      setError('统一社会信用代码必须为 18 位')
      return
    }
    if (!legalPerson.trim()) {
      setError('请填写法人代表')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await updateUser(user.uid, {
        vendorProfile: {
          companyName: companyName.trim(),
          creditCode: creditCode.trim(),
          legalPerson: legalPerson.trim(),
          licenseUrl,
          status: 'pending',
        },
      })
      setSuccessMsg('企业资料已提交，等待管理员审核')
    } catch (err) {
      console.error('Failed to save vendor profile:', err)
      setError('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  /* ---- Render ---- */

  const vendorStatus = appUser?.vendorProfile?.status
  const statusConfig = vendorStatus ? STATUS_CONFIG[vendorStatus] : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal">企业资料</h1>
        <p className="text-text-secondary mt-1 text-sm">
          完善企业信息，通过审核后即可参与投标
        </p>
      </div>

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

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="p-1 rounded hover:bg-green-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Banner */}
      {statusConfig ? (
        <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 text-sm ${statusConfig.bg} ${statusConfig.text}`}>
          <statusConfig.icon className="w-5 h-5 shrink-0" />
          <span>{statusConfig.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 text-sm">
          <Building2 className="w-5 h-5 shrink-0" />
          <span>您尚未提交企业资料</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6 space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            公司名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="请输入公司全称"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-colors"
          />
        </div>

        {/* Credit Code */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            统一社会信用代码 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={creditCode}
            onChange={(e) => setCreditCode(e.target.value)}
            placeholder="18位统一社会信用代码"
            maxLength={18}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-colors font-mono"
          />
          <p className="text-xs text-text-muted mt-1">
            共 {creditCode.length}/18 位
          </p>
        </div>

        {/* Legal Person */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            法人代表 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={legalPerson}
            onChange={(e) => setLegalPerson(e.target.value)}
            placeholder="请输入法人代表姓名"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-teal focus:ring-1 focus:ring-teal outline-none transition-colors"
          />
        </div>

        {/* Business License Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            营业执照
          </label>

          {licenseUrl ? (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <FileCheck className="w-5 h-5" />
                <span className="text-sm font-medium">已上传营业执照</span>
              </div>
              {/* Preview if it's an image */}
              {/\.(jpg|jpeg|png|webp)$/i.test(licenseUrl) && (
                <img
                  src={licenseUrl}
                  alt="营业执照预览"
                  className="max-h-48 rounded-lg border border-border object-contain"
                />
              )}
              {/* Preview if it's a PDF */}
              {/\.pdf$/i.test(licenseUrl) && (
                <a
                  href={licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal hover:underline"
                >
                  查看 PDF 文件
                </a>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-teal hover:underline"
              >
                {uploading ? '上传中...' : '重新上传'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-teal hover:bg-teal/5 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-teal animate-spin" />
                  <span className="text-sm text-text-secondary">上传中...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-text-muted" />
                  <span className="text-sm text-text-secondary">
                    点击上传营业执照
                  </span>
                  <span className="text-xs text-text-muted">
                    支持 JPG、PNG、WebP、PDF，最大 10MB
                  </span>
                </div>
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving || !companyName.trim() || !creditCode.trim() || !legalPerson.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-teal hover:bg-teal/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? '提交中...' : '提交资料'}
          </button>
        </div>
      </div>
    </div>
  )
}
