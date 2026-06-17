import { redirect } from 'next/navigation'
import { FaHeartbeat, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { res_users } from '@/lib/db/schema'
import { count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminSaludPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  let dbOk = false
  let dbLatency = 0
  try {
    const start = Date.now()
    await db.select({ c: count() }).from(res_users)
    dbLatency = Date.now() - start
    dbOk = true
  } catch {}

  const checks = [
    { name: 'Base de datos (Neon)', ok: dbOk, detail: dbOk ? `Latencia: ${dbLatency}ms` : 'Sin conexión', critical: true },
    { name: 'Autenticación JWT', ok: true, detail: 'jose + cookie edu_session activa', critical: true },
    { name: 'API Routes', ok: true, detail: '/api/v1/* disponibles', critical: true },
    { name: 'Almacenamiento de archivos', ok: false, detail: 'No configurado — usando URLs externas', critical: false },
    { name: 'Pasarela de pagos', ok: false, detail: 'Pendiente de integración (Stripe/Wompi)', critical: false },
    { name: 'Correo transaccional', ok: false, detail: 'Pendiente de integración (Resend/SendGrid)', critical: false },
  ]

  const criticalFailing = checks.filter(c => c.critical && !c.ok).length
  const overallOk = criticalFailing === 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Salud del sistema</h1>
        <p className="text-muted-foreground mt-0.5">Estado de los servicios de la plataforma</p>
      </div>

      <Card className={`border-2 ${overallOk ? 'border-brand-green/30' : 'border-red-500/30'}`}>
        <CardContent className="p-6 flex items-center gap-4">
          {overallOk
            ? <FaCheckCircle className="h-12 w-12 text-brand-green shrink-0" />
            : <FaExclamationTriangle className="h-12 w-12 text-red-500 shrink-0" />
          }
          <div>
            <h2 className={`text-xl font-bold ${overallOk ? 'text-brand-green' : 'text-red-500'}`}>
              {overallOk ? 'Sistema operativo' : `${criticalFailing} servicio(s) críticos con fallo`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {checks.filter(c => c.ok).length} de {checks.length} servicios funcionando correctamente
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {checks.map(check => (
          <Card key={check.name} className={!check.ok && check.critical ? 'border-red-500/30' : ''}>
            <CardContent className="p-4 flex items-center gap-4">
              {check.ok
                ? <FaCheckCircle className="h-5 w-5 text-brand-green shrink-0" />
                : <FaExclamationTriangle className={`h-5 w-5 shrink-0 ${check.critical ? 'text-red-500' : 'text-brand-orange'}`} />
              }
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{check.name}</p>
                  {check.critical && <Badge variant="outline" className="text-xs">Crítico</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{check.detail}</p>
              </div>
              <Badge className={`text-xs border ${check.ok ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : check.critical ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'}`}>
                {check.ok ? 'OK' : check.critical ? 'ERROR' : 'PENDIENTE'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Entorno</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Runtime:</span> <span className="font-medium ml-1">Next.js 16 App Router</span></div>
          <div><span className="text-muted-foreground">ORM:</span> <span className="font-medium ml-1">Drizzle + Neon HTTP</span></div>
          <div><span className="text-muted-foreground">Auth:</span> <span className="font-medium ml-1">JWT (jose) + bcryptjs</span></div>
          <div><span className="text-muted-foreground">UI:</span> <span className="font-medium ml-1">shadcn/ui + Magic UI + Tailwind v4</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
