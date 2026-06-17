import Link from 'next/link'
import { FaGraduationCap, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'

const FOOTER_LINKS = {
  'Plataforma': [
    { label: 'Sobre nosotros',    href: '/sobre-nosotros' },
    { label: 'Blog',              href: '/blog' },
    { label: 'Casos de éxito',    href: '/blog?tipo=caso-exito' },
    { label: 'Prensa',            href: '/prensa' },
    { label: 'Trabaja con nosotros', href: '/empleos' },
  ],
  'Para compradores': [
    { label: 'Cómo funciona',   href: '/ayuda/como-funciona' },
    { label: 'Catálogo',        href: '/cursos' },
    { label: 'Planes',          href: '/planes' },
    { label: 'Certificados',    href: '/ayuda/certificados' },
    { label: 'Empresas',        href: '/empresas' },
  ],
  'Para tiendas': [
    { label: 'Vender cursos',   href: '/vender' },
    { label: 'Crear tienda',    href: '/registro?tipo=tienda' },
    { label: 'Planes de tienda', href: '/planes#tiendas' },
    { label: 'Afiliados',       href: '/afiliados' },
    { label: 'Publicidad',      href: '/publicidad' },
  ],
  'Ayuda': [
    { label: 'Centro de ayuda', href: '/ayuda' },
    { label: 'FAQ',             href: '/faq' },
    { label: 'Contacto',        href: '/contacto' },
    { label: 'Estado del sistema', href: '/status' },
    { label: 'Comunidad',       href: '/comunidad' },
  ],
}

const LEGAL_LINKS = [
  { label: 'Términos de uso',     href: '/terminos' },
  { label: 'Privacidad',          href: '/privacidad' },
  { label: 'Cookies',             href: '/privacidad#cookies' },
  { label: 'Política de reembolsos', href: '/reembolsos' },
]

const SOCIAL = [
  { icon: FaFacebookF,  href: '#', label: 'Facebook' },
  { icon: FaTwitter,    href: '#', label: 'Twitter' },
  { icon: FaInstagram,  href: '#', label: 'Instagram' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube,    href: '#', label: 'YouTube' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity">
              <FaGraduationCap className="h-7 w-7 text-brand-green" />
              EduMarket
            </Link>
            <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
              El marketplace de cursos y capacitación profesional más completo de América.
            </p>
            {/* Social */}
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(s => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-brand-green transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-primary-foreground/90 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-between lg:px-8">
          <p className="text-xs text-primary-foreground/50">
            © {year} EduMarket. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {LEGAL_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
