import { requireDb } from '@/config/cloudbase'
import type { HomeContent } from '@/types/home'

const COLLECTION = 'content'
const DOC_ID = 'home'

export async function getHomeContent(): Promise<HomeContent | null> {
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (!result.data || result.data.length === 0) return null
  return result.data[0] as HomeContent
}

export async function updateHomeContent(
  data: Omit<HomeContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await db.collection(COLLECTION).doc(DOC_ID).set({
    ...data,
    updatedAt: new Date(),
  })
}
