import { redirect } from 'next/navigation'
import Link from 'next/link'

/* Store security delegates to user security page */
export default function TiendaSeguridadPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-heading font-bold mb-2">Seguridad</h1>
      <p className="text-muted-foreground mb-6">La seguridad de tu cuenta de tienda se gestiona desde tu perfil de usuario.</p>
      <Link href="/dashboard/comprador/seguridad" className="text-primary hover:underline text-sm">
        → Ir a configuración de seguridad
      </Link>
    </div>
  )
}
