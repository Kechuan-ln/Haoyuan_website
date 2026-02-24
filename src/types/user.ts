import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'vendor' | 'admin' | 'reviewer'

export type AdminLevel = 'manager' | 'worker'

export type VendorStatus = 'pending' | 'approved' | 'rejected'

export interface VendorProfile {
  companyName: string
  creditCode: string
  legalPerson: string
  licenseUrl: string
  status: VendorStatus
}

export interface AppUser {
  uid: string
  email: string
  displayName: string
  phone: string
  role: UserRole
  adminLevel?: AdminLevel
  vendorProfile?: VendorProfile
  createdAt: Timestamp
  updatedAt: Timestamp
}
