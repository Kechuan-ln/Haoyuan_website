import { requireDb } from '@/config/cloudbase'
import type { Article, ArticleCategory } from '@/types/article'
import type { ContentStatus } from '@/types/content-status'

const ARTICLES = 'articles'

export interface ArticleFilters {
  category?: ArticleCategory
  isPublished?: boolean
  status?: ContentStatus
  pageSize?: number
  offset?: number
}

export interface PaginatedArticles {
  articles: Article[]
  hasMore: boolean
}

export async function getArticles(
  filters?: ArticleFilters,
): Promise<PaginatedArticles> {
  const db = requireDb()

  const whereCondition: Record<string, unknown> = {}
  if (filters?.category) {
    whereCondition.category = filters.category
  }
  if (filters?.isPublished !== undefined) {
    whereCondition.isPublished = filters.isPublished
  }
  if (filters?.status) {
    whereCondition.status = filters.status
  }

  const pageSize = filters?.pageSize ?? 10
  const offset = filters?.offset ?? 0

  let ref = db.collection(ARTICLES)
    .where(whereCondition)
    .orderBy('publishedAt', 'desc')
    .skip(offset)
    .limit(pageSize + 1)

  const result = await ref.get()
  const data = result.data || []

  const hasMore = data.length > pageSize
  const articles = (hasMore ? data.slice(0, pageSize) : data).map(
    (doc: any) => ({ id: doc._id, ...doc }) as Article,
  )

  return { articles, hasMore }
}

export async function getArticle(id: string): Promise<Article | null> {
  const db = requireDb()
  const result = await db.collection(ARTICLES).doc(id).get()
  if (!result.data || result.data.length === 0) return null
  const doc = result.data[0]
  return { id: doc._id, ...doc } as Article
}

export async function createArticle(
  data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const db = requireDb()
  const result = await db.collection(ARTICLES).add({
    ...data,
    status: 'draft' as ContentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as { id: string }
  return result.id
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = requireDb()
  await db.collection(ARTICLES).doc(id).update({
    ...data,
    updatedAt: new Date(),
  })
}

export async function deleteArticle(id: string): Promise<void> {
  const db = requireDb()
  await db.collection(ARTICLES).doc(id).remove()
}
