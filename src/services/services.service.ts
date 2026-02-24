import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'
import type { UpdateData } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { Service } from '@/types/service'
import type { ContentStatus } from '@/types/content-status'

const SERVICES = 'services'

export interface ServiceFilters {
  isPublished?: boolean
  status?: ContentStatus
}

export async function getServices(filters?: ServiceFilters): Promise<Service[]> {
  const db = requireDb()
  const constraints = []
  if (filters?.isPublished !== undefined) {
    constraints.push(where('isPublished', '==', filters.isPublished))
  }
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status))
  }
  constraints.push(orderBy('sortOrder', 'asc'))
  const q = query(collection(db, SERVICES), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service)
}

export async function getService(id: string): Promise<Service | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, SERVICES, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Service
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, SERVICES), {
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateService(
  id: string,
  data: Partial<Omit<Service, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, SERVICES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<Service>)
}

export async function deleteService(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, SERVICES, id))
}
