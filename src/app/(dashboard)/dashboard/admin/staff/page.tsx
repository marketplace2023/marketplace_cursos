import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaUserTie } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { and, desc, inArray } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  superadmin: 'bg-red-500/10 text-red-500 border-red-500/20',
  support: 'bg-primary/10 text-primary border-primary/20',
  marketing: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  finance: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  compliance: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  analyst: 'bg-primary/10 text-primary border-primary/20',
}

export default async function AdminStaffPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const staff = await db
    .select({
      id: res_users.id, name: res_users.name, last_name: res_users.last_name,
      email: res_users.email, user_type: res_users.user_type, state: res_users.state,
      last_login: res_users.last_login, created_at: res_users.created_at,
    })
    .from(res_users)
    .where(inArray(res_users.user_type, ['admin', 'superadmin', 'support', 'marketing', 'finance', 'compliance', 'analyst'] as any[]))
    .orderBy(res_users.user_type, desc(res_users.created_at))

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin', superadmin: 'Superadmin', support: 'Soporte',
    marketing: 'Marketing', finance: 'Finanzas', compliance: 'Compliance', analyst: 'Analista',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Staff</h1>
        <p className="text-muted-foreground mt-0.5">{staff.length} miembro{staff.length !== 1 ? 's' : ''} del equipo interno</p>
      </div>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaUserTie className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin personal de staff registrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {staff.map(u => {
            const initials = `${u.name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || u.email[0].toUpperCase()
            return (
              <Card key={u.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm">{u.name} {u.last_name}</p>
                      <Badge className={`text-xs border ${ROLE_COLORS[u.user_type] ?? ''}`}>{ROLE_LABELS[u.user_type] ?? u.user_type}</Badge>
                      <Badge variant={u.state === 'active' ? 'default' : 'secondary'} className="text-xs">{u.state}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Último acceso: {u.last_login ? formatDate(u.last_login) : 'Nunca'}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                    <Link href={`/dashboard/admin/usuarios/${u.id}`}>Ver</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
