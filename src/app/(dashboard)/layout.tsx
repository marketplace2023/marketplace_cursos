import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaGraduationCap } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { getNavForRole, getDashboardTitle } from '@/components/dashboard/nav-config'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login?next=/dashboard/comprador')

  const navItems = getNavForRole(session.role)
  const title = getDashboardTitle(session.role)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-background">
        {/* Logo */}
        <Link href="/" className="flex h-14 items-center gap-2 border-b px-4 font-bold text-primary hover:opacity-90 transition-opacity">
          <FaGraduationCap className="h-5 w-5 text-brand-green" />
          EduMarket
        </Link>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav items={navItems} />
        </div>

        {/* User info at bottom */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
              {session.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
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
