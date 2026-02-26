import { requireDb } from '@/config/cloudbase'
import type { Bid, BidStatus, BidSubmission, SubmissionStatus } from '@/types/bid'

const BIDS = 'bids'
const SUBMISSIONS = 'bidSubmissions'

export interface BidFilters {
  status?: BidStatus
  statusIn?: BidStatus[]
}

export async function getBids(filters?: BidFilters): Promise<Bid[]> {
  const db = requireDb()
  const _ = db.command

  const whereCondition: Record<string, unknown> = {}
  if (filters?.statusIn && filters.statusIn.length > 0) {
    whereCondition.status = _.in(filters.statusIn)
  } else if (filters?.status) {
    whereCondition.status = filters.status
  }

  const result = await db.collection(BIDS).where(whereCondition).get()
  return (result.data || []).map((doc: any) => ({ id: doc._id, ...doc }) as Bid)
}

export async function getBid(id: string): Promise<Bid | null> {
  const db = requireDb()
  const result = await db.collection(BIDS).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as Bid
}

export async function createBid(
  data: Omit<Bid, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(BIDS).add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function updateBid(
  id: string,
  data: Partial<Omit<Bid, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(BIDS).doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function updateBidStatus(
  id: string,
  status: BidStatus,
): Promise<void> {
  const db = requireDb()
  await db.collection(BIDS).doc(id).update({
    status,
    updatedAt: new Date(),
  })
}

export async function getSubmissionsForBid(
  bidId: string,
): Promise<BidSubmission[]> {
  const db = requireDb()
  const result = await db.collection(SUBMISSIONS)
    .where({ bidId })
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as BidSubmission,
  )
}

export async function getMySubmissions(
  vendorId: string,
): Promise<BidSubmission[]> {
  const db = requireDb()
  const result = await db.collection(SUBMISSIONS)
    .where({ vendorId })
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as BidSubmission,
  )
}

export async function submitBid(
  data: Omit<BidSubmission, 'id' | 'createdAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(SUBMISSIONS).add({
    ...data,
    createdAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function deleteBid(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(BIDS).doc(id).remove()
}

export async function getSubmission(
  id: string,
): Promise<BidSubmission | null> {
  const db = requireDb()
  const result = await db.collection(SUBMISSIONS).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as BidSubmission
}

export async function updateSubmission(
  id: string,
  data: Partial<Omit<BidSubmission, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(SUBMISSIONS).doc(id).update({
    ...data,
  })
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<void> {
  const db = requireDb()
  await db.collection(SUBMISSIONS).doc(id).update({ status })
}
