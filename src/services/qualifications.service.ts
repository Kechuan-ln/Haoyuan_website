import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { Qualification } from '@/types/qualification'
import type { ContentStatus } from '@/types/content-status'

const QUALIFICATIONS = 'qualifications'

export async function getQualifications(opts?: {
  isPublished?: boolean
  status?: ContentStatus
}): Promise<Qualification[]> {
  const db = requireDb()
  const constraints = []
  if (opts?.isPublished !== undefined) {
    constraints.push(where('isPublished', '==', opts.isPublished))
  }
  if (opts?.status) {
    constraints.push(where('status', '==', opts.status))
  }
  constraints.push(orderBy('sortOrder', 'asc'))
  const q = query(collection(db, QUALIFICATIONS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Qualification)
}

export async function createQualification(
  data: Omit<Qualification, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, QUALIFICATIONS), {
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateQualification(
  id: string,
  data: Partial<Omit<Qualification, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, QUALIFICATIONS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteQualification(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, QUALIFICATIONS, id))
}
