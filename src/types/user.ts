export type UserRole = 'vendor' | 'admin' | 'reviewer'

export type AdminLevel = 'manager' | 'worker'

export type VendorStatus = 'pending' | 'approved' | 'rejected'

export type AccountStatus = 'active' | 'pending_approval' | 'suspended'

export interface AdminApplication {
  realName: string
  position: string
  reason: string
  appliedAt: Date
}

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
  accountStatus?: AccountStatus
  adminApplication?: AdminApplication
  companyName?: string
  registrationReason?: string
  createdAt: Date
  updatedAt: Date
}
