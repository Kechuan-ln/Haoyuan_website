import { requireDb } from '@/config/cloudbase'
import type { Project } from '@/types/project'
import type { ContentStatus } from '@/types/content-status'

const PROJECTS = 'projects'

export interface ProjectFilters {
  category?: string
  isPublished?: boolean
  status?: ContentStatus
}

export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  const db = requireDb()
  const whereCondition: Record<string, unknown> = {}
  if (filters?.category) {
    whereCondition.category = filters.category
  }
  if (filters?.isPublished !== undefined) {
    whereCondition.isPublished = filters.isPublished
  }
  if (filters?.status) {
    whereCondition.status = filters.status
  }
  const result = await db.collection(PROJECTS).where(whereCondition).get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Project,
  )
}

export async function getLatestProjects(count = 3): Promise<Project[]> {
  const db = requireDb()
  const result = await db.collection(PROJECTS)
    .orderBy('createdAt', 'desc')
    .limit(count)
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Project,
  )
}

export async function getProject(id: string): Promise<Project | null> {
  const db = requireDb()
  const result = await db.collection(PROJECTS).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as Project
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(PROJECTS).add({
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(PROJECTS).doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function deleteProject(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(PROJECTS).doc(id).remove()
}
