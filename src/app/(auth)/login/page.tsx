'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FaGraduationCap, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaGoogle, FaSpinner, FaStar, FaUsers, FaBookOpen, FaAward,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard/comprador'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Credenciales incorrectas')
        return
      }
      router.push(getDashboardForRole(data.data?.role) ?? next)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel (left) ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between overflow-hidden p-12"
        style={{ backgroundImage: "url('/banne-login.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="pointer-events-none absolute inset-0 bg-black/45" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 text-white font-bold text-2xl">
          <img src="/logo_marca.svg" alt="EduMarket" className="h-24 w-auto" />
        </Link>

        {/* Middle content */}
        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Aprende de los mejores.<br />
            <span className="text-brand-green">Crece profesionalmente.</span>
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-8">
            Accede a miles de cursos de academias verificadas y potencia tu carrera profesional.
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: FaUsers,    value: '50,000+', label: 'Estudiantes' },
              { icon: FaBookOpen, value: '2,400+',  label: 'Cursos' },
              { icon: FaAward,    value: '180+',    label: 'Academias' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-2.5">
                <s.icon className="h-4 w-4 text-brand-green" />
                <span className="text-white font-bold text-sm">{s.value}</span>
                <span className="text-white/55 text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5">
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => <FaStar key={i} className="h-3.5 w-3.5 text-brand-orange" />)}
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed">
            "Gracias a EduMarket encontré el curso perfecto para dar el salto que necesitaba en mi carrera."
          </p>
          <p className="text-white/50 text-xs mt-3">— María G., Diseñadora UX</p>
        </div>
      </div>

      {/* ── Form panel (right) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-8 lg:hidden">
          <img src="/logo_marca.svg" alt="EduMarket" className="h-16 w-auto" />
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground text-sm mt-1">Ingresa a tu cuenta para continuar aprendiendo</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Correo electrónico</Label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="pl-10 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                <Link href="/recuperar" className="text-xs text-primary hover:text-primary/80 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-11 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Mostrar contraseña"
                >
                  {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
            >
              {loading ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Ingresando…</> : 'Ingresar'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground px-1">o continúa con</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full h-11 rounded-xl gap-2 border-border/60 relative" disabled>
            <FaGoogle className="h-4 w-4 text-red-500" />
            Continuar con Google
            <span className="absolute right-3 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Próximamente</span>
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-semibold text-primary hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}

function getDashboardForRole(role?: string): string {
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
  return map[role ?? ''] ?? '/dashboard/comprador'
}
