import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = { title: 'Publicidad' }

export default async function PublicidadPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 flex items-center justify-center py-32 px-4 text-center">
        <div>
          <h1 className="font-heading text-4xl font-extrabold mb-4">Publicidad</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Promociona tu academia o cursos ante miles de estudiantes activos. Contacta a nuestro equipo para conocer los planes.</p>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-8">
            <Link href="/contacto">Contactar</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
