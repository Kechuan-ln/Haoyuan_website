import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai'
const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY

export const isCloudBaseConfigured = !!(envId && accessKey)

let app: ReturnType<typeof cloudbase.init> | null = null

if (isCloudBaseConfigured) {
  // auth.detectSessionInUrl 在 @cloudbase/types 中定义但 SDK 类型未导出
  app = cloudbase.init({
    env: envId,
    region,
    accessKey,
    auth: { detectSessionInUrl: true },
  } as Parameters<typeof cloudbase.init>[0])
} else {
  console.warn(
    '[CloudBase] 未配置 CloudBase 环境变量，认证和数据库功能将不可用。' +
    '请复制 .env.example 为 .env 并填写 CloudBase 配置。'
  )
}

export { app }

export function requireApp() {
  if (!app) throw new Error('CloudBase 未配置，请在 .env 文件中填写 CloudBase 配置信息')
  return app
}

export function requireAuth() {
  return requireApp().auth
}

export function requireDb() {
  return requireApp().database()
}

/**
 * 确保有活跃的 auth session（未登录时自动匿名登录）。
 * 用于注册页等未登录场景下访问数据库。
 */
export async function ensureAuth() {
  const auth = requireAuth()
  const { data, error } = await auth.getSession()
  if (error || !data.session) {
    const result = await auth.signInAnonymously()
    if (result.error) {
      console.error('[CloudBase] 匿名登录失败:', result.error)
      throw new Error('无法建立数据库连接，请刷新页面重试')
    }
  }
}
