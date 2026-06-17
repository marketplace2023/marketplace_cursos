import { redirect } from 'next/navigation'
import { FaUsers, FaUserPlus } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_store_users_rel, res_users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-brand-purple/10 text-brand-purple',
  admin: 'bg-primary/10 text-primary',
  instructor: 'bg-brand-green/10 text-brand-green',
  member: 'bg-muted text-muted-foreground',
}

export default async function TiendaUsuariosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const staff = await db
    .select({
      id: marketplace_store_users_rel.user_id,
      role: marketplace_store_users_rel.role,
      active: marketplace_store_users_rel.active,
      joined_at: marketplace_store_users_rel.joined_at,
      name: res_users.name,
      email: res_users.email,
      avatar_url: res_users.avatar_url,
    })
    .from(marketplace_store_users_rel)
    .innerJoin(res_users, eq(marketplace_store_users_rel.user_id, res_users.id))
    .where(and(eq(marketplace_store_users_rel.store_id, store.id), eq(marketplace_store_users_rel.active, true)))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Equipo</h1>
          <p className="text-muted-foreground mt-0.5">{staff.length} miembro{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaUserPlus className="h-4 w-4" />Invitar miembro
        </Button>
      </div>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaUsers className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin equipo</h3>
          <p className="text-muted-foreground">Invita instructores y administradores a tu tienda</p>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Miembros del equipo</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {staff.map(s => {
              const initials = s.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-brand-purple/10 text-brand-purple">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs border-0 capitalize ${ROLE_BADGE[s.role ?? 'member'] ?? ROLE_BADGE.member}`}>
                      {s.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Desde {formatDate(s.joined_at)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
