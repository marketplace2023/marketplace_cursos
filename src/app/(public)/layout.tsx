import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={session ? { name: session.name, role: session.role } : null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
