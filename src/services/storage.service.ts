import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from 'firebase/storage'
import { requireStorage } from '@/config/firebase'

export async function uploadFile(
  file: File,
  path: string,
): Promise<string> {
  const storageRef = ref(requireStorage(), path)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)
  return downloadUrl
}

export async function deleteFile(url: string): Promise<void> {
  const storageRef = ref(requireStorage(), url)
  await deleteObject(storageRef)
}

export function uploadFileWithProgress(
  file: File,
  path: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(requireStorage(), path)
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      'state_changed',
      (snapshot) => {
        onProgress(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        )
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}
