'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: number | string
  children?: NavItem[]
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold',
                active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
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
