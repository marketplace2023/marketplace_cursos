import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type UserRole =
  | 'buyer' | 'store_owner' | 'instructor' | 'admin' | 'superadmin'
  | 'support' | 'marketing' | 'finance' | 'compliance' | 'analyst' | 'b2b_user'

export interface SessionPayload {
  sub: string         /* user id */
  email: string
  name: string
  role: UserRole
  storeId?: string    /* for store_owner / instructor */
  iat?: number
  exp?: number
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production-32c'
)
const COOKIE = 'edu_session'
const EXPIRES = 60 * 60 * 24 * 7 /* 7 days */

export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)

  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRES,
    path: '/',
  })
  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies()
    const token = store.get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function updateSession(payload: Partial<SessionPayload>) {
  const current = await getSession()
  if (!current) return null
  return createSession({ ...current, ...payload })
}
