'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FaHome, FaBookOpen, FaShoppingBag, FaHeart, FaCertificate,
  FaUserCircle, FaCog, FaBell, FaComments, FaLifeRing,
  FaStore, FaPlus, FaChartBar, FaMoneyBillWave, FaUsers,
  FaStar, FaBullhorn, FaClipboardList, FaFileInvoice,
  FaShieldAlt, FaSearchDollar, FaGavel, FaDatabase,
  FaUserTie, FaBuilding, FaTicketAlt, FaTags, FaPercent,
  FaLayerGroup, FaChartLine, FaUsersCog, FaLock,
  FaCreditCard, FaListAlt, FaCalendarAlt, FaQuestion,
  FaStickyNote, FaWallet,
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import type { IconType } from 'react-icons'

const ICON_MAP: Record<string, IconType> = {
  FaHome, FaBookOpen, FaShoppingBag, FaHeart, FaCertificate,
  FaUserCircle, FaCog, FaBell, FaComments, FaLifeRing,
  FaStore, FaPlus, FaChartBar, FaMoneyBillWave, FaUsers,
  FaStar, FaBullhorn, FaClipboardList, FaFileInvoice,
  FaShieldAlt, FaSearchDollar, FaGavel, FaDatabase,
  FaUserTie, FaBuilding, FaTicketAlt, FaTags, FaPercent,
  FaLayerGroup, FaChartLine, FaUsersCog, FaLock,
  FaCreditCard, FaListAlt, FaCalendarAlt, FaQuestion,
  FaStickyNote, FaWallet,
}

export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: number | string
  children?: NavItem[]
}

interface SidebarNavProps {
  items: NavItem[]
  dark?: boolean
}

export function SidebarNav({ items, dark = true }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = ICON_MAP[item.icon] ?? FaHome

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              dark
                ? active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/65 hover:bg-white/8 hover:text-sidebar-foreground'
                : active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-150',
              active && 'scale-110',
            )} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums',
                dark
                  ? active
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-sidebar-foreground/80'
                  : active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary/10 text-primary'
              )}>
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
