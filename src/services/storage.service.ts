import { requireApp } from '@/config/cloudbase'

const ENV_ID = import.meta.env.VITE_CLOUDBASE_ENV_ID || ''

/**
 * Build a CloudBase fileID from a cloud path.
 * Format: cloud://envId.region/path
 */
function toFileID(cloudPath: string): string {
  // If already a fileID, return as-is
  if (cloudPath.startsWith('cloud://')) return cloudPath
  return `cloud://${ENV_ID}.${import.meta.env.VITE_CLOUDBASE_REGION || 'ap-guangzhou'}/${cloudPath}`
}

/**
 * Get a long-lived temporary download URL for a fileID.
 */
async function getFileURL(fileID: string): Promise<string> {
  const app = requireApp()
  const result = await app.getTempFileURL({
    fileList: [{ fileID, maxAge: 86400 * 365 }], // 1 year
  })
  const file = result.fileList?.[0]
  if (file && file.code === 'SUCCESS' && file.tempFileURL) {
    return file.tempFileURL
  }
  throw new Error('获取文件下载链接失败')
}

export async function uploadFile(
  file: File,
  path: string,
): Promise<string> {
  const app = requireApp()
  const result = await app.uploadFile({
    cloudPath: path,
    filePath: file as unknown as string, // SDK accepts File but types say string
  })
  const uploadResult = result as unknown as { code?: string; fileID: string }
  if (uploadResult.code) throw new Error(`上传失败: ${uploadResult.code}`)
  return await getFileURL(uploadResult.fileID)
}

export async function deleteFile(urlOrPath: string): Promise<void> {
  const app = requireApp()
  // If it's a temp URL, we can't easily convert back to fileID.
  // Try to extract path from known URL patterns, or use it as a path directly.
  let fileID: string
  if (urlOrPath.startsWith('cloud://')) {
    fileID = urlOrPath
  } else {
    // For URLs returned by getTempFileURL, we need the original cloudPath.
    // Since we don't store fileIDs, try to reconstruct from the path.
    // If the URL contains the env ID, try to extract the path.
    // Fallback: ignore deletion errors gracefully (ImageUploader already catches)
    fileID = toFileID(urlOrPath)
  }

  const result = await app.deleteFile({ fileList: [fileID] })
  const fileResult = result.fileList?.[0]
  if (fileResult && fileResult.code !== 'SUCCESS') {
    console.warn('文件删除失败:', fileResult)
  }
}

export async function uploadFileWithProgress(
  file: File,
  path: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  const app = requireApp()
  const result = await app.uploadFile({
    cloudPath: path,
    filePath: file as unknown as string,
    onUploadProgress: (event: { loaded: number; total: number }) => {
      const percent = Math.round((event.loaded * 100) / event.total)
      onProgress(percent)
    },
  })
  const uploadResult = result as unknown as { code?: string; fileID: string }
  if (uploadResult.code) throw new Error(`上传失败: ${uploadResult.code}`)
  return await getFileURL(uploadResult.fileID)
}
