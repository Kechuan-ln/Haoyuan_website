import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { DocumentSnapshot, UpdateData } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Article, ArticleCategory } from '@/types/article'

const ARTICLES = 'articles'

export interface ArticleFilters {
  category?: ArticleCategory
  isPublished?: boolean
  pageSize?: number
  lastDoc?: DocumentSnapshot
}

export interface PaginatedArticles {
  articles: Article[]
  lastDoc: DocumentSnapshot | null
}

export async function getArticles(
  filters?: ArticleFilters,
): Promise<PaginatedArticles> {
  const constraints = []

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category))
  }
  if (filters?.isPublished !== undefined) {
    constraints.push(where('isPublished', '==', filters.isPublished))
  }

  constraints.push(orderBy('publishedAt', 'desc'))

  const pageSize = filters?.pageSize ?? 10
  constraints.push(limit(pageSize))

  if (filters?.lastDoc) {
    constraints.push(startAfter(filters.lastDoc))
  }

  const q = query(collection(db, ARTICLES), ...constraints)
  const snap = await getDocs(q)

  const articles = snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Article,
  )
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null

  return { articles, lastDoc }
}

export async function getArticle(id: string): Promise<Article | null> {
  const snap = await getDoc(doc(db, ARTICLES, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Article
}

export async function createArticle(
  data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, ARTICLES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, ARTICLES, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as UpdateData<Article>)
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, ARTICLES, id))
}
