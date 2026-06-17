'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FaGraduationCap, FaLock, FaEye, FaEyeSlash,
  FaSpinner, FaCheckCircle,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
]

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="flex min-h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-destructive font-medium mb-4">Enlace inválido o expirado.</p>
          <Link href="/recuperar" className="text-primary hover:underline">Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    const rulesOk = PASSWORD_RULES.every(r => r.test(password))
    if (!rulesOk) { setError('La contraseña no cumple los requisitos'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Error al restablecer la contraseña')
        return
      }
      router.push('/login?reset=1')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-primary mb-8">
          <FaGraduationCap className="h-8 w-8 text-brand-green" />
          EduMarket
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Nueva contraseña</CardTitle>
            <CardDescription>Elige una contraseña segura para tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <ul className="flex flex-col gap-1 mt-1">
                    {PASSWORD_RULES.map(rule => (
                      <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                        <FaCheckCircle
                          className={`h-3 w-3 ${rule.test(password) ? 'text-brand-green' : 'text-muted-foreground/40'}`}
                        />
                        <span className={rule.test(password) ? 'text-brand-green' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="pl-9"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                  />
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary">
                {loading
                  ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Actualizando…</>
                  : 'Actualizar contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
