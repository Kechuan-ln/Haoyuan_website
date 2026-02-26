import { requireDb } from '@/config/cloudbase'
import type { Notification } from '@/types/notification'

const NOTIFICATIONS = 'notifications'
const USERS = 'users'

export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(NOTIFICATIONS).add({
    ...data,
    isRead: false,
    createdAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function notifyManagers(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'toUserId'>,
): Promise<void> {
  const db = requireDb()
  const managersResult = await db.collection(USERS)
    .where({ role: 'admin', adminLevel: 'manager' })
    .get()

  const managers = managersResult.data || []
  const promises = managers.map((m: any) =>
    db.collection(NOTIFICATIONS).add({
      ...data,
      toUserId: m._id,
      isRead: false,
      createdAt: new Date(),
    }),
  )
  await Promise.all(promises)
}

export async function getMyNotifications(
  userId: string,
  limitCount?: number,
): Promise<Notification[]> {
  const db = requireDb()
  let ref = db.collection(NOTIFICATIONS)
    .where({ toUserId: userId })
    .orderBy('createdAt', 'desc')

  if (limitCount) {
    ref = ref.limit(limitCount)
  }

  const result = await ref.get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Notification,
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(NOTIFICATIONS).doc(id).update({ isRead: true })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = requireDb()
  await db.collection(NOTIFICATIONS)
    .where({ toUserId: userId, isRead: false })
    .update({ isRead: true })
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = requireDb()
  const result = await db.collection(NOTIFICATIONS)
    .where({ toUserId: userId, isRead: false })
    .count()
  return result.total
}

export async function notifyAccountStatus(
  toUserId: string,
  approved: boolean,
  fromUserId: string,
  fromUserName: string,
): Promise<string> {
  return createNotification({
    type: approved ? 'account_approved' : 'account_rejected',
    contentTitle: approved ? '账号审批通过' : '账号审批未通过',
    message: approved
      ? '您的管理员账号已通过审批，现在可以登录系统。'
      : '您的管理员账号申请未通过，如有疑问请联系管理员。',
    fromUserId,
    fromUserName,
    toUserId,
  })
}
