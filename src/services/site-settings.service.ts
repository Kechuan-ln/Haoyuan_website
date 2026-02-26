import { requireDb } from '@/config/cloudbase'
import type { SiteSettings } from '@/types/contact'

const COLLECTION = 'settings'
const DOC_ID = 'site'

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (!result.data || result.data.length === 0) return null
  return result.data[0] as SiteSettings
}

export async function updateSiteSettings(
  data: SiteSettings,
): Promise<void> {
  const db = requireDb()
  await db.collection(COLLECTION).doc(DOC_ID).set({
    ...data,
    updatedAt: new Date(),
  })
}
