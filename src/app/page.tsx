import Link from 'next/link'
import {
  FaSearch, FaArrowRight, FaStar, FaCheckCircle,
  FaCode, FaChartBar, FaPalette, FaBriefcase, FaLanguage,
  FaHeartbeat, FaCamera, FaMusic, FaGraduationCap,
  FaUsers, FaBookOpen, FaAward, FaStore, FaPlay, FaShieldAlt,
  FaCertificate, FaBolt, FaRegSmile,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { getSession } from '@/lib/auth/session'
import { HomeCourseCarousel, HomeStoreCarousel } from '@/components/public/home-carousels'
import { NumberTicker } from '@/components/ui/number-ticker'

/* ── Static data ── */
const CATEGORIES = [
  { name: 'Desarrollo',    slug: 'desarrollo-web',    icon: FaCode,      color: 'from-blue-500/15 to-cyan-400/10',    iconColor: 'text-blue-600',   count: 120 },
  { name: 'Marketing',     slug: 'marketing-digital', icon: FaChartBar,  color: 'from-orange-500/15 to-yellow-400/10', iconColor: 'text-orange-500', count: 86 },
  { name: 'Diseño',        slug: 'diseno-grafico',    icon: FaPalette,   color: 'from-purple-500/15 to-pink-400/10',  iconColor: 'text-purple-600', count: 74 },
  { name: 'Negocios',      slug: 'negocios',          icon: FaBriefcase, color: 'from-primary/15 to-brand-secondary/10', iconColor: 'text-primary', count: 95 },
  { name: 'Idiomas',       slug: 'idiomas',           icon: FaLanguage,  color: 'from-green-500/15 to-emerald-400/10', iconColor: 'text-green-600', count: 63 },
  { name: 'Salud',         slug: 'salud-bienestar',   icon: FaHeartbeat, color: 'from-red-500/15 to-rose-400/10',     iconColor: 'text-red-500',   count: 48 },
  { name: 'Fotografía',    slug: 'fotografia',        icon: FaCamera,    color: 'from-amber-500/15 to-yellow-400/10', iconColor: 'text-amber-600', count: 37 },
  { name: 'Música',        slug: 'musica',            icon: FaMusic,     color: 'from-indigo-500/15 to-purple-400/10', iconColor: 'text-indigo-600', count: 29 },
]

const FEATURED_COURSES = [
  { id: 1, title: 'Desarrollo Web Full Stack con React y Next.js', instructor: 'Carlos Mendoza', store: 'Academia Tech Demo', rating: 4.8, reviews: 312, price: 49, originalPrice: 199, duration: '48h', level: 'Principiante', cover: '', slug: 'desarrollo-web-full-stack-react-nextjs', badge: 'Bestseller' },
  { id: 2, title: 'Marketing Digital Avanzado 2026', instructor: 'María López', store: 'Marketing Pro', rating: 4.7, reviews: 198, price: 39, originalPrice: 149, duration: '32h', level: 'Intermedio', cover: '', slug: 'marketing-digital-avanzado-2026', badge: 'Destacado' },
  { id: 3, title: 'Diseño UI/UX con Figma: De cero a profesional', instructor: 'Ana García', store: 'Design Academy', rating: 4.9, reviews: 445, price: 59, originalPrice: 189, duration: '40h', level: 'Principiante', cover: '', slug: 'diseno-ui-ux-figma', badge: 'Nuevo' },
  { id: 4, title: 'Excel Avanzado para Análisis de Datos', instructor: 'Roberto Sánchez', store: 'DataSkills', rating: 4.6, reviews: 267, price: 29, originalPrice: 99, duration: '24h', level: 'Intermedio', cover: '', slug: 'excel-avanzado-analisis-datos', badge: '' },
  { id: 5, title: 'Python para Ciencia de Datos e IA', instructor: 'Luis Herrera', store: 'DataSkills', rating: 4.8, reviews: 521, price: 69, originalPrice: 249, duration: '60h', level: 'Principiante', cover: '', slug: 'python-ciencia-datos-ia', badge: 'Bestseller' },
  { id: 6, title: 'Inglés para Negocios: C1 Express', instructor: 'Sandra Williams', store: 'LangPro', rating: 4.7, reviews: 183, price: 45, originalPrice: 179, duration: '36h', level: 'Intermedio', cover: '', slug: 'ingles-negocios-c1', badge: '' },
]

const FEATURED_STORES = [
  { id: 1, name: 'Academia Tech Demo', slug: 'academia-tech-demo', category: 'Tecnología', rating: 4.9, courses: 24, students: 1840, verified: true, logo: '' },
  { id: 2, name: 'Marketing Pro Academy', slug: 'marketing-pro-academy', category: 'Marketing', rating: 4.7, courses: 18, students: 1230, verified: true, logo: '' },
  { id: 3, name: 'Design Academy MX', slug: 'design-academy-mx', category: 'Diseño', rating: 4.8, courses: 12, students: 980, verified: true, logo: '' },
  { id: 4, name: 'LangPro Institute', slug: 'langpro-institute', category: 'Idiomas', rating: 4.6, courses: 9, students: 720, verified: true, logo: '' },
]

const PLANS = [
  {
    name: 'Free', price: 0, period: '/mes',
    features: ['Hasta 5 cursos', '1 usuario', 'Comisión 20%', 'Panel básico'],
    cta: 'Empezar gratis', highlight: false, badge: '',
    color: 'from-muted/50 to-muted/30',
  },
  {
    name: 'Basic', price: 29, period: '/mes',
    features: ['Hasta 20 cursos', '3 usuarios', 'Comisión 15%', 'Analítica básica', 'Soporte email'],
    cta: 'Elegir Basic', highlight: false, badge: '',
    color: 'from-brand-secondary/10 to-brand-secondary/5',
  },
  {
    name: 'Pro', price: 79, period: '/mes',
    features: ['Hasta 100 cursos', '10 usuarios', 'Comisión 10%', 'Analítica avanzada', 'Soporte prioritario', 'Cupones ilimitados'],
    cta: 'Elegir Pro', highlight: true, badge: 'Más popular',
    color: 'from-primary to-brand-secondary',
  },
  {
    name: 'Enterprise', price: 199, period: '/mes',
    features: ['Cursos ilimitados', 'Staff ilimitado', 'Comisión 7%', 'API access', 'Account manager', 'SLA garantizado'],
    cta: 'Contactar ventas', highlight: false, badge: '',
    color: 'from-brand-purple/10 to-brand-purple/5',
  },
]

const TRUST_ITEMS = [
  { icon: FaShieldAlt,   title: 'Academias verificadas', desc: 'Cada instructor pasa un proceso de validación de calidad.' },
  { icon: FaCertificate, title: 'Certificados reconocidos', desc: 'Obtén credenciales digitales verificables y compartibles.' },
  { icon: FaBolt,        title: 'Acceso inmediato', desc: 'Empieza a aprender al instante, sin esperas ni configuración.' },
  { icon: FaRegSmile,    title: 'Garantía 30 días', desc: 'Reembolso completo si no estás satisfecho con el curso.' },
]

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session ? { name: session.name, role: session.role } : null} />

      <main className="flex-1">

        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary py-24 lg:py-32">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-40 -right-40 h-125 w-125 rounded-full bg-brand-green/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-100 w-100 rounded-full bg-brand-purple/10 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-white/3 blur-2xl" />

          <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-1.5 text-sm text-brand-green font-medium mb-6 backdrop-blur-sm">
              <FaStar className="h-3.5 w-3.5" />
              La plataforma #1 de academias verificadas en Latinoamérica
            </div>

            <h1 className="font-heading font-extrabold text-4xl leading-[1.1] text-white sm:text-5xl lg:text-7xl">
              Aprende de los mejores.<br />
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-brand-green via-emerald-400 to-brand-green bg-clip-text text-transparent">
                  Crece sin límites.
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 leading-relaxed">
              Descubre miles de cursos de academias verificadas. Compara, elige y comienza
              tu camino hacia el éxito profesional hoy mismo.
            </p>

            {/* Hero search */}
            <form action="/buscar" method="GET" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  name="q"
                  placeholder="¿Qué quieres aprender hoy?"
                  className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-foreground text-base shadow-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white px-8 shadow-xl text-base font-semibold">
                <FaSearch className="mr-2 h-4 w-4" /> Buscar
              </Button>
            </form>

            {/* Quick tags */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="text-white/50 text-sm">Popular:</span>
              {['React', 'Excel', 'Marketing', 'Figma', 'Python', 'Inglés', 'UX'].map(q => (
                <Link
                  key={q}
                  href={`/buscar?q=${q}`}
                  className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-sm text-white hover:bg-white/20 hover:border-white/40 transition-all backdrop-blur-sm"
                >
                  {q}
                </Link>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white px-8 shadow-lg font-semibold">
                <Link href="/cursos"><FaGraduationCap className="mr-2 h-4 w-4" /> Explorar cursos</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 font-semibold">
                <Link href="/registro?tipo=tienda"><FaStore className="mr-2 h-4 w-4" /> Crear mi academia</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Stats bar ─── */}
        <section className="bg-primary border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: 'Estudiantes activos',   value: 50000, suffix: '+', icon: FaUsers,      color: 'text-brand-green' },
                { label: 'Cursos disponibles',    value: 2400,  suffix: '+', icon: FaBookOpen,   color: 'text-brand-orange' },
                { label: 'Academias verificadas', value: 180,   suffix: '+', icon: FaStore,      color: 'text-brand-purple' },
                { label: 'Certificados emitidos', value: 28000, suffix: '+', icon: FaAward,      color: 'text-blue-400' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1.5 text-center text-primary-foreground">
                  <s.icon className={`h-7 w-7 ${s.color}`} />
                  <div className="text-3xl font-extrabold font-heading flex items-end gap-0.5">
                    <NumberTicker value={s.value} />
                    <span className="text-2xl">{s.suffix}</span>
                  </div>
                  <span className="text-xs text-white/60 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Categories ─── */}
        <section className="py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-green font-semibold text-sm uppercase tracking-wider mb-2">Categorías</p>
                <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  Explora por área de conocimiento
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Encuentra el área que mejor se adapta a tus objetivos profesionales
                </p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary shrink-0">
                <Link href="/cursos">Ver todo <FaArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 text-center shadow-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Courses Carousel ─── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-orange font-semibold text-sm uppercase tracking-wider mb-2">Cursos destacados</p>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Los más valorados por nuestra comunidad</h2>
                <p className="mt-2 text-muted-foreground">Seleccionados por calidad, reseñas y satisfacción de estudiantes</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary shrink-0">
                <Link href="/cursos">Ver todos <FaArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <HomeCourseCarousel courses={FEATURED_COURSES} />
          </div>
        </section>

        {/* ─── Trust strip ─── */}
        <section className="py-14 bg-linear-to-br from-primary/5 to-brand-secondary/5 border-y border-border/40">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_ITEMS.map(t => (
                <div key={t.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0">
                    <t.icon className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Stores Carousel ─── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-purple font-semibold text-sm uppercase tracking-wider mb-2">Academias</p>
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">Proveedores verificados de formación</h2>
                <p className="mt-2 text-muted-foreground">Instituciones con calidad comprobada y miles de estudiantes satisfechos</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex gap-2 text-primary hover:text-primary shrink-0">
                <Link href="/tiendas">Ver todas <FaArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <HomeStoreCarousel stores={FEATURED_STORES} />
          </div>
        </section>

        {/* ─── Plans ─── */}
        <section className="py-20 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-brand-secondary font-semibold text-sm uppercase tracking-wider mb-2">Precios</p>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">Planes para academias</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Publica tus cursos y llega a miles de estudiantes. Elige el plan ideal para tu academia, sin permanencia.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              {PLANS.map(plan => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl overflow-hidden border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300 ${
                    plan.highlight
                      ? 'border-primary shadow-primary/20 ring-2 ring-primary'
                      : 'border-border/50 bg-card'
                  }`}
                >
                  {plan.highlight && (
                    <div className={`absolute inset-0 bg-linear-to-br ${plan.color} opacity-100`} />
                  )}
                  <div className={`relative flex flex-col flex-1 p-6 gap-5 ${plan.highlight ? '' : `bg-linear-to-br ${plan.color}`}`}>
                    {plan.badge && (
                      <span className="w-fit text-xs font-bold px-3 py-1 rounded-full bg-white text-primary shadow-sm">
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <h3 className={`font-heading text-lg font-bold ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
                      <div className="flex items-end gap-1 mt-2">
                        <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-primary'}`}>
                          ${plan.price}
                        </span>
                        <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>{plan.period}</span>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-white/90' : ''}`}>
                          <FaCheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-brand-green' : 'text-brand-green'}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`mt-2 w-full rounded-xl font-semibold ${
                        plan.highlight
                          ? 'bg-white text-primary hover:bg-white/90 shadow-md'
                          : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                      size="lg"
                    >
                      <Link href={`/planes#${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              ¿Tienes dudas? <Link href="/contacto" className="text-primary hover:underline font-medium">Habla con nuestro equipo</Link>
            </p>
          </div>
        </section>

        {/* ─── Dual CTA ─── */}
        <section className="py-20 bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-purple/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Buyers */}
              <div className="relative flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
                <div className="h-12 w-12 rounded-2xl bg-brand-green/20 flex items-center justify-center">
                  <FaGraduationCap className="h-6 w-6 text-brand-green" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-green">Para compradores</span>
                <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl leading-tight">
                  ¿Listo para aprender algo nuevo?
                </h2>
                <p className="text-white/65 leading-relaxed">
                  Accede a más de 2,400 cursos de academias verificadas.
                  Aprende a tu ritmo y obtén certificados reconocidos.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild size="lg" className="rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-semibold shadow-lg">
                    <Link href="/cursos">Explorar cursos <FaArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    <Link href="/registro"><FaPlay className="mr-2 h-3.5 w-3.5" /> Regístrate gratis</Link>
                  </Button>
                </div>
              </div>
              {/* Sellers */}
              <div className="relative flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
                <div className="h-12 w-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center">
                  <FaStore className="h-6 w-6 text-brand-orange" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">Para academias</span>
                <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl leading-tight">
                  ¿Tienes conocimiento que compartir?
                </h2>
                <p className="text-white/65 leading-relaxed">
                  Crea tu academia, publica tus cursos y llega a miles de estudiantes.
                  Comienza gratis, sin permanencia ni costes iniciales.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild size="lg" className="rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold shadow-lg">
                    <Link href="/registro?tipo=tienda">Crear mi academia <FaArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    <Link href="/planes">Ver planes</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
