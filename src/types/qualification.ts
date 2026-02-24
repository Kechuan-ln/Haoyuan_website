import type { Timestamp } from 'firebase/firestore'

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
}
