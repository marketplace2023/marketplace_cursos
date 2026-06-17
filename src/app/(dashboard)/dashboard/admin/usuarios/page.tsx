import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaUsers, FaSearch } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { desc, eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  draft: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  blocked: 'bg-red-600/10 text-red-600 border-red-600/20',
  deleted: 'bg-muted text-muted-foreground',
}

export default async function AdminUsuariosPage(props: { searchParams: Promise<{ type?: string; state?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const sp = await props.searchParams
  const filterType = sp.type
  const filterState = sp.state

  const users = await db
    .select({
      id: res_users.id, name: res_users.name, last_name: res_users.last_name,
      email: res_users.email, user_type: res_users.user_type, state: res_users.state,
      email_verified: res_users.email_verified, created_at: res_users.created_at,
      last_login: res_users.last_login, login_count: res_users.login_count,
    })
    .from(res_users)
    .orderBy(desc(res_users.created_at))
    .limit(100)

  const filtered = users.filter(u => {
    if (filterType && u.user_type !== filterType) return false
    if (filterState && u.state !== filterState) return false
    return true
  })

  const TYPES = ['buyer', 'store_owner', 'instructor', 'admin', 'superadmin', 'support', 'marketing', 'finance', 'compliance', 'analyst', 'b2b_user']
  const STATES = ['draft', 'active', 'suspended', 'blocked', 'deleted']

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-0.5">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Tipo:</span>
        <Button asChild variant={!filterType ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
          <Link href="/dashboard/admin/usuarios">Todos</Link>
        </Button>
        {TYPES.map(t => (
          <Button key={t} asChild variant={filterType === t ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
            <Link href={`/dashboard/admin/usuarios?type=${t}${filterState ? `&state=${filterState}` : ''}`}>{t}</Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Estado:</span>
        <Button asChild variant={!filterState ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
          <Link href={`/dashboard/admin/usuarios${filterType ? `?type=${filterType}` : ''}`}>Todos</Link>
        </Button>
        {STATES.map(s => (
          <Button key={s} asChild variant={filterState === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs">
            <Link href={`/dashboard/admin/usuarios?state=${s}${filterType ? `&type=${filterType}` : ''}`}>{s}</Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(u => {
          const initials = `${u.name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || u.email[0].toUpperCase()
          return (
            <Card key={u.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{u.name} {u.last_name}</p>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">{u.user_type}</Badge>
                    <Badge className={`text-xs h-5 px-1.5 border ${STATE_COLORS[u.state] ?? ''}`}>{u.state}</Badge>
                    {u.email_verified && <Badge className="text-xs h-5 px-1.5 bg-brand-green/10 text-brand-green border-brand-green/20">✓ email</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email} · Registro: {formatDate(u.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{u.login_count} logins</p>
                  <Button asChild variant="outline" size="sm" className="mt-1 h-7 text-xs">
                    <Link href={`/dashboard/admin/usuarios/${u.id}`}>Ver</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
