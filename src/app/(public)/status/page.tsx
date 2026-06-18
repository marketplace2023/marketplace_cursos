import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'
import { FaCheckCircle } from 'react-icons/fa'

export const metadata = { title: 'Estado del sistema' }

export default async function StatusPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 flex items-center justify-center py-32 px-4 text-center">
        <div>
          <FaCheckCircle className="h-16 w-16 text-brand-green mx-auto mb-6" />
          <h1 className="font-heading text-4xl font-extrabold mb-4">Todos los sistemas operativos</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">La plataforma funciona con normalidad. Tiempo de actividad: 99.9%.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
