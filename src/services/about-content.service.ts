import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { AboutContent } from '@/types/about'

const DOC_PATH = 'content/about'

export async function getAboutContent(): Promise<AboutContent | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, DOC_PATH))
  if (!snap.exists()) return null
  return snap.data() as AboutContent
}

export async function updateAboutContent(
  data: Omit<AboutContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await setDoc(doc(db, DOC_PATH), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
