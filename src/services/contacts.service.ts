import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  doc,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { ContactMessage } from '@/types/contact'

const CONTACTS = 'contacts'

export async function submitContact(
  data: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, CONTACTS), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getContacts(
  isRead?: boolean,
): Promise<ContactMessage[]> {
  const db = requireDb()
  const constraints = []
  if (isRead !== undefined) {
    constraints.push(where('isRead', '==', isRead))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  const q = query(collection(db, CONTACTS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ContactMessage,
  )
}

export async function getLatestContacts(count = 3): Promise<ContactMessage[]> {
  const db = requireDb()
  const q = query(
    collection(db, CONTACTS),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactMessage)
}

export async function markAsRead(id: string): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, CONTACTS, id), {
    isRead: true,
  })
}

export async function deleteContact(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, CONTACTS, id))
}
