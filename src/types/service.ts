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
  createdAt: Date
  updatedAt: Date
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
