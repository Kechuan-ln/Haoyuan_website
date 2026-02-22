import type { Timestamp } from 'firebase/firestore'

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
  publishedAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
