import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import type { UpdateData } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { AppUser, VendorStatus } from '@/types/user'

const USERS = 'users'

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, USERS, uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as AppUser
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<AppUser, 'uid' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<AppUser>)
}

export async function listVendors(status?: VendorStatus): Promise<AppUser[]> {
  const constraints = [where('role', '==', 'vendor')]
  if (status) {
    constraints.push(where('vendorProfile.status', '==', status))
  }
  const q = query(collection(db, USERS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as AppUser)
}

export async function approveVendor(uid: string): Promise<void> {
  await updateDoc(doc(db, USERS, uid), {
    'vendorProfile.status': 'approved',
    updatedAt: serverTimestamp(),
  })
}

export async function rejectVendor(uid: string): Promise<void> {
  await updateDoc(doc(db, USERS, uid), {
    'vendorProfile.status': 'rejected',
    updatedAt: serverTimestamp(),
  })
}
