import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { canAccess, type UserRole } from '@/lib/auth/rbac'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production-32c'
)

const PROTECTED = /^\/dashboard(\/.*)?$/
const AUTH_PAGES = /^\/(login|registro|recuperar)(\/.*)?$/

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  /* get token */
  const token = req.cookies.get('edu_session')?.value

  let session: { role?: UserRole } | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      session = payload as { role?: UserRole }
    } catch {
      /* invalid/expired token – treat as unauthenticated */
    }
  }

  /* redirect logged-in users away from auth pages */
  if (session && AUTH_PAGES.test(pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  /* protect dashboard routes */
  if (PROTECTED.test(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url))
    }
    if (!canAccess(session.role!, pathname)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/v1/auth).*)',
  ],
}
