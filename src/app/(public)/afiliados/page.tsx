import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'Programa de afiliados' }

export default async function AfiliadosPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 flex items-center justify-center py-32 px-4 text-center">
        <div>
          <h1 className="font-heading text-4xl font-extrabold mb-4">Programa de afiliados</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Gana comisiones recomendando EduMarket. Próximamente disponible.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
