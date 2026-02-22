import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { UpdateData } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
import type { Bid, BidStatus, BidSubmission } from '@/types/bid'

const BIDS = 'bids'
const SUBMISSIONS = 'bidSubmissions'

export interface BidFilters {
  status?: BidStatus
}

export async function getBids(filters?: BidFilters): Promise<Bid[]> {
  const db = requireDb()
  const constraints = []
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status))
  }
  const q = query(collection(db, BIDS), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Bid)
}

export async function getBid(id: string): Promise<Bid | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, BIDS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Bid
}

export async function createBid(
  data: Omit<Bid, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, BIDS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBid(
  id: string,
  data: Partial<Omit<Bid, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, BIDS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<Bid>)
}

export async function updateBidStatus(
  id: string,
  status: BidStatus,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, BIDS, id), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function getSubmissionsForBid(
  bidId: string,
): Promise<BidSubmission[]> {
  const db = requireDb()
  const q = query(collection(db, SUBMISSIONS), where('bidId', '==', bidId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BidSubmission)
}

export async function getMySubmissions(
  vendorId: string,
): Promise<BidSubmission[]> {
  const db = requireDb()
  const q = query(
    collection(db, SUBMISSIONS),
    where('vendorId', '==', vendorId),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BidSubmission)
}

export async function submitBid(
  data: Omit<BidSubmission, 'id' | 'createdAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, SUBMISSIONS), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
