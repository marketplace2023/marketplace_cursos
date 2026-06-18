'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaBars, FaTimes, FaBell, FaGraduationCap, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarNav } from './sidebar-nav'
import type { NavItem } from './sidebar-nav'
import { LogoutButton } from '@/components/auth/logout-button'

interface TopbarProps {
  user: { name: string; role: string; avatar_url?: string | null }
  title: string
  navItems: NavItem[]
  notifCount?: number
}

export function DashboardTopbar({ user, title, navItems, notifCount = 0 }: TopbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            {open ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-green">
              <FaGraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sidebar-foreground">EduMarket</span>
          </div>
          <div className="px-3 py-3 overflow-y-auto h-[calc(100vh-64px)]">
            <SidebarNav items={navItems} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Title */}
      <h1 className="font-semibold text-base hidden sm:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="notificaciones">
            <FaBell className="h-5 w-5" />
            {notifCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-destructive border-0">
                {notifCount > 9 ? '9+' : notifCount}
              </Badge>
            )}
          </Link>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{user.name.split(' ')[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="perfil" className="flex items-center gap-2">
                <FaUser className="h-4 w-4" /> Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="configuracion" className="flex items-center gap-2">
                <FaCog className="h-4 w-4" /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
