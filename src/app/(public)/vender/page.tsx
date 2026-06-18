import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = { title: 'Vende tus cursos' }

export default async function VenderPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 flex items-center justify-center py-32 px-4 text-center">
        <div>
          <h1 className="font-heading text-4xl font-extrabold mb-4">Vende tus cursos</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Crea tu academia, publica tus cursos y llega a miles de estudiantes en toda Latinoamérica.</p>
          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green-dark text-white rounded-2xl px-8">
            <Link href="/registro?tipo=tienda">Crear mi academia gratis</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
