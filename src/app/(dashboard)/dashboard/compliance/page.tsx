import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaShieldAlt, FaIdCard, FaBuilding, FaGraduationCap, FaClipboardList } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { ir_audit_log, marketplace_fur_t, marketplace_fur_p, marketplace_support_ticket } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CompliancePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['compliance', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [auditRow] = await db.select({ c: count() }).from(ir_audit_log)
  const [pendingFurtRow] = await db.select({ c: count() }).from(marketplace_fur_t).where(eq(marketplace_fur_t.verification_state, 'pending'))
  const [escalatedRow] = await db.select({ c: count() }).from(marketplace_support_ticket).where(eq(marketplace_support_ticket.state, 'escalated'))

  const LINKS = [
    { href: '/dashboard/compliance/fur-u', label: 'FUR-U — Usuarios', desc: 'Verificación de identidad de usuarios', icon: FaIdCard, color: 'text-primary', bg: 'bg-primary/10' },
    { href: '/dashboard/compliance/fur-t', label: 'FUR-T — Tiendas', desc: 'Verificación fiscal y documentos', icon: FaBuilding, color: 'text-brand-orange', bg: 'bg-brand-orange/10', badge: pendingFurtRow.c > 0 ? `${pendingFurtRow.c} pendientes` : undefined },
    { href: '/dashboard/compliance/fur-p', label: 'FUR-P — Cursos', desc: 'Acreditación y contenido educativo', icon: FaGraduationCap, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { href: '/dashboard/compliance/casos', label: 'Casos escalados', desc: 'Tickets y reportes de incumplimiento', icon: FaClipboardList, color: 'text-red-500', bg: 'bg-red-500/10', badge: escalatedRow.c > 0 ? `${escalatedRow.c} escalados` : undefined },
    { href: '/dashboard/admin/auditoria', label: 'Auditoría', desc: `${auditRow.c} registros del sistema`, icon: FaShieldAlt, color: 'text-brand-green', bg: 'bg-brand-green/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Compliance</h1>
        <p className="text-muted-foreground mt-0.5">Verificación, auditoría y cumplimiento normativo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map(l => (
          <Card key={l.href} className={`hover:shadow-md transition-shadow ${(l as any).badge ? 'border-brand-orange/30' : ''}`}>
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${l.bg} ${l.color} flex items-center justify-center shrink-0`}>
                  <l.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {(l as any).badge && <span className="text-xs font-medium text-brand-orange">{(l as any).badge}</span>}
                <Button asChild variant="outline" size="sm" className="text-xs h-7 ml-auto">
                  <Link href={l.href}>Revisar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
