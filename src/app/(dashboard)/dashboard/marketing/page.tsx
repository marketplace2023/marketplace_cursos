import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaBullhorn, FaTag, FaAd, FaChartLine, FaChevronRight } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_ad_campaign, marketplace_coupon, marketplace_home_section } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

export default async function MarketingPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['marketing', 'admin', 'superadmin'].includes(session.role)) redirect('/dashboard')

  const [[activeCampaignsRow], [pendingCampaignsRow], [activeCouponsRow], [sectionsRow]] = await Promise.all([
    db.select({ c: count() }).from(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.state, 'active')),
    db.select({ c: count() }).from(marketplace_ad_campaign).where(eq(marketplace_ad_campaign.state, 'pending')),
    db.select({ c: count() }).from(marketplace_coupon).where(eq(marketplace_coupon.active, true)),
    db.select({ c: count() }).from(marketplace_home_section).where(eq(marketplace_home_section.active, true)),
  ])

  const SUMMARY_STATS = [
    { label: 'Campañas activas', value: activeCampaignsRow.c, icon: FaBullhorn, gradient: 'from-primary/8 to-brand-secondary/5', iconBg: 'bg-primary', textColor: 'text-primary' },
    { label: 'Pendientes', value: pendingCampaignsRow.c, icon: FaChartLine, gradient: pendingCampaignsRow.c > 0 ? 'from-brand-orange/10 to-brand-orange/5' : 'from-muted/50 to-muted/30', iconBg: pendingCampaignsRow.c > 0 ? 'bg-brand-orange' : 'bg-muted-foreground/40', textColor: pendingCampaignsRow.c > 0 ? 'text-brand-orange' : 'text-muted-foreground' },
    { label: 'Cupones activos', value: activeCouponsRow.c, icon: FaTag, gradient: 'from-brand-green/10 to-brand-green/5', iconBg: 'bg-brand-green', textColor: 'text-brand-green' },
    { label: 'Secciones home', value: sectionsRow.c, icon: FaAd, gradient: 'from-brand-purple/10 to-brand-purple/5', iconBg: 'bg-brand-purple', textColor: 'text-brand-purple' },
  ]

  const LINKS = [
    {
      href: '/dashboard/marketing/campanas', label: 'Campañas publicitarias',
      desc: 'Gestiona anuncios y promociones de tiendas',
      icon: FaBullhorn, iconBg: 'bg-primary', gradient: 'from-primary/8 to-brand-secondary/5',
      badge: pendingCampaignsRow.c > 0 ? `${pendingCampaignsRow.c} pendientes` : undefined,
      badgeColor: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      meta: `${activeCampaignsRow.c} activas`,
    },
    {
      href: '/dashboard/marketing/cupones', label: 'Cupones de plataforma',
      desc: 'Crea y gestiona descuentos globales',
      icon: FaTag, iconBg: 'bg-brand-green', gradient: 'from-brand-green/10 to-brand-green/5',
      badge: undefined, badgeColor: '',
      meta: `${activeCouponsRow.c} activos`,
    },
    {
      href: '/dashboard/marketing/banners', label: 'Banners y home',
      desc: 'Configura las secciones de la página de inicio',
      icon: FaAd, iconBg: 'bg-brand-purple', gradient: 'from-brand-purple/10 to-brand-purple/5',
      badge: undefined, badgeColor: '',
      meta: `${sectionsRow.c} secciones activas`,
    },
    {
      href: '/dashboard/admin/seo', label: 'SEO global',
      desc: 'Metadatos, OG tags y configuración de buscadores',
      icon: FaChartLine, iconBg: 'bg-brand-orange', gradient: 'from-brand-orange/10 to-brand-orange/5',
      badge: undefined, badgeColor: '',
      meta: 'Ver configuración',
    },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-orange via-orange-400 to-brand-orange/60 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">Panel de</p>
            <h1 className="text-2xl font-heading font-bold mt-0.5">Marketing</h1>
            <p className="text-white/60 text-sm mt-1">
              Campañas, cupones y presencia en la plataforma
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-2xl bg-white/10 items-center justify-center">
            <FaBullhorn className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_STATS.map(s => (
          <Card key={s.label} className={`overflow-hidden border bg-linear-to-br ${s.gradient}`}>
            <CardContent className="p-5">
              <div className="mb-3">
                <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <NumberTicker value={s.value} className={`text-3xl font-bold tabular-nums ${s.textColor}`} />
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module cards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Módulos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="group">
              <Card className={`overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5 bg-linear-to-br ${l.gradient}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`h-11 w-11 rounded-xl ${l.iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                      <l.icon className="h-5 w-5 text-white" />
                    </div>
                    <FaChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">{l.label}</p>
                  <p className="text-xs text-muted-foreground mb-3">{l.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/70">{l.meta}</span>
                    {l.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${l.badgeColor}`}>
                        {l.badge}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
