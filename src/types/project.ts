import type { Timestamp } from 'firebase/firestore'

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
}
