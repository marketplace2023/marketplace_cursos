import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBullhorn, FaTag, FaChartLine, FaAd } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_coupon, marketplace_home_section } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function MarketingPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['marketing', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [activeCampaignsRow] = await db.select({ c: count() }).from(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.state, 'active'))
  const [pendingCampaignsRow] = await db.select({ c: count() }).from(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.state, 'pending'))
  const [activeCouponsRow] = await db.select({ c: count() }).from(marketplace_coupon).where(eq(marketplace_coupon.active, true))
  const [sectionsRow] = await db.select({ c: count() }).from(marketplace_home_section).where(eq(marketplace_home_section.active, true))

  const LINKS = [
    { href: '/dashboard/marketing/campanas', label: 'Campañas publicitarias', desc: 'Gestiona anuncios de tiendas', icon: FaBullhorn, value: `${activeCampaignsRow.c} activas · ${pendingCampaignsRow.c} pendientes`, color: 'text-primary', bg: 'bg-primary/10' },
    { href: '/dashboard/marketing/cupones', label: 'Cupones de plataforma', desc: 'Crea y gestiona descuentos globales', icon: FaTag, value: `${activeCouponsRow.c} activos`, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { href: '/dashboard/marketing/banners', label: 'Banners y home', desc: 'Configura secciones de inicio', icon: FaAd, value: `${sectionsRow.c} secciones activas`, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { href: '/dashboard/admin/seo', label: 'SEO global', desc: 'Metadatos y configuración SEO', icon: FaChartLine, value: 'Ver metadatos', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Marketing</h1>
        <p className="text-muted-foreground mt-0.5">Gestión de campañas, cupones y presencia en la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map(l => (
          <Card key={l.href} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${l.bg} ${l.color} flex items-center justify-center shrink-0`}>
                  <l.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{l.value}</p>
                <Button asChild variant="outline" size="sm" className="text-xs h-7">
                  <Link href={l.href}>Gestionar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
