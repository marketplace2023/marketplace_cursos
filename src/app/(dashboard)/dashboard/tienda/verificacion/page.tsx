import { redirect } from 'next/navigation'
import { FaShieldAlt, FaCheckCircle, FaHourglass, FaTimesCircle, FaUpload } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_store, marketplace_fur_t } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STEPS = [
  { key: 'identity', label: 'Identidad de la tienda', desc: 'Nombre, descripción y logo de la tienda' },
  { key: 'legal', label: 'Datos legales', desc: 'NIF/RUC o número de identificación fiscal' },
  { key: 'banking', label: 'Datos bancarios', desc: 'Cuenta para recibir pagos' },
  { key: 'documents', label: 'Documentos', desc: 'Identificación oficial y documentos de la empresa' },
]

export default async function TiendaVerificacionPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [store] = await db.select({ id: marketplace_store.id, is_verified: marketplace_store.is_verified, state: marketplace_store.state })
    .from(marketplace_store).where(eq(marketplace_store.owner_id, Number(session.sub))).limit(1)
  if (!store) redirect('/dashboard/tienda/perfil?setup=1')

  const [furT] = await db.select()
    .from(marketplace_fur_t)
    .where(eq(marketplace_fur_t.store_id, store.id))
    .limit(1)

  const verState = furT?.verification_state ?? 'unverified'

  const STATE_MAP: Record<string, { label: string; icon: typeof FaShieldAlt; class: string }> = {
    unverified: { label: 'Sin verificar', icon: FaShieldAlt, class: 'text-muted-foreground' },
    pending: { label: 'En revisión', icon: FaHourglass, class: 'text-brand-orange' },
    verified: { label: 'Verificada', icon: FaCheckCircle, class: 'text-brand-green' },
    rejected: { label: 'Rechazada', icon: FaTimesCircle, class: 'text-destructive' },
  }

  const current = STATE_MAP[verState] ?? STATE_MAP.unverified

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Verificación de tienda</h1>
        <p className="text-muted-foreground mt-0.5">Verifica tu tienda para ganar la insignia de confianza</p>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center ${current.class}`}>
            <current.icon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-semibold">{current.label}</p>
            {verState === 'unverified' && <p className="text-sm text-muted-foreground">Completa los pasos a continuación para solicitar verificación</p>}
            {verState === 'pending' && <p className="text-sm text-muted-foreground">Tu solicitud está siendo revisada. Tiempo estimado: 3-5 días hábiles</p>}
            {verState === 'verified' && <p className="text-sm text-brand-green">¡Tu tienda está verificada y muestra el sello de confianza!</p>}
            {verState === 'rejected' && <p className="text-sm text-destructive">{furT?.verification_notes ?? 'Revisa los documentos requeridos y vuelve a solicitar'}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <Card key={step.key} className={verState === 'verified' ? 'border-brand-green/30' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${verState === 'verified' ? 'bg-brand-green/10 text-brand-green' : 'bg-muted text-muted-foreground'}`}>
                {verState === 'verified' ? <FaCheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(verState === 'unverified' || verState === 'rejected') && (
        <Button className="w-fit gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaUpload className="h-4 w-4" />Solicitar verificación
        </Button>
      )}
    </div>
  )
}
