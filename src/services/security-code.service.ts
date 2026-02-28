import { requireDb, ensureAuth } from '@/config/cloudbase'

const COLLECTION = 'settings'
const DOC_ID = 'security'

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function validateInviteCode(code: string): Promise<boolean> {
  await ensureAuth()
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  // CloudBase 错误通过 result.code 返回
  if (typeof (result as unknown as { code: string }).code === 'string') {
    console.error('[validateInviteCode] 数据库查询失败:', result)
    return false
  }
  if (!result.data || result.data.length === 0) return false
  return result.data[0].managerInviteCode === code
}

export async function getManagerInviteCode(): Promise<{ code: string; updatedAt: unknown } | null> {
  const db = requireDb()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (typeof (result as unknown as { code: string }).code === 'string') {
    console.error('[getManagerInviteCode] 数据库查询失败:', result)
    return null
  }
  if (!result.data || result.data.length === 0) return null
  const data = result.data[0]
  return { code: data.managerInviteCode ?? '', updatedAt: data.updatedAt }
}

export async function regenerateInviteCode(): Promise<string> {
  const db = requireDb()
  const newCode = generateCode()
  const result = await db.collection(COLLECTION).doc(DOC_ID).get()
  if (!result.data || result.data.length === 0) {
    await db.collection(COLLECTION).doc(DOC_ID).set({
      managerInviteCode: newCode,
      updatedAt: new Date(),
    })
  } else {
    await db.collection(COLLECTION).doc(DOC_ID).update({
      managerInviteCode: newCode,
      updatedAt: new Date(),
    })
  }
  return newCode
}
