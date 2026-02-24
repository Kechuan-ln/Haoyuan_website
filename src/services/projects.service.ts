import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { UpdateData } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { Project } from '@/types/project'

const PROJECTS = 'projects'

export interface ProjectFilters {
  category?: string
  isPublished?: boolean
}

export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  const db = requireDb()
  const constraints = []
  if (filters?.category) {
    constraints.push(where('category', '==', filters.category))
  }
  if (filters?.isPublished !== undefined) {
    constraints.push(where('isPublished', '==', filters.isPublished))
  }
  const q = query(collection(db, PROJECTS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project)
}

export async function getLatestProjects(count = 3): Promise<Project[]> {
  const db = requireDb()
  const q = query(
    collection(db, PROJECTS),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project)
}

export async function getProject(id: string): Promise<Project | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, PROJECTS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Project
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, PROJECTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, PROJECTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<Project>)
}

export async function deleteProject(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, PROJECTS, id))
}
