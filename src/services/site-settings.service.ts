import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { SiteSettings } from '@/types/contact'

const SETTINGS_DOC = 'settings/site'

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, SETTINGS_DOC))
  if (!snap.exists()) return null
  return snap.data() as SiteSettings
}

export async function updateSiteSettings(
  data: SiteSettings,
): Promise<void> {
  const db = requireDb()
  await setDoc(doc(db, SETTINGS_DOC), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
