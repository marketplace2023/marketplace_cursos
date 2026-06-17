import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaStore, FaCheckCircle, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, res_users, product_template } from '@/lib/db/schema'
import { eq, count, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  active: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  pending_review: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  draft: 'bg-muted text-muted-foreground',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
  rejected: 'bg-red-600/10 text-red-600 border-red-600/20',
}

export default async function AdminTiendaDetallePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const { id } = await props.params
  const storeId = parseInt(id)
  if (isNaN(storeId)) notFound()

  const [store] = await db
    .select({
      id: marketplace_store.id, name: marketplace_store.name, legal_name: marketplace_store.legal_name,
      slug: marketplace_store.slug, state: marketplace_store.state, store_type: marketplace_store.store_type,
      description: marketplace_store.description, logo_url: marketplace_store.logo_url,
      email: marketplace_store.email, phone: marketplace_store.phone, website: marketplace_store.website,
      country: marketplace_store.country, city: marketplace_store.city, address: marketplace_store.address,
      plan: marketplace_store.plan, commission_rate: marketplace_store.commission_rate,
      is_verified: marketplace_store.is_verified, verified_at: marketplace_store.verified_at,
      total_courses: marketplace_store.total_courses, total_students: marketplace_store.total_students,
      total_sales: marketplace_store.total_sales, rating_avg: marketplace_store.rating_avg,
      created_at: marketplace_store.created_at, refund_policy: marketplace_store.refund_policy,
      owner_name: res_users.name, owner_email: res_users.email, owner_id: marketplace_store.owner_id,
    })
    .from(marketplace_store)
    .innerJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
    .where(eq(marketplace_store.id, storeId))
    .limit(1)

  if (!store) notFound()

  const courses = await db
    .select({ id: product_template.id, name: product_template.name, state: product_template.state, total_students: product_template.total_students })
    .from(product_template)
    .where(eq(product_template.store_id, storeId))
    .orderBy(desc(product_template.total_students))
    .limit(10)

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/dashboard/admin/tiendas"><FaArrowLeft className="h-3.5 w-3.5" />Volver</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 flex items-start gap-5">
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {store.logo_url ? <img src={store.logo_url} alt={store.name} className="object-cover h-full w-full" /> : <FaStore className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold">{store.name}</h1>
              {store.is_verified && <FaCheckCircle className="h-4 w-4 text-brand-green" />}
              <Badge className={`text-xs border ${STATE_COLORS[store.state] ?? ''}`}>{store.state}</Badge>
              <Badge variant="outline" className="text-xs">{store.plan}</Badge>
            </div>
            {store.legal_name && <p className="text-xs text-muted-foreground">{store.legal_name}</p>}
            {store.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{store.description}</p>}
            <p className="text-xs text-muted-foreground mt-2">Dueño: <Link href={`/dashboard/admin/usuarios/${store.owner_id}`} className="hover:text-primary underline">{store.owner_name}</Link> · {store.owner_email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Cursos', value: store.total_courses, color: 'text-primary' },
          { label: 'Estudiantes', value: store.total_students, color: 'text-brand-purple' },
          { label: 'Ventas', value: store.total_sales, color: 'text-brand-green' },
          { label: 'Rating', value: Number(store.rating_avg ?? 0).toFixed(1), color: 'text-brand-orange' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          {store.email && <div className="flex gap-2 items-center"><FaEnvelope className="h-3.5 w-3.5 text-muted-foreground" /><span>{store.email}</span></div>}
          {store.phone && <div className="flex gap-2 items-center"><FaPhone className="h-3.5 w-3.5 text-muted-foreground" /><span>{store.phone}</span></div>}
          {store.website && <div className="flex gap-2 items-center"><FaGlobe className="h-3.5 w-3.5 text-muted-foreground" /><span className="truncate">{store.website}</span></div>}
          {store.city && <div className="flex gap-2 items-center"><FaGlobe className="h-3.5 w-3.5 text-muted-foreground" /><span>{store.city}, {store.country}</span></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configuración comercial</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Comisión:</span> <span className="font-medium ml-1">{store.commission_rate}%</span></div>
          <div><span className="text-muted-foreground">Plan:</span> <span className="font-medium ml-1">{store.plan}</span></div>
          <div><span className="text-muted-foreground">Verificada:</span> <span className="font-medium ml-1">{store.is_verified ? `Sí (${store.verified_at ? formatDate(store.verified_at) : ''})` : 'No'}</span></div>
          <div><span className="text-muted-foreground">Registro:</span> <span className="font-medium ml-1">{formatDate(store.created_at)}</span></div>
        </CardContent>
      </Card>

      {courses.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Cursos destacados</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {courses.map(c => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <Badge variant={c.state === 'published' ? 'default' : 'secondary'} className="text-xs shrink-0">{c.state}</Badge>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground shrink-0">{c.total_students} estudiantes</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
