import {
  addDoc,
  collection,
  getDocs,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { ContactMessage } from '@/types/contact'

const CONTACTS = 'contacts'

export async function submitContact(
  data: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>,
): Promise<string> {
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

export async function markAsRead(id: string): Promise<void> {
  await updateDoc(doc(db, CONTACTS, id), {
    isRead: true,
  })
}
