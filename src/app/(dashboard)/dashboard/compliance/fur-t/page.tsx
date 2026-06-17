import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function ComplianceFurTPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['compliance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')
  redirect('/dashboard/admin/fur-t')
}
