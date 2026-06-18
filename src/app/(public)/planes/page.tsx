import Link from 'next/link'
import {
  FaCheckCircle, FaArrowRight, FaRocket, FaStore, FaUsers,
  FaChartLine, FaHeadset, FaShieldAlt, FaCertificate, FaBolt, FaEnvelope,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0, period: '/mes', yearlyPrice: 0,
    description: 'Perfecto para empezar a crear tu presencia digital.',
    badge: '',
    color: 'border-border/50',
    highlight: false,
    features: [
      'Hasta 5 cursos publicados',
      '1 usuario administrador',
      'Comisión del 20% por venta',
      'Panel de analítica básico',
      'Soporte por email',
    ],
    missing: ['Cupones de descuento', 'API access', 'Soporte prioritario', 'Account manager'],
    cta: 'Empezar gratis',
    ctaHref: '/registro?plan=free',
    ctaVariant: 'outline' as const,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29, period: '/mes', yearlyPrice: 23,
    description: 'Para instructores y academias en crecimiento.',
    badge: '',
    color: 'border-brand-secondary/30',
    highlight: false,
    features: [
      'Hasta 20 cursos publicados',
      '3 usuarios administradores',
      'Comisión del 15% por venta',
      'Analítica avanzada',
      'Soporte email prioritario',
      'Dominio personalizado',
    ],
    missing: ['API access', 'Account manager'],
    cta: 'Elegir Basic',
    ctaHref: '/registro?plan=basic',
    ctaVariant: 'default' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79, period: '/mes', yearlyPrice: 63,
    description: 'La opción preferida por academias consolidadas.',
    badge: 'Más popular',
    color: 'border-primary',
    highlight: true,
    features: [
      'Hasta 100 cursos publicados',
      '10 usuarios administradores',
      'Comisión del 10% por venta',
      'Analítica avanzada + exportación',
      'Soporte prioritario 24/5',
      'Cupones y códigos de descuento',
      'Dominio personalizado',
      'API access básico',
    ],
    missing: ['Account manager dedicado'],
    cta: 'Elegir Pro',
    ctaHref: '/registro?plan=pro',
    ctaVariant: 'default' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199, period: '/mes', yearlyPrice: 159,
    description: 'Solución completa para grandes instituciones.',
    badge: '',
    color: 'border-brand-purple/30',
    highlight: false,
    features: [
      'Cursos ilimitados',
      'Staff ilimitado',
      'Comisión del 7% por venta',
      'Analítica personalizada',
      'Soporte 24/7 dedicado',
      'Cupones y descuentos ilimitados',
      'Dominio personalizado',
      'API access completo',
      'Account manager dedicado',
      'SLA garantizado 99.9%',
    ],
    missing: [],
    cta: 'Contactar ventas',
    ctaHref: '/contacto?motivo=enterprise',
    ctaVariant: 'outline' as const,
  },
]

const TRUST = [
  { icon: FaShieldAlt,   title: 'Sin permanencia',      desc: 'Cancela cuando quieras, sin penalizaciones.' },
  { icon: FaBolt,        title: 'Activación inmediata',  desc: 'Tu academia activa al instante, sin esperas.' },
  { icon: FaCertificate, title: 'Pago seguro',           desc: 'SSL y cifrado de extremo a extremo en todos los pagos.' },
  { icon: FaHeadset,     title: 'Soporte en español',   desc: 'Equipo de soporte en tu idioma, listo para ayudarte.' },
]

const FAQS = [
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes subir o bajar de plan cuando quieras. Al subir, el cobro se prorratea. Al bajar, el cambio se aplica al siguiente ciclo.' },
  { q: '¿Cómo funciona la comisión?', a: 'La comisión se descuenta automáticamente de cada venta. El resto se acredita en tu balance para retirar cuando quieras.' },
  { q: '¿Hay algún costo de configuración?', a: 'No. Todos los planes incluyen la configuración inicial de tu academia sin costo adicional.' },
  { q: '¿Qué pasa si supero el límite de cursos?', a: 'Recibirás una notificación antes de alcanzar el límite. Puedes subir de plan fácilmente o archivar cursos inactivos.' },
  { q: '¿Hay descuento por pago anual?', a: 'Sí. Al pagar anualmente obtienes aproximadamente 20% de descuento sobre el precio mensual.' },
]

