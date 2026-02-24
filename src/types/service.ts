import type { Timestamp } from 'firebase/firestore'
import type { ContentStatus } from './content-status'

export interface Service {
  id: string
  title: string
  iconName: string
  description: string
  keyPoints: string[]
  detailDescription: string
  scopeItems: string[]
  relatedProjects: string[]
  isPublished: boolean
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Timestamp
  reviewedBy?: string
  reviewedAt?: Timestamp
  rejectionReason?: string
}
