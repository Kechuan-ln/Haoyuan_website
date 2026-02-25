import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { requireAuth, requireDb } from '@/config/firebase'
import type { AdminLevel, UserRole } from '@/types/user'

export interface SignUpOptions {
  email: string
  password: string
  displayName: string
  phone: string
  role: UserRole
  companyName?: string
  registrationReason?: string
  adminLevel?: AdminLevel
  adminApplication?: { realName: string; position: string; reason: string }
  inviteCode?: string
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

export async function signUp(options: SignUpOptions) {
  const auth = requireAuth()
  const db = requireDb()

  const credential = await createUserWithEmailAndPassword(auth, options.email, options.password)

  await updateProfile(credential.user, { displayName: options.displayName })

  const userData: Record<string, unknown> = {
    uid: credential.user.uid,
    email: options.email,
    displayName: options.displayName,
    phone: options.phone,
    role: options.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (options.role === 'admin') {
    userData.adminLevel = options.adminLevel ?? 'worker'
    userData.accountStatus = 'pending_approval'

    if (options.adminApplication) {
      userData.adminApplication = {
        ...options.adminApplication,
        appliedAt: serverTimestamp(),
      }
    }

    if (options.adminLevel === 'manager' && options.inviteCode) {
      userData._inviteCode = options.inviteCode
    }
  } else if (options.role === 'vendor') {
    userData.accountStatus = 'active'
    if (options.companyName) {
      userData.companyName = options.companyName
    }
    if (options.registrationReason) {
      userData.registrationReason = options.registrationReason
    }
  }

  try {
    await setDoc(doc(db, 'users', credential.user.uid), userData)
  } catch (err) {
    // Clean up orphaned auth user if Firestore write fails
    await deleteUser(credential.user).catch(() => {})
    throw err
  }

  return credential
}

export async function signOut() {
  return firebaseSignOut(requireAuth())
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(requireAuth(), email)
}
