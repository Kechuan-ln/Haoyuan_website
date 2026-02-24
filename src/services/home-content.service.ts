import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { HomeContent } from '@/types/home'

const DOC_PATH = 'content/home'

export async function getHomeContent(): Promise<HomeContent | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, DOC_PATH))
  if (!snap.exists()) return null
  return snap.data() as HomeContent
}

export async function updateHomeContent(
  data: Omit<HomeContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await setDoc(doc(db, DOC_PATH), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
