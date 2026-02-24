import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import { CONTENT_TYPES } from '@/config/constants'

export async function submitForReview(
  collectionName: string,
  id: string,
  submitterId: string,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, collectionName, id), {
    status: 'pending_review',
    isPublished: false,
    submittedBy: submitterId,
    submittedAt: serverTimestamp(),
  })
}

export async function approveContent(
  collectionName: string,
  id: string,
  reviewerId: string,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, collectionName, id), {
    status: 'published',
    isPublished: true,
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
  })
}

export async function rejectContent(
  collectionName: string,
  id: string,
  reviewerId: string,
  reason: string,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, collectionName, id), {
    status: 'rejected',
    isPublished: false,
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
    rejectionReason: reason,
  })
}

export async function publishDirectly(
  collectionName: string,
  id: string,
  publisherId: string,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, collectionName, id), {
    status: 'published',
    isPublished: true,
    reviewedBy: publisherId,
    reviewedAt: serverTimestamp(),
  })
}

export async function unpublishContent(
  collectionName: string,
  id: string,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, collectionName, id), {
    status: 'draft',
    isPublished: false,
  })
}

export async function getPendingReviewItems<T>(
  collectionName: string,
): Promise<(T & { id: string })[]> {
  const db = requireDb()
  const q = query(
    collection(db, collectionName),
    where('status', '==', 'pending_review'),
    orderBy('submittedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string })
}

export async function getPendingReviewCount(): Promise<number> {
  const db = requireDb()
  let total = 0

  for (const ct of CONTENT_TYPES) {
    const q = query(
      collection(db, ct.collection),
      where('status', '==', 'pending_review'),
    )
    const snap = await getDocs(q)
    total += snap.size
  }

  return total
}
