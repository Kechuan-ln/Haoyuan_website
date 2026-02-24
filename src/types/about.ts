import type { Timestamp } from 'firebase/firestore'

export interface CoreValue {
  title: string
  iconName: string
  colorTheme: 'navy' | 'gold' | 'teal'
  description: string
}

export interface ThreePromise {
  title: string
  iconName: string
  description: string
  highlights: string[]
}

export interface Milestone {
  year: string
  event: string
}

export interface AboutContent {
  coreValues: CoreValue[]
  threePromises: ThreePromise[]
  milestones: Milestone[]
  updatedAt?: Timestamp
}
