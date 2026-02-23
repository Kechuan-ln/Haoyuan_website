import {
  addDoc,
  collection,
  deleteDoc,
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
import type { Evaluation } from '@/types/bid'

const EVALUATIONS = 'evaluations'

export async function getEvaluationsForBid(
  bidId: string,
): Promise<Evaluation[]> {
  const db = requireDb()
  const q = query(collection(db, EVALUATIONS), where('bidId', '==', bidId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evaluation)
}

export async function getEvaluationsForSubmission(
  submissionId: string,
): Promise<Evaluation[]> {
  const db = requireDb()
  const q = query(
    collection(db, EVALUATIONS),
    where('submissionId', '==', submissionId),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evaluation)
}

export async function getEvaluation(
  id: string,
): Promise<Evaluation | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, EVALUATIONS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Evaluation
}

export async function createEvaluation(
  data: Omit<Evaluation, 'id' | 'evaluatedAt'>,
): Promise<string> {
  const db = requireDb()
  const ref = await addDoc(collection(db, EVALUATIONS), {
    ...data,
    evaluatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateEvaluation(
  id: string,
  data: Partial<Omit<Evaluation, 'id'>>,
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, EVALUATIONS, id), {
    ...data,
  } as UpdateData<Evaluation>)
}

export async function deleteEvaluation(id: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, EVALUATIONS, id))
}
