import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users, marketplace_enrollment, sale_order } from '@/lib/db/schema'
import { eq, desc, count, sum } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminCompradoresPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const buyers = await db
    .select({
      id: res_users.id, name: res_users.name, last_name: res_users.last_name,
      email: res_users.email, state: res_users.state,
      created_at: res_users.created_at, last_login: res_users.last_login,
    })
    .from(res_users)
    .where(eq(res_users.user_type, 'buyer'))
    .orderBy(desc(res_users.created_at))
    .limit(100)

  const buyersWithStats = await Promise.all(
    buyers.map(async b => {
      const [enrRow] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.user_id, b.id))
      const [ordRow] = await db.select({ s: sum(sale_order.amount_total) }).from(sale_order)
        .where(eq(sale_order.buyer_id, b.id))
      return { ...b, enrollments: enrRow.c, spent: Number(ordRow.s ?? 0) }
    })
  )

  const STATE_COLORS: Record<string, string> = {
    active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    draft: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Compradores</h1>
        <p className="text-muted-foreground mt-0.5">{buyers.length} compradores registrados</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: buyers.length, color: 'text-primary' },
          { label: 'Con compras', value: buyersWithStats.filter(b => b.spent > 0).length, color: 'text-brand-green' },
          { label: 'Gasto total', value: formatCurrency(buyersWithStats.reduce((a, b) => a + b.spent, 0), 'USD'), color: 'text-brand-orange' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {buyersWithStats.map(b => {
          const initials = `${b.name?.[0] ?? ''}${b.last_name?.[0] ?? ''}`.toUpperCase() || b.email[0].toUpperCase()
          return (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{b.name} {b.last_name}</p>
                    <Badge className={`text-xs border ${STATE_COLORS[b.state] ?? ''}`}>{b.state}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{b.email} · {formatDate(b.created_at)}</p>
                </div>
                <div className="text-right shrink-0 text-xs text-muted-foreground">
                  <p>{b.enrollments} cursos</p>
                  <p className="font-semibold text-foreground">{formatCurrency(b.spent, 'USD')}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs h-7">
                  <Link href={`/dashboard/admin/usuarios/${b.id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
