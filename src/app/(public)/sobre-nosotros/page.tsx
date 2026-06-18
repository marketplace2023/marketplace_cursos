import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'

export const metadata = { title: 'Sobre nosotros' }

export default async function SobreNosotrosPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 flex items-center justify-center py-32 px-4 text-center">
        <div>
          <h1 className="font-heading text-4xl font-extrabold mb-4">Sobre nosotros</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Somos la plataforma #1 de cursos y academias verificadas en Latinoamérica. Próximamente más información.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
