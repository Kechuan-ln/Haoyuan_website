import type { Timestamp } from 'firebase/firestore'
import type { ContentStatus } from './content-status'

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  description: string
  scope: string
  client: string
  location: string
  coverImageUrl: string
  galleryImageUrls: string[]
  serviceType: string
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
