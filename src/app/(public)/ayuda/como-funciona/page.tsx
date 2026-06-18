import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'
import { FaSearch, FaShoppingCart, FaPlay, FaAward } from 'react-icons/fa'

export const metadata = { title: 'Cómo funciona' }

const STEPS = [
  { icon: FaSearch,       num: '01', title: 'Explora',        desc: 'Busca entre miles de cursos de academias verificadas.' },
  { icon: FaShoppingCart, num: '02', title: 'Elige y compra', desc: 'Compara precios, lee reviews y elige el mejor curso para ti.' },
  { icon: FaPlay,         num: '03', title: 'Aprende',        desc: 'Accede inmediatamente y aprende a tu ritmo, cuando quieras.' },
  { icon: FaAward,        num: '04', title: 'Certifícate',    desc: 'Obtén tu certificado digital verificable al completar el curso.' },
]

export default async function ComoFuncionaPage() {
  const session = await getSession()
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 py-24 px-4">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h1 className="font-heading text-4xl font-extrabold mb-4">¿Cómo funciona EduMarket?</h1>
          <p className="text-muted-foreground text-lg">Aprende de las mejores academias en 4 simples pasos.</p>
        </div>
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8">
          {STEPS.map(s => (
            <div key={s.num} className="flex gap-5 p-6 rounded-2xl border bg-muted/30">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{s.num}</span>
                <h3 className="font-heading font-bold text-lg mt-0.5">{s.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
