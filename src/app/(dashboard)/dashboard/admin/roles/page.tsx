import { redirect } from 'next/navigation'
import { FaUserShield } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ROLES = [
  { key: 'buyer', label: 'Comprador', desc: 'Accede al catálogo y compra cursos', color: 'bg-primary/10 text-primary border-primary/20' },
  { key: 'store_owner', label: 'Dueño de tienda', desc: 'Gestiona una tienda y sus cursos', color: 'bg-brand-green/10 text-brand-green border-brand-green/20' },
  { key: 'instructor', label: 'Instructor', desc: 'Crea y da clases en cursos', color: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20' },
  { key: 'admin', label: 'Admin', desc: 'Administra la plataforma', color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' },
  { key: 'superadmin', label: 'Superadmin', desc: 'Acceso total sin restricciones', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { key: 'support', label: 'Soporte', desc: 'Gestiona tickets y asiste usuarios', color: 'bg-primary/10 text-primary border-primary/20' },
  { key: 'marketing', label: 'Marketing', desc: 'Campañas, SEO y home manager', color: 'bg-brand-green/10 text-brand-green border-brand-green/20' },
  { key: 'finance', label: 'Finanzas', desc: 'Pagos, comisiones y reportes financieros', color: 'bg-brand-green/10 text-brand-green border-brand-green/20' },
  { key: 'compliance', label: 'Compliance', desc: 'Auditoría y regulación', color: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20' },
  { key: 'analyst', label: 'Analista', desc: 'Reportes y métricas de la plataforma', color: 'bg-primary/10 text-primary border-primary/20' },
  { key: 'b2b_user', label: 'B2B', desc: 'Usuario empresarial con acceso grupal', color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' },
]

export default async function AdminRolesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const roleCounts = await Promise.all(
    ROLES.map(async r => {
      const [row] = await db.select({ c: count() }).from(res_users).where(eq(res_users.user_type, r.key as any))
      return { key: r.key, count: row.c }
    })
  )
  const countMap = Object.fromEntries(roleCounts.map(r => [r.key, r.count]))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Roles y permisos</h1>
        <p className="text-muted-foreground mt-0.5">Roles disponibles en la plataforma y su distribución</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map(role => (
          <Card key={role.key}>
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Badge className={`text-xs border ${role.color}`}>{role.label}</Badge>
                <span className="text-2xl font-bold text-foreground">{countMap[role.key] ?? 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">{role.desc}</p>
              <p className="text-xs font-mono text-muted-foreground/70 bg-muted rounded px-2 py-0.5 w-fit">{role.key}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Nota importante</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Los roles se asignan en el campo <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">user_type</span> de la tabla <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">res_users</span>.
            Para cambiar el rol de un usuario ve a <strong>Usuarios → Ver perfil → Editar rol</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
