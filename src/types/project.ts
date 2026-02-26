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
  createdAt: Date
  updatedAt: Date
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
