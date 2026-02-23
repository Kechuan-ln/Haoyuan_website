import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon, RefreshCw } from 'lucide-react'
import { uploadFileWithProgress, deleteFile } from '@/services/storage.service'

interface ImageUploaderProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  storagePath: string
  multiple?: boolean
  maxSize?: number
  accept?: string[]
  label?: string
  disabled?: boolean
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploader({
  value,
  onChange,
  storagePath,
  multiple = false,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  label,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!accept.includes(file.type)) {
        return `不支持的文件格式，请上传 ${accept.map((t) => t.split('/')[1]).join('、')} 格式的图片`
      }
      if (file.size > maxSize) {
        return `文件大小超过限制，最大允许 ${formatSize(maxSize)}`
      }
      return null
    },
    [accept, maxSize],
  )

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setUploading(true)
      setProgress(0)

      try {
        const filePath = `${storagePath}/${Date.now()}_${file.name}`
        const url = await uploadFileWithProgress(file, filePath, setProgress)

        if (multiple) {
          const currentValues = Array.isArray(value) ? value : value ? [value] : []
          onChange([...currentValues, url])
        } else {
          onChange(url)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '上传失败，请重试'
        setError(message)
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [validateFile, storagePath, multiple, value, onChange],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      if (multiple) {
        // Upload files sequentially to avoid overwhelming the connection
        const uploadSequentially = async () => {
          for (const file of Array.from(files)) {
            await handleUpload(file)
          }
        }
        void uploadSequentially()
      } else {
        void handleUpload(files[0])
      }

      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    [multiple, handleUpload],
  )

  const handleDelete = useCallback(
    async (urlToDelete: string) => {
      try {
        await deleteFile(urlToDelete)
      } catch {
        // Ignore deletion errors from storage (file may already be gone)
      }

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : []
        onChange(currentValues.filter((u) => u !== urlToDelete))
      } else {
        onChange('')
      }
    },
    [multiple, value, onChange],
  )

  const triggerFileInput = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const acceptString = accept.join(',')

  // Single image mode
  if (!multiple) {
    const imageUrl = Array.isArray(value) ? value[0] || '' : value

    return (
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {imageUrl ? (
          // Preview state
          <div className="group relative inline-block">
            <img
              src={imageUrl}
              alt="预览"
              className="max-h-48 rounded-lg object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  重新上传
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(imageUrl)}
                  className="flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                  删除
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty / uploading state
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={disabled || uploading}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 transition-colors hover:border-navy hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="mb-2 h-10 w-10 animate-spin text-navy" />
                <span className="text-sm text-text-secondary">
                  上传中 {progress}%
                </span>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-10 w-10 text-text-muted" />
                <span className="text-sm text-text-secondary">
                  {label || '点击上传图片'}
                </span>
                <span className="mt-1 text-xs text-text-muted">
                  支持 {accept.map((t) => t.split('/')[1].toUpperCase()).join('、')}，最大 {formatSize(maxSize)}
                </span>
              </>
            )}
            {uploading && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-navy transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </button>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }

  // Multi-image mode
  const images = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url) => (
          <div key={url} className="group relative aspect-square">
            <img
              src={url}
              alt="预览"
              className="h-full w-full rounded-lg object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => void handleDelete(url)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled || uploading}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-navy hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="mb-1 h-8 w-8 animate-spin text-navy" />
              <span className="text-xs text-text-secondary">{progress}%</span>
            </>
          ) : (
            <>
              <ImageIcon className="mb-1 h-8 w-8 text-text-muted" />
              <span className="text-xs text-text-secondary">
                {label || '添加图片'}
              </span>
            </>
          )}
        </button>
      </div>

      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-navy transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
