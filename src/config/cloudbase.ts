import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-guangzhou'
const accessKey = import.meta.env.VITE_CLOUDBASE_ACCESS_KEY

export const isCloudBaseConfigured = !!(envId && accessKey)

let app: ReturnType<typeof cloudbase.init> | null = null

if (isCloudBaseConfigured) {
  app = cloudbase.init({
    env: envId,
    region,
    accessKey,
  })
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
