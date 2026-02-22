import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'
import { storage } from '@/config/firebase'

export async function uploadFile(
  file: File,
  path: string,
): Promise<string> {
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadUrl = await getDownloadURL(snapshot.ref)
  return downloadUrl
}

export async function deleteFile(url: string): Promise<void> {
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}
