import { requireDb } from '@/config/cloudbase'
import type { Qualification } from '@/types/qualification'
import type { ContentStatus } from '@/types/content-status'

const QUALIFICATIONS = 'qualifications'

export async function getQualifications(opts?: {
  isPublished?: boolean
  status?: ContentStatus
}): Promise<Qualification[]> {
  const db = requireDb()
  const coll = db.collection(QUALIFICATIONS)
  // Build where conditions, then chain orderBy
  // where() must come before orderBy() per CloudBase SDK types
  const whereConditions: Record<string, unknown> = {}
  if (opts?.isPublished !== undefined) {
    whereConditions.isPublished = opts.isPublished
  }
  if (opts?.status) {
    whereConditions.status = opts.status
  }
  const ref = Object.keys(whereConditions).length > 0
    ? coll.where(whereConditions).orderBy('sortOrder', 'asc')
    : coll.orderBy('sortOrder', 'asc')
  const result = await ref.get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Qualification,
  )
}

export async function createQualification(
  data: Omit<Qualification, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(QUALIFICATIONS).add({
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return (result as any).id as string
}

export async function updateQualification(
  id: string,
  data: Partial<Omit<Qualification, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(QUALIFICATIONS).doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function deleteQualification(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(QUALIFICATIONS).doc(id).remove()
}
