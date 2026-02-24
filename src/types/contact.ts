import type { Timestamp } from 'firebase/firestore'

export interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  company: string
  subject: string
  message: string
  isRead: boolean
  createdAt: Timestamp
}

export interface SiteSettings {
  heroSlides: HeroSlide[]
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  companyDescription: string
  workingHours?: string
  siteTitle: string
  siteDescription: string
  siteKeywords: string
}

export interface HeroSlide {
  imageUrl: string
  title: string
  subtitle: string
  linkUrl?: string
}
