import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Check if Firebase is configured (at least apiKey and projectId must be present)
export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  console.warn(
    '[Firebase] 未配置 Firebase 环境变量，认证和数据库功能将不可用。' +
    '请复制 .env.example 为 .env 并填写 Firebase 配置。'
  )
}

export { auth, db, storage }
export default app

/**
 * Returns Firestore instance, throwing if Firebase is not configured.
 * Use this in service files that require database access.
 */
export function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firebase 数据库未配置，请在 .env 文件中填写 Firebase 配置信息')
  }
  return db
}

/**
 * Returns Auth instance, throwing if Firebase is not configured.
 * Use this in service files that require auth access.
 */
export function requireAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase 认证未配置，请在 .env 文件中填写 Firebase 配置信息')
  }
  return auth
}

/**
 * Returns Storage instance, throwing if Firebase is not configured.
 * Use this in service files that require storage access.
 */
export function requireStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error('Firebase 存储未配置，请在 .env 文件中填写 Firebase 配置信息')
  }
  return storage
}
