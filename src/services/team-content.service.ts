import { requireDb } from '@/config/cloudbase'
import type { TeamContent } from '@/types/team'

const COLLECTION = 'content'
const DOC_ID = 'team'

export async function getTeamContent(): Promise<TeamContent | null> {
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (!result.data || result.data.length === 0) return null
  return result.data[0] as TeamContent
}

export async function updateTeamContent(
  data: Omit<TeamContent, 'updatedAt'>,
): Promise<void> {
  const db = requireDb()
  await db.collection(COLLECTION).doc(DOC_ID).set({
    ...data,
    updatedAt: new Date(),
  })
}
