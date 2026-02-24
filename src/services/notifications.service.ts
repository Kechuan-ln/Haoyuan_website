import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { QueryConstraint } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { Notification } from '@/types/notification'

const NOTIFICATIONS = 'notifications'
const USERS = 'users'

export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, NOTIFICATIONS), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function notifyManagers(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'toUserId'>,
): Promise<void> {
  const db = requireDb()
  const managersQuery = query(
    collection(db, USERS),
    where('role', '==', 'admin'),
    where('adminLevel', '==', 'manager'),
  )
  const snap = await getDocs(managersQuery)

  const promises = snap.docs.map((d) =>
    addDoc(collection(db, NOTIFICATIONS), {
      ...data,
      toUserId: d.id,
      isRead: false,
      createdAt: serverTimestamp(),
    }),
  )
  await Promise.all(promises)
}

export async function getMyNotifications(
  userId: string,
  limitCount?: number,
): Promise<Notification[]> {
  const db = requireDb()
  const constraints: QueryConstraint[] = [
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]
  if (limitCount) {
    constraints.push(limit(limitCount))
  }
  const q = query(collection(db, NOTIFICATIONS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification)
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, NOTIFICATIONS, id), { isRead: true })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = requireDb()
  const q = query(
    collection(db, NOTIFICATIONS),
    where('toUserId', '==', userId),
    where('isRead', '==', false),
  )
  const snap = await getDocs(q)

  const batch = writeBatch(db)
  snap.docs.forEach((d) => {
    batch.update(d.ref, { isRead: true })
  })
  await batch.commit()
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = requireDb()
  const q = query(
    collection(db, NOTIFICATIONS),
    where('toUserId', '==', userId),
    where('isRead', '==', false),
  )
  const snap = await getDocs(q)
  return snap.size
}
