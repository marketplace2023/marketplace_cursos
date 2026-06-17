import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'
import { JsonLd, websiteJsonLd, organizationJsonLd } from '@/lib/seo/jsonld'

const montserrat = Montserrat({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | EduMarket',
    default: 'EduMarket — Marketplace de Cursos y Capacitación Profesional',
  },
  description: 'Descubre, compara y compra cursos de múltiples academias en un solo lugar. Formación profesional de calidad.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_US',
    siteName: 'EduMarket',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        {children}
      </body>
    </html>
  )
}
