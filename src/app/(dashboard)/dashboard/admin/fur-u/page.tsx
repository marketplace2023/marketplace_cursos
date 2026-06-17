import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaIdCard } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { desc, isNotNull } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function AdminFurUPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'compliance'].includes(session.role)) redirect('/dashboard')

  const users = await db
    .select({
      id: res_users.id, name: res_users.name, email: res_users.email,
      fur_code: res_users.fur_code, user_type: res_users.user_type,
      kyc_state: res_users.kyc_state, state: res_users.state,
      created_at: res_users.created_at,
    })
    .from(res_users)
    .where(isNotNull(res_users.fur_code))
    .orderBy(desc(res_users.created_at))
    .limit(100)

  const KYC_COLORS: Record<string, string> = {
    approved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    pending: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    none: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">FUR-U — Ficha de usuario</h1>
        <p className="text-muted-foreground mt-0.5">{users.length} usuario{users.length !== 1 ? 's' : ''} con código FUR asignado</p>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaIdCard className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin usuarios con código FUR</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map(u => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="font-mono text-xs text-muted-foreground shrink-0 w-28 truncate">{u.fur_code}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{u.name}</p>
                    <Badge variant="outline" className="text-xs">{u.user_type}</Badge>
                    <Badge className={`text-xs border ${KYC_COLORS[u.kyc_state ?? 'none'] ?? ''}`}>KYC: {u.kyc_state ?? 'none'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email} · {formatDate(u.created_at)}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7 shrink-0">
                  <Link href={`/dashboard/admin/usuarios/${u.id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
