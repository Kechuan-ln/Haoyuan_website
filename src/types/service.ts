import type { Timestamp } from 'firebase/firestore'

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
}
