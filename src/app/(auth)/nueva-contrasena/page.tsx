'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FaGraduationCap, FaLock, FaEye, FaEyeSlash,
  FaSpinner, FaCheckCircle, FaShieldAlt,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres',   test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número',    test: (p: string) => /[0-9]/.test(p) },
]

export default function NuevaContrasenaPage() {
  return <Suspense><NuevaContrasenaInner /></Suspense>
}

function NuevaContrasenaInner() {
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
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex flex-col items-center text-center gap-4 max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <FaShieldAlt className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-heading text-xl font-bold">Enlace inválido o expirado</h1>
          <p className="text-muted-foreground text-sm">Este enlace ya no es válido. Solicita uno nuevo para restablecer tu contraseña.</p>
          <Link href="/recuperar" className="text-primary hover:underline font-medium text-sm">
            Solicitar nuevo enlace
          </Link>
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
    <div className="flex min-h-screen">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-center items-center bg-linear-to-br from-brand-purple via-[#5c3aa5] to-primary overflow-hidden p-12">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 -left-20 h-64 w-64 rounded-full bg-brand-secondary/20 blur-3xl" />
        <div className="relative text-center max-w-xs">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-12">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FaGraduationCap className="h-5 w-5 text-white" />
            </div>
            EduMarket
          </Link>
          <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Elige una contraseña segura</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Usa al menos 8 caracteres, una mayúscula y un número para proteger tu cuenta.
          </p>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-8 lg:hidden">
          <div className="h-9 w-9 rounded-xl bg-brand-green flex items-center justify-center">
            <FaGraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          EduMarket
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">Nueva contraseña</h1>
            <p className="text-muted-foreground text-sm mt-1">Elige una contraseña segura para tu cuenta</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Nueva contraseña</Label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-11 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1 rounded-xl bg-muted/50 p-3">
                  {PASSWORD_RULES.map(rule => (
                    <li key={rule.label} className="flex items-center gap-2 text-xs">
                      <FaCheckCircle className={`h-3 w-3 shrink-0 ${rule.test(password) ? 'text-brand-green' : 'text-muted-foreground/30'}`} />
                      <span className={rule.test(password) ? 'text-brand-green font-medium' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm" className="text-sm font-semibold">Confirmar contraseña</Label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
              </div>
              {confirm.length > 0 && password !== confirm && (
                <p className="text-xs text-destructive mt-0.5">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-11 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold shadow-md"
            >
              {loading
                ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Actualizando…</>
                : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