export default function PlanesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary py-20 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-brand-purple/10 blur-3xl" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-5 bg-brand-green/20 text-brand-green border-brand-green/30 px-4 py-1.5 text-sm">
            <FaRocket className="h-3 w-3 mr-1.5" /> Sin comisiones de suscripción — solo paga cuando vendes
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl lg:text-6xl mb-5">
            Planes para academias
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70 leading-relaxed">
            Publica tus cursos, llega a miles de estudiantes y haz crecer tu academia.
            Elige el plan que mejor se adapta a tu negocio — sin permanencia.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-20 bg-muted/20" id="planes">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                id={plan.id}
                className={`relative flex flex-col rounded-3xl border-2 bg-card shadow-sm overflow-hidden transition-all hover:shadow-xl ${
                  plan.highlight ? 'border-primary ring-2 ring-primary shadow-primary/20' : plan.color
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-brand-green to-primary" />
                )}
                <div className="p-6 flex flex-col flex-1 gap-5">
                  {plan.badge && (
                    <Badge className="w-fit bg-brand-green text-white border-0 text-xs font-bold">
                      {plan.badge}
                    </Badge>
                  )}
                  <div>
                    <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground text-xs mt-1 leading-snug">{plan.description}</p>
                    <div className="flex items-end gap-1 mt-3">
                      <span className="text-4xl font-extrabold text-primary">${plan.price}</span>
                      <span className="text-muted-foreground text-sm mb-1.5">{plan.period}</span>
                    </div>
                    {plan.yearlyPrice > 0 && (
                      <p className="text-xs text-brand-green font-medium mt-0.5">
                        ${plan.yearlyPrice}/mes si pagas anual
                      </p>
                    )}
                  </div>

                  <ul className="flex flex-col gap-2 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <FaCheckCircle className="h-3.5 w-3.5 shrink-0 text-brand-green mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50 line-through">
                        <FaCheckCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/20 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className={`w-full rounded-xl font-semibold ${
                      plan.highlight ? 'bg-primary hover:bg-primary/90 text-white shadow-md' : ''
                    }`}
                    variant={plan.ctaVariant}
                  >
                    <Link href={plan.ctaHref}>{plan.cta} <FaArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-14 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST.map(t => (
              <div key={t.title} className="flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <t.icon className="h-5 w-5 text-primary" />
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

      {/* Features comparison */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl mb-3">¿Por qué elegir EduMarket?</h2>
            <p className="text-muted-foreground">Todo lo que necesitas para hacer crecer tu academia</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: FaStore,    title: 'Tu tienda, tu marca', desc: 'Personaliza tu página de academia con logo, descripción y dominio propio.' },
              { icon: FaUsers,   title: 'Audiencia masiva',    desc: 'Accede de inmediato a nuestra comunidad de más de 50,000 estudiantes activos.' },
              { icon: FaChartLine, title: 'Analítica completa', desc: 'Entiende quiénes son tus estudiantes, qué compran y cómo mejorar tus ventas.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-5 w-5 text-brand-green" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-10">Preguntas frecuentes</h2>
          <div className="flex flex-col gap-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <span className="text-brand-green shrink-0 mt-0.5">?</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 bg-linear-to-br from-primary to-brand-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-3">¿Necesitas una solución personalizada?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Para instituciones educativas, universidades o grandes empresas tenemos planes Enterprise a medida.
          </p>
          <Button asChild size="lg" className="rounded-xl bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
            <Link href="/contacto?motivo=enterprise">
              <FaEnvelope className="mr-2 h-4 w-4" /> Hablar con ventas
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
