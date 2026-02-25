import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'

const SECURITY_DOC = 'settings/security'

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function validateInviteCode(code: string): Promise<boolean> {
  const db = requireDb()
  const snap = await getDoc(doc(db, SECURITY_DOC))
  if (!snap.exists()) return false
  return snap.data().managerInviteCode === code
}

export async function getManagerInviteCode(): Promise<{ code: string; updatedAt: unknown } | null> {
  const db = requireDb()
  const snap = await getDoc(doc(db, SECURITY_DOC))
  if (!snap.exists()) return null
  const data = snap.data()
  return { code: data.managerInviteCode ?? '', updatedAt: data.updatedAt }
}

export async function regenerateInviteCode(): Promise<string> {
  const db = requireDb()
  const newCode = generateCode()
  await setDoc(doc(db, SECURITY_DOC), {
    managerInviteCode: newCode,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return newCode
}
