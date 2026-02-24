import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { TeamContent } from '@/types/team'

const DOC_PATH = 'content/team'

export async function getTeamContent(): Promise<TeamContent | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, DOC_PATH))
  if (!snap.exists()) return null
  return snap.data() as TeamContent
}

export async function updateTeamContent(
  data: Omit<TeamContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await setDoc(doc(db, DOC_PATH), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
