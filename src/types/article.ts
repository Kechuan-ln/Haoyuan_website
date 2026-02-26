import type { ContentStatus } from './content-status'

export type ArticleCategory = 'news' | 'announcement' | 'industry' | 'company'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImageUrl: string
  category: ArticleCategory
  authorId: string
  authorName: string
  isPublished: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
  status?: ContentStatus
  submittedBy?: string
  submittedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
