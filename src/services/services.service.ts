import { requireDb } from '@/config/cloudbase'
import type { Service } from '@/types/service'
import type { ContentStatus } from '@/types/content-status'

const SERVICES = 'services'

export interface ServiceFilters {
  isPublished?: boolean
  status?: ContentStatus
}

export async function getServices(filters?: ServiceFilters): Promise<Service[]> {
  const db = requireDb()
  const whereCondition: Record<string, unknown> = {}
  if (filters?.isPublished !== undefined) {
    whereCondition.isPublished = filters.isPublished
  }
  if (filters?.status) {
    whereCondition.status = filters.status
  }
  const result = await db.collection(SERVICES)
    .where(whereCondition)
    .orderBy('sortOrder', 'asc')
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Service,
  )
}

export async function getService(id: string): Promise<Service | null> {
  const db = requireDb()
  const result = await db.collection(SERVICES).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as Service
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(SERVICES).add({
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function updateService(
  id: string,
  data: Partial<Omit<Service, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(SERVICES).doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function deleteService(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(SERVICES).doc(id).remove()
}
