'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FaSearch, FaBell, FaHeart, FaShoppingCart, FaBars, FaTimes,
  FaChevronDown, FaUser, FaGraduationCap, FaStore, FaSignOutAlt,
  FaCog, FaBookOpen
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetTrigger,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { label: 'Cursos',        href: '/cursos' },
  { label: 'Tiendas',       href: '/tiendas' },
  { label: 'Instructores',  href: '/instructores' },
  { label: 'Promociones',   href: '/promociones' },
  { label: 'Planes',        href: '/planes' },
]

interface HeaderProps {
  user?: { name: string; role: string } | null
  cartCount?: number
  notifCount?: number
}

export function Header({ user, cartCount = 0, notifCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardHref = user ? getDashboardHref(user.role) : '/login'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-4 px-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-xl text-primary-foreground hover:opacity-90 transition-opacity">
          <FaGraduationCap className="h-7 w-7 text-brand-green" />
          <span className="hidden sm:inline">EduMarket</span>
        </Link>

        {/* Search — desktop */}
        <form
          onSubmit={(e) => { e.preventDefault(); window.location.href = `/buscar?q=${encodeURIComponent(searchQuery)}` }}
          className="relative hidden flex-1 max-w-lg md:flex"
        >
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos, tiendas, instructores…"
            className="pl-9 bg-white text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-2 focus-visible:ring-brand-green rounded-full"
          />
        </form>

        {/* Nav links — desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">

          {/* Notifications */}
          {user && (
            <Link href={`${dashboardHref}/notificaciones`} className="relative p-2 rounded-md hover:bg-white/10 transition-colors">
              <FaBell className="h-5 w-5 text-primary-foreground/80" />
              {notifCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-brand-orange border-0">
                  {notifCount > 9 ? '9+' : notifCount}
                </Badge>
              )}
            </Link>
          )}

          {/* Favorites */}
          {user && (
            <Link href={`${dashboardHref}/favoritos`} className="p-2 rounded-md hover:bg-white/10 transition-colors">
              <FaHeart className="h-5 w-5 text-primary-foreground/80" />
            </Link>
          )}

          {/* Cart */}
          <Link href="/carrito" className="relative p-2 rounded-md hover:bg-white/10 transition-colors">
            <FaShoppingCart className="h-5 w-5 text-primary-foreground/80" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-brand-green border-0">
                {cartCount}
              </Badge>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-white text-sm font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm">{user.name.split(' ')[0]}</span>
                  <FaChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="flex items-center gap-2">
                    <FaUser className="h-4 w-4" /> Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${dashboardHref}/cursos`} className="flex items-center gap-2">
                    <FaBookOpen className="h-4 w-4" /> Mis cursos
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'store_owner' || user.role === 'admin') && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/tienda" className="flex items-center gap-2">
                      <FaStore className="h-4 w-4" /> Mi tienda
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`${dashboardHref}/configuracion`} className="flex items-center gap-2">
                    <FaCog className="h-4 w-4" /> Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/v1/auth/logout" method="POST">
                    <button type="submit" className="flex w-full items-center gap-2 text-destructive">
                      <FaSignOutAlt className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground hidden sm:flex">
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white border-0">
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground hover:bg-white/10">
                {mobileOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 pt-4">
                {/* Mobile search */}
                <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/buscar?q=${encodeURIComponent(searchQuery)}`; setMobileOpen(false) }} className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar cursos…"
                    className="pl-9"
                  />
                </form>
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <div className="my-2 border-t" />
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>Ingresar</Link>
                    </Button>
                    <Button asChild className="w-full bg-brand-green hover:bg-brand-green-dark text-white">
                      <Link href="/registro" onClick={() => setMobileOpen(false)}>Registrarse</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function getDashboardHref(role: string): string {
  const map: Record<string, string> = {
    buyer: '/dashboard/comprador',
    store_owner: '/dashboard/tienda',
    instructor: '/dashboard/instructor',
    admin: '/dashboard/admin',
    superadmin: '/dashboard/admin',
    support: '/dashboard/soporte',
    marketing: '/dashboard/marketing',
    finance: '/dashboard/finanzas',
    compliance: '/dashboard/compliance',
    b2b_user: '/dashboard/corporativo',
  }
  return map[role] ?? '/dashboard/comprador'
}
