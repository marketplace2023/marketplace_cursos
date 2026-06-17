import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaEnvelope, FaPhone, FaGlobe, FaShieldAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users, marketplace_enrollment, sale_order } from '@/lib/db/schema'
import { eq, count, sum } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  draft: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  blocked: 'bg-red-600/10 text-red-600 border-red-600/20',
  deleted: 'bg-muted text-muted-foreground',
}

export default async function AdminUsuarioDetallePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const { id } = await props.params
  const userId = parseInt(id)
  if (isNaN(userId)) notFound()

  const [user] = await db.select().from(res_users).where(eq(res_users.id, userId)).limit(1)
  if (!user) notFound()

  const [enrollRow] = await db.select({ c: count() }).from(marketplace_enrollment).where(eq(marketplace_enrollment.user_id, userId))
  const [orderRow] = await db.select({ c: count(), s: sum(sale_order.amount_total) }).from(sale_order).where(eq(sale_order.buyer_id, userId))

  const initials = `${user.name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()

  const INFO_ROWS = [
    { label: 'Email', value: user.email, icon: FaEnvelope },
    { label: 'Teléfono', value: user.phone || '—', icon: FaPhone },
    { label: 'País', value: user.country || '—', icon: FaGlobe },
    { label: 'Timezone', value: user.timezone || '—', icon: FaGlobe },
    { label: 'Idioma', value: user.language || '—', icon: FaGlobe },
    { label: 'KYC', value: user.kyc_state || 'none', icon: FaShieldAlt },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/dashboard/admin/usuarios"><FaArrowLeft className="h-3.5 w-3.5" />Volver</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 flex items-start gap-5">
          <Avatar className="h-16 w-16 shrink-0">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="object-cover" /> : null}
            <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold">{user.name} {user.last_name}</h1>
              <Badge variant="outline" className="text-xs">{user.user_type}</Badge>
              <Badge className={`text-xs border ${STATE_COLORS[user.state] ?? ''}`}>{user.state}</Badge>
              {user.email_verified && <Badge className="text-xs bg-brand-green/10 text-brand-green border-brand-green/20">✓ email</Badge>}
            </div>
            {user.public_name && <p className="text-sm text-muted-foreground">@{user.public_name}</p>}
            {user.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Registro: {formatDate(user.created_at)}</span>
              <span>Último login: {user.last_login ? formatDate(user.last_login) : 'Nunca'}</span>
              <span>{user.login_count} logins</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cursos inscritos', value: enrollRow.c, color: 'text-primary' },
          { label: 'Órdenes', value: orderRow.c, color: 'text-brand-purple' },
          { label: 'Gasto total', value: formatCurrency(Number(orderRow.s ?? 0), 'USD'), color: 'text-brand-green' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Información de contacto</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {INFO_ROWS.map(r => (
            <div key={r.label} className="flex items-center gap-2 text-sm">
              <r.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{r.label}:</span>
              <span className="font-medium truncate">{r.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Seguridad</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">2FA:</span> <span className="font-medium ml-1">{user.two_fa_enabled ? 'Activado' : 'Desactivado'}</span></div>
          <div><span className="text-muted-foreground">Términos:</span> <span className="font-medium ml-1">{user.terms_accepted ? `Aceptados ${user.terms_accepted_at ? formatDate(user.terms_accepted_at) : ''}` : 'No'}</span></div>
          <div><span className="text-muted-foreground">Intentos fallidos:</span> <span className="font-medium ml-1">{user.failed_login_count}</span></div>
          <div><span className="text-muted-foreground">Bloqueado hasta:</span> <span className="font-medium ml-1">{user.locked_until ? formatDate(user.locked_until) : '—'}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
