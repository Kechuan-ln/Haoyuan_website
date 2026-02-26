import { requireDb } from '@/config/cloudbase'
import type { Evaluation } from '@/types/bid'

const EVALUATIONS = 'evaluations'

export async function getEvaluationsForBid(
  bidId: string,
): Promise<Evaluation[]> {
  const db = requireDb()
  const result = await db
    .collection(EVALUATIONS)
    .where({ bidId })
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Evaluation,
  )
}

export async function getEvaluationsForSubmission(
  submissionId: string,
): Promise<Evaluation[]> {
  const db = requireDb()
  const result = await db
    .collection(EVALUATIONS)
    .where({ submissionId })
    .get()
  return (result.data || []).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Evaluation,
  )
}

export async function getEvaluation(
  id: string,
): Promise<Evaluation | null> {
  const db = requireDb()
  const result = await db.collection(EVALUATIONS).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as Evaluation
}

export async function createEvaluation(
  data: Omit<Evaluation, 'id' | 'evaluatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(EVALUATIONS).add({
    ...data,
    evaluatedAt: new Date(),
  })
  return (result as any).id as string
}

export async function updateEvaluation(
  id: string,
  data: Partial<Omit<Evaluation, 'id'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(EVALUATIONS).doc(id).update({
    ...data,
  })
}

export async function deleteEvaluation(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(EVALUATIONS).doc(id).remove()
}
