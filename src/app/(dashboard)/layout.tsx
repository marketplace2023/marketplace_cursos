import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaGraduationCap } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { getNavForRole, getDashboardTitle } from '@/components/dashboard/nav-config'

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Estudiante', store_owner: 'Academia', instructor: 'Instructor',
  admin: 'Administrador', superadmin: 'Super Admin', support: 'Soporte',
  marketing: 'Marketing', finance: 'Finanzas', compliance: 'Compliance',
  analyst: 'Analista', b2b_user: 'Corporativo',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login?next=/dashboard/comprador')

  const navItems = getNavForRole(session.role)
  const title = getDashboardTitle(session.role)
  const initials = session.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="flex min-h-screen">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">

        {/* Logo */}
        <Link
          href="/"
          className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border hover:opacity-90 transition-opacity"
        >
          <img src="/logo_marca.svg" alt="EduMarket" className="h-16 w-auto" />
        </Link>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          <SidebarNav items={navItems} />
        </div>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3 cursor-default">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-brand-green to-brand-secondary flex items-center justify-center text-white text-sm font-bold shadow-md">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-green border-2 border-sidebar" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{session.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {ROLE_LABELS[session.role] ?? session.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopbar
          user={{ name: session.name, role: session.role }}
          title={title}
          navItems={navItems}
        />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
