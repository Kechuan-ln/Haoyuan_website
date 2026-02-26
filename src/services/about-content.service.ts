import { requireDb } from '@/config/cloudbase'
import type { AboutContent } from '@/types/about'

const COLLECTION = 'content'
const DOC_ID = 'about'

export async function getAboutContent(): Promise<AboutContent | null> {
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (!result.data || result.data.length === 0) return null
  return result.data[0] as AboutContent
}

export async function updateAboutContent(
  data: Omit<AboutContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await db.collection(COLLECTION).doc(DOC_ID).set({
    ...data,
    updatedAt: new Date(),
  })
}
