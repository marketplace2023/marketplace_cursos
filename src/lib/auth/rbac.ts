import { type UserRole } from './session'
export { type UserRole } from './session'

/* route prefix → allowed roles (empty = any authenticated user) */
export const ROLE_MAP: Record<string, UserRole[]> = {
  '/dashboard/admin':      ['admin', 'superadmin'],
  '/dashboard/tienda':     ['store_owner', 'admin', 'superadmin'],
  '/dashboard/instructor': ['instructor', 'store_owner', 'admin', 'superadmin'],
  '/dashboard/comprador':  ['buyer', 'admin', 'superadmin'],
  '/dashboard/soporte':    ['support', 'admin', 'superadmin'],
  '/dashboard/marketing':  ['marketing', 'admin', 'superadmin'],
  '/dashboard/finanzas':   ['finance', 'admin', 'superadmin'],
  '/dashboard/compliance': ['compliance', 'admin', 'superadmin'],
  '/dashboard/corporativo':['b2b_user', 'admin', 'superadmin'],
}

export function canAccess(role: UserRole, pathname: string): boolean {
  for (const [prefix, roles] of Object.entries(ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      return roles.includes(role)
    }
  }
  return true /* public or unguarded */
}

/* helper used in Server Components / Server Actions */
export function requireRole(role: UserRole, allowed: UserRole[]): void {
  if (!allowed.includes(role)) {
    throw new Error('UNAUTHORIZED')
  }
}

export const ADMIN_ROLES: UserRole[] = ['admin', 'superadmin']
export const STORE_ROLES: UserRole[]  = ['store_owner', 'admin', 'superadmin']
export const INSTRUCTOR_ROLES: UserRole[] = ['instructor', 'store_owner', 'admin', 'superadmin']
export const STAFF_ROLES: UserRole[]  = ['support', 'marketing', 'finance', 'compliance', 'analyst', 'admin', 'superadmin']
