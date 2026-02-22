import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
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
