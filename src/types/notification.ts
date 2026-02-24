import type { Timestamp } from 'firebase/firestore'
import type { ContentType } from './content-status'

export type NotificationType = 'review_request' | 'approved' | 'rejected'

export interface Notification {
  id: string
  type: NotificationType
  contentType: ContentType
  contentId: string
  contentTitle: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  message: string
  isRead: boolean
  createdAt: Timestamp
}
