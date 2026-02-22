import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { requireAuth, requireDb } from '@/config/firebase'
import type { UserRole } from '@/types/user'

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  phone: string,
  role: UserRole = 'vendor',
) {
  const auth = requireAuth()
  const db = requireDb()

  const credential = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(credential.user, { displayName })

  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName,
    phone,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return credential
}

export async function signOut() {
  return firebaseSignOut(requireAuth())
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(requireAuth(), email)
}
