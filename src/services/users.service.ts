import { requireDb } from '@/config/cloudbase'
import type { AccountStatus, AdminLevel, AppUser, VendorStatus } from '@/types/user'

const USERS = 'users'

export async function getUser(uid: string): Promise<AppUser | null> {
  const db = requireDb()
  const result = await db.collection(USERS).doc(uid).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { uid: doc._id, ...doc } as AppUser
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<AppUser, 'uid' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(USERS).doc(uid).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function listVendors(status?: VendorStatus): Promise<AppUser[]> {
  const db = requireDb()
  const whereCondition: Record<string, unknown> = { role: 'vendor' }
  if (status) {
    whereCondition['vendorProfile.status'] = status
  }
  const result = await db.collection(USERS).where(whereCondition).get()
  return (result.data || []).map(
    (doc: any) => ({ uid: doc._id, ...doc }) as AppUser,
  )
}

export async function approveVendor(uid: string): Promise<void> {
  const db = requireDb()
  await db.collection(USERS).doc(uid).update({
    'vendorProfile.status': 'approved',
    updatedAt: new Date(),
  })
}

export async function rejectVendor(uid: string): Promise<void> {
  const db = requireDb()
  await db.collection(USERS).doc(uid).update({
    'vendorProfile.status': 'rejected',
    updatedAt: new Date(),
  })
}

export async function updateUserAdminLevel(uid: string, adminLevel: AdminLevel): Promise<void> {
  const db = requireDb()
  await db.collection(USERS).doc(uid).update({ adminLevel, updatedAt: new Date() })
}

export async function listUsers(role?: string): Promise<AppUser[]> {
  const db = requireDb()
  const whereCondition: Record<string, unknown> = {}
  if (role) {
    whereCondition.role = role
  }
  const result = await db.collection(USERS)
    .where(whereCondition)
    .orderBy('createdAt', 'desc')
    .get()
  return (result.data || []).map(
    (doc: any) => ({ uid: doc._id, ...doc }) as AppUser,
  )
}

export async function listPendingAdminApplications(): Promise<AppUser[]> {
  const db = requireDb()
  const result = await db.collection(USERS)
    .where({ role: 'admin', accountStatus: 'pending_approval' })
    .orderBy('createdAt', 'desc')
    .get()
  return (result.data || []).map(
    (doc: any) => ({ uid: doc._id, ...doc }) as AppUser,
  )
}

export async function updateAccountStatus(uid: string, status: AccountStatus): Promise<void> {
  const db = requireDb()
  await db.collection(USERS).doc(uid).update({
    accountStatus: status,
    updatedAt: new Date(),
  })
}
