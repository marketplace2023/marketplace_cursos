'use client'

import { useRouter } from 'next/navigation'
import { FaSignOutAlt } from 'react-icons/fa'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className ?? 'flex w-full items-center gap-2 text-destructive'}
    >
      <FaSignOutAlt className="h-4 w-4" /> Cerrar sesión
    </button>
  )
}
