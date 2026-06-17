import Link from 'next/link'
import { Suspense } from 'react'
import {
  FaSearch, FaArrowRight, FaStar, FaCheckCircle,
  FaCode, FaChartBar, FaPalette, FaBriefcase, FaLanguage,
  FaHeartbeat, FaCamera, FaMusic, FaGraduationCap,
  FaUsers, FaBookOpen, FaAward, FaStore
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'

/* ── Static placeholder data (replaced by DB queries after DB is connected) ── */
const CATEGORIES = [
  { name: 'Desarrollo Web',      slug: 'desarrollo-web',       icon: FaCode,      count: 120 },
  { name: 'Marketing Digital',   slug: 'marketing-digital',    icon: FaChartBar,  count: 86 },
  { name: 'Diseño Gráfico',      slug: 'diseno-grafico',       icon: FaPalette,   count: 74 },
  { name: 'Negocios',            slug: 'negocios',             icon: FaBriefcase, count: 95 },
  { name: 'Idiomas',             slug: 'idiomas',              icon: FaLanguage,  count: 63 },
  { name: 'Salud y Bienestar',   slug: 'salud-bienestar',      icon: FaHeartbeat, count: 48 },
  { name: 'Fotografía',          slug: 'fotografia',           icon: FaCamera,    count: 37 },
  { name: 'Música',              slug: 'musica',               icon: FaMusic,     count: 29 },
]

const FEATURED_COURSES = [
  { id: 1, title: 'Desarrollo Web Full Stack con React y Next.js', instructor: 'Carlos Mendoza', store: 'Academia Tech Demo', rating: 4.8, reviews: 312, price: 49, originalPrice: 199, duration: '48h', level: 'Principiante', cover: '/images/course-placeholder.jpg', slug: 'desarrollo-web-full-stack-react-nextjs', badge: 'Bestseller' },
  { id: 2, title: 'Marketing Digital Avanzado 2026', instructor: 'María López', store: 'Marketing Pro', rating: 4.7, reviews: 198, price: 39, originalPrice: 149, duration: '32h', level: 'Intermedio', cover: '/images/course-placeholder.jpg', slug: 'marketing-digital-avanzado-2026', badge: 'Destacado' },
  { id: 3, title: 'Diseño UI/UX con Figma: De cero a profesional', instructor: 'Ana García', store: 'Design Academy', rating: 4.9, reviews: 445, price: 59, originalPrice: 189, duration: '40h', level: 'Principiante', cover: '/images/course-placeholder.jpg', slug: 'diseno-ui-ux-figma', badge: 'Nuevo' },
  { id: 4, title: 'Excel Avanzado para Análisis de Datos', instructor: 'Roberto Sánchez', store: 'DataSkills', rating: 4.6, reviews: 267, price: 29, originalPrice: 99, duration: '24h', level: 'Intermedio', cover: '/images/course-placeholder.jpg', slug: 'excel-avanzado-analisis-datos', badge: '' },
]

const FEATURED_STORES = [
  { id: 1, name: 'Academia Tech Demo', slug: 'academia-tech-demo', category: 'Tecnología', rating: 4.9, courses: 24, students: 1840, verified: true, logo: '' },
  { id: 2, name: 'Marketing Pro Academy', slug: 'marketing-pro-academy', category: 'Marketing', rating: 4.7, courses: 18, students: 1230, verified: true, logo: '' },
  { id: 3, name: 'Design Academy MX', slug: 'design-academy-mx', category: 'Diseño', rating: 4.8, courses: 12, students: 980, verified: true, logo: '' },
]

const STATS = [
  { label: 'Estudiantes activos',   value: '50,000+',  icon: FaUsers },
  { label: 'Cursos disponibles',    value: '2,400+',   icon: FaBookOpen },
  { label: 'Academias verificadas', value: '180+',     icon: FaStore },
  { label: 'Certificados emitidos', value: '28,000+',  icon: FaAward },
]

const PLANS = [
  { name: 'Free',   price: '$0',   period: '/mes', features: ['5 cursos', '1 usuario', 'Comisión 20%'],  cta: 'Empezar gratis',  highlight: false },
  { name: 'Basic',  price: '$29',  period: '/mes', features: ['20 cursos', '3 usuarios', 'Comisión 15%'], cta: 'Elegir Basic',    highlight: false },
  { name: 'Pro',    price: '$79',  period: '/mes', features: ['100 cursos', '10 usuarios', 'Comisión 10%', 'Analítica avanzada'], cta: 'Elegir Pro', highlight: true },
  { name: 'Enterprise', price: '$199', period: '/mes', features: ['Ilimitado', 'Staff ilimitado', 'Comisión 7%', 'Soporte prioritario'], cta: 'Contactar', highlight: false },
]

/* ── Sub-components ── */

function StatsBanner() {
  return (
    <section className="bg-primary py-10">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center text-primary-foreground">
              <s.icon className="h-8 w-8 text-brand-green" />
              <span className="text-3xl font-bold font-heading">{s.value}</span>
              <span className="text-sm text-primary-foreground/70">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CourseCard({ course }: { course: typeof FEATURED_COURSES[0] }) {
  const discount = Math.round((1 - course.price / course.originalPrice) * 100)
  return (
    <Card className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20">
          <FaGraduationCap className="h-16 w-16 text-primary/20" />
        </div>
        {course.badge && (
          <Badge className="absolute top-2 left-2 bg-brand-orange text-white border-0 text-xs">
            {course.badge}
          </Badge>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">{course.level}</Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-4 gap-2">
        <p className="text-xs text-muted-foreground">{course.store}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">{course.instructor}</p>
        <div className="flex items-center gap-1 text-xs">
          <FaStar className="h-3 w-3 text-brand-orange" />
          <span className="font-semibold">{course.rating}</span>
          <span className="text-muted-foreground">({course.reviews.toLocaleString()})</span>
          <span className="ml-auto text-muted-foreground">{course.duration}</span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2 border-t">
          <span className="text-lg font-bold text-primary">${course.price}</span>
          <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
          <Badge className="ml-auto text-[10px] bg-brand-green/10 text-brand-green border-(--brand-green)/30 hover:bg-brand-green/20">
            -{discount}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function StoreCard({ store }: { store: typeof FEATURED_STORES[0] }) {
  return (
    <Card className="group flex flex-col items-center p-6 text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3">
        <FaStore className="h-7 w-7 text-white" />
      </div>
      {store.verified && (
        <Badge className="mb-2 text-xs bg-brand-green/10 text-brand-green border-(--brand-green)/30">
          <FaCheckCircle className="mr-1 h-3 w-3" /> Verificada
        </Badge>
      )}
      <h3 className="font-semibold group-hover:text-primary transition-colors">{store.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{store.category}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        <FaStar className="h-3 w-3 text-brand-orange" />
        <span className="font-semibold text-foreground">{store.rating}</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
        <span>{store.courses} cursos</span>
        <span>{store.students.toLocaleString()} estudiantes</span>
      </div>
      <Button variant="outline" size="sm" className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
        <Link href={`/tiendas/${store.slug}`}>Ver tienda</Link>
      </Button>
    </Card>
  )
}

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-brand-secondary py-20 lg:py-28">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-green/10" />

          <div className="relative mx-auto max-w-screen-xl px-4 text-center lg:px-8">
            <Badge className="mb-5 bg-brand-green/20 text-brand-green border-(--brand-green)/30 px-4 py-1 text-sm">
              🎓 +50,000 estudiantes ya aprenden con nosotros
            </Badge>
            <h1 className="font-heading font-extrabold text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              Aprende de los mejores.<br />
              <span className="text-brand-green">Crece profesionalmente.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
              Descubre miles de cursos de academias verificadas. Compara, elige y comienza
              tu camino hacia el éxito profesional hoy mismo.
            </p>

            {/* Hero search */}
            <form
              onSubmit={undefined}
              action="/buscar"
              method="GET"
              className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  name="q"
                  placeholder="¿Qué quieres aprender hoy?"
                  className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-4 text-foreground text-base shadow-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-full bg-brand-green hover:bg-brand-green-dark text-white px-8 shadow-lg">
                Buscar
              </Button>
            </form>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['React', 'Excel', 'Marketing', 'Figma', 'Python', 'Inglés'].map(q => (
                <Link
                  key={q}
                  href={`/buscar?q=${q}`}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <StatsBanner />

        {/* ── Categories ── */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  Explora por categoría
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Encuentra el área que mejor se adapta a tus objetivos
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary">
                <Link href="/cursos">Ver todo <FaArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center shadow-sm hover:border-primary hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{cat.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cat.count} cursos</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured courses ── */}
        <section className="py-16">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Cursos destacados</h2>
                <p className="mt-1 text-muted-foreground text-sm">Los más valorados por nuestra comunidad</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary">
                <Link href="/cursos">Ver todos <FaArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_COURSES.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>

        {/* ── Featured stores ── */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Academias destacadas</h2>
                <p className="mt-1 text-muted-foreground text-sm">Proveedores verificados de formación profesional</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary">
                <Link href="/tiendas">Ver todas <FaArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_STORES.map(s => <StoreCard key={s.id} store={s} />)}
            </div>
          </div>
        </section>

        {/* ── Plans ── */}
        <section className="py-16">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">Planes para tiendas</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Publica tus cursos y llega a miles de estudiantes. Elige el plan que más se adapta a tu academia.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map(plan => (
                <Card
                  key={plan.name}
                  className={`flex flex-col relative overflow-hidden ${plan.highlight ? 'border-primary ring-2 ring-primary shadow-lg' : ''}`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-brand-green" />
                  )}
                  <CardContent className="flex flex-1 flex-col p-6 gap-4">
                    {plan.highlight && (
                      <Badge className="w-fit bg-brand-green text-white border-0 text-xs">Más popular</Badge>
                    )}
                    <div>
                      <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-3xl font-bold text-primary">{plan.price}</span>
                        <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <FaCheckCircle className="h-4 w-4 shrink-0 text-brand-green" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`mt-2 w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
                      variant={plan.highlight ? 'default' : 'outline'}
                    >
                      <Link href={`/planes#${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Dual ── */}
        <section className="py-16 bg-gradient-to-r from-primary to-brand-secondary">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              {/* For buyers */}
              <div className="flex flex-col gap-4 text-primary-foreground">
                <Badge className="w-fit bg-white/10 text-white border-white/20">Para compradores</Badge>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                  ¿Listo para aprender algo nuevo?
                </h2>
                <p className="text-primary-foreground/75 leading-relaxed">
                  Accede a más de 2,400 cursos de academias verificadas.
                  Aprende a tu ritmo y obtén certificados reconocidos.
                </p>
                <Button asChild size="lg" className="w-fit bg-brand-green hover:bg-brand-green-dark text-white">
                  <Link href="/cursos">
                    Explorar cursos <FaArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {/* For sellers */}
              <div className="flex flex-col gap-4 text-primary-foreground">
                <Badge className="w-fit bg-white/10 text-white border-white/20">Para academias</Badge>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                  ¿Tienes conocimiento que compartir?
                </h2>
                <p className="text-primary-foreground/75 leading-relaxed">
                  Crea tu academia, publica tus cursos y llega a miles de
                  estudiantes. Comienza gratis, sin comisiones iniciales.
                </p>
                <Button asChild size="lg" variant="outline" className="w-fit border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/registro?tipo=tienda">
                    Crear mi tienda <FaArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
