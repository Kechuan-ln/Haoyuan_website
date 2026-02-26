import { requireDb } from '@/config/cloudbase'
import type { ContactMessage } from '@/types/contact'

const CONTACTS = 'contacts'

export async function submitContact(
  data: Omit<ContactMessage, 'id' | 'isRead' | 'createdAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(CONTACTS).add({
    ...data,
    isRead: false,
    createdAt: new Date(),
  })
  return (result as any).id as string
}

export async function getContacts(
  isRead?: boolean,
): Promise<ContactMessage[]> {
  const db = requireDb()
  const coll = db.collection(CONTACTS)
  // where() must come before orderBy() per CloudBase SDK types
  const ref = isRead !== undefined
    ? coll.where({ isRead }).orderBy('createdAt', 'desc')
    : coll.orderBy('createdAt', 'desc')
  const result = await ref.get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as ContactMessage,
  )
}

export async function getLatestContacts(count = 3): Promise<ContactMessage[]> {
  const db = requireDb()
  const result = await db
    .collection(CONTACTS)
    .orderBy('createdAt', 'desc')
    .limit(count)
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as ContactMessage,
  )
}

export async function markAsRead(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(CONTACTS).doc(id).update({
    isRead: true,
  })
}

export async function deleteContact(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(CONTACTS).doc(id).remove()
}
