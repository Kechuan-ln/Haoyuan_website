import { requireDb } from '@/config/cloudbase'
import { CONTENT_TYPES } from '@/config/constants'

export async function submitForReview(
  collectionName: string,
  id: string,
  submitterId: string,
): Promise<void> {
  const db = requireDb()
  await db.collection(collectionName).doc(id).update({
    status: 'pending_review',
    isPublished: false,
    submittedBy: submitterId,
    submittedAt: new Date(),
  })
}

export async function approveContent(
  collectionName: string,
  id: string,
  reviewerId: string,
): Promise<void> {
  const db = requireDb()
  await db.collection(collectionName).doc(id).update({
    status: 'published',
    isPublished: true,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  })
}

export async function rejectContent(
  collectionName: string,
  id: string,
  reviewerId: string,
  reason: string,
): Promise<void> {
  const db = requireDb()
  await db.collection(collectionName).doc(id).update({
    status: 'rejected',
    isPublished: false,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    rejectionReason: reason,
  })
}

export async function publishDirectly(
  collectionName: string,
  id: string,
  publisherId: string,
): Promise<void> {
  const db = requireDb()
  await db.collection(collectionName).doc(id).update({
    status: 'published',
    isPublished: true,
    reviewedBy: publisherId,
    reviewedAt: new Date(),
  })
}

export async function unpublishContent(
  collectionName: string,
  id: string,
): Promise<void> {
  const db = requireDb()
  await db.collection(collectionName).doc(id).update({
    status: 'draft',
    isPublished: false,
  })
}

export async function getPendingReviewItems<T>(
  collectionName: string,
): Promise<(T & { id: string })[]> {
  const db = requireDb()
  const result = await db.collection(collectionName)
    .where({ status: 'pending_review' })
    .orderBy('submittedAt', 'desc')
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as T & { id: string },
  )
}

export async function getPendingReviewCount(): Promise<number> {
  const db = requireDb()
  let total = 0

  for (const ct of CONTENT_TYPES) {
    const result = await db.collection(ct.collection)
      .where({ status: 'pending_review' })
      .count()
    total += result.total
  }

  return total
}
