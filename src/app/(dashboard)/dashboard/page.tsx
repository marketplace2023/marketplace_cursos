import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

const ROLE_HOME: Record<string, string> = {
  buyer: '/dashboard/comprador',
  store_owner: '/dashboard/tienda',
  instructor: '/dashboard/instructor',
  admin: '/dashboard/admin',
  superadmin: '/dashboard/admin',
  support: '/dashboard/soporte',
  marketing: '/dashboard/marketing',
  finance: '/dashboard/finanzas',
  compliance: '/dashboard/compliance',
  analyst: '/dashboard/admin/reportes',
  b2b_user: '/dashboard/corporativo',
}

export default async function DashboardRootPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  redirect(ROLE_HOME[session.role] ?? '/dashboard/comprador')
}
