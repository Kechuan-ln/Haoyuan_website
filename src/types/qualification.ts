import type { Timestamp } from 'firebase/firestore'
import type { ContentStatus } from './content-status'

export interface Qualification {
  id: string
  title: string
  issuer: string
  description: string
  iconName: string
  colorTheme: 'navy' | 'teal' | 'gold'
  coverImageUrl?: string
  sortOrder: number
  isPublished: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Timestamp
  reviewedBy?: string
  reviewedAt?: Timestamp
  rejectionReason?: string
}
