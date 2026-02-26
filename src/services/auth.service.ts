import { requireAuth, requireDb } from '@/config/cloudbase'
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

/**
 * Step 1 of registration: calls signUp and returns the verifyOtp function.
 * Caller must then collect OTP from user and call verifyOtp.
 */
export async function signUpStep1(options: SignUpOptions) {
  const auth = requireAuth()

  const { data, error } = await auth.signUp({
    email: options.email,
    password: options.password,
    name: options.displayName,
    phone_number: options.phone,
  })

  if (error) throw error
  if (!data.verifyOtp) throw new Error('注册失败：未返回验证函数')

  return { verifyOtp: data.verifyOtp, options }
}

/**
 * Step 2 of registration: verify OTP and write user document.
 */
export async function signUpStep2(
  verifyOtp: (params: { token: string }) => Promise<{ data: { user?: { id: string }; session?: unknown }; error: unknown }>,
  otpCode: string,
  options: SignUpOptions,
) {
  const db = requireDb()

  const { data: loginData, error: verifyError } = await verifyOtp({ token: otpCode })
  if (verifyError) throw verifyError

  const userId = loginData?.user?.id
  if (!userId) throw new Error('注册验证失败：未获取到用户ID')

  const userData: Record<string, unknown> = {
    uid: userId,
    email: options.email,
    displayName: options.displayName,
    phone: options.phone,
    role: options.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  if (options.role === 'admin') {
    userData.adminLevel = options.adminLevel ?? 'worker'
    userData.accountStatus = 'pending_approval'

    if (options.adminApplication) {
      userData.adminApplication = {
        ...options.adminApplication,
        appliedAt: new Date(),
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
    await db.collection('users').doc(userId).set(userData)
  } catch (err) {
    // Try to clean up: delete the auth user if DB write fails
    try {
      const auth = requireAuth()
      await auth.deleteUser({ password: options.password })
    } catch { /* ignore cleanup errors */ }
    throw err
  }

  return { userId }
}

export async function signIn(email: string, password: string) {
  const auth = requireAuth()
  const { data, error } = await auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const auth = requireAuth()
  await auth.signOut()
}

export async function resetPassword(email: string) {
  const auth = requireAuth()
  const { data, error } = await auth.resetPasswordForEmail(email)
  if (error) throw error
  return data
}
