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
  createdAt: Date
  updatedAt: Date
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
