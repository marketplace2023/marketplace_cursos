'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaGraduationCap, FaUser, FaEnvelope, FaLock,
  FaEye, FaEyeSlash, FaGoogle, FaSpinner, FaCheckCircle,
  FaStar, FaShieldAlt, FaAward, FaBolt,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres',  test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número',   test: (p: string) => /[0-9]/.test(p) },
]

export default function RegistroPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '', last_name: '', email: '', password: '',
    terms: false, marketing: false,
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, val: string | boolean) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.terms) { setError('Debes aceptar los términos y condiciones'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, last_name: form.last_name || undefined,
          email: form.email, password: form.password,
          terms_accepted: true, marketing_consent: form.marketing,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Error al crear la cuenta')
        return
      }
      router.push('/dashboard/comprador')
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
        style={{ backgroundImage: "url('/banner-register.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="pointer-events-none absolute inset-0 bg-black/45" />

        <Link href="/" className="relative flex items-center gap-3 text-white font-bold text-2xl">
          <img src="/logo_marca.svg" alt="EduMarket" className="h-24 w-auto" />
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Comienza tu camino.<br />
            <span className="text-white/80">Es completamente gratis.</span>
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-8">
            Únete a más de 50,000 estudiantes que ya están aprendiendo y creciendo con EduMarket.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: FaShieldAlt, text: 'Academias 100% verificadas y de confianza' },
              { icon: FaAward,     text: 'Certificados digitales verificables' },
              { icon: FaBolt,     text: 'Acceso inmediato a todos tus cursos' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <item.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5">
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => <FaStar key={i} className="h-3.5 w-3.5 text-yellow-300" />)}
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed">
            "Me registré en 2 minutos y ese mismo día empecé mi curso de React. La experiencia es increíble."
          </p>
          <p className="text-white/50 text-xs mt-3">— Carlos M., Desarrollador Frontend</p>
        </div>
      </div>

      {/* ── Form panel (right) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-8 lg:hidden">
          <img src="/logo_marca.svg" alt="EduMarket" className="h-16 w-auto" />
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="font-heading text-2xl font-bold text-foreground">Crea tu cuenta gratis</h1>
            <p className="text-muted-foreground text-sm mt-1">Accede a miles de cursos desde el primer día</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-sm font-semibold">Nombre</Label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="name"
                    required
                    placeholder="Juan"
                    className="pl-9 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name" className="text-sm font-semibold">Apellido</Label>
                <Input
                  id="last_name"
                  placeholder="Pérez"
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                />
              </div>
            </div>

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
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-11 h-11 rounded-xl border-border/60 focus-visible:ring-brand-green"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <ul className="flex flex-col gap-1 mt-1 rounded-xl bg-muted/50 p-3">
                  {PASSWORD_RULES.map(rule => (
                    <li key={rule.label} className="flex items-center gap-2 text-xs">
                      <FaCheckCircle className={`h-3 w-3 shrink-0 ${rule.test(form.password) ? 'text-brand-green' : 'text-muted-foreground/30'}`} />
                      <span className={rule.test(form.password) ? 'text-brand-green font-medium' : 'text-muted-foreground'}>
                        {rule.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2.5 py-1">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={form.terms}
                  onCheckedChange={v => set('terms', Boolean(v))}
                  className="mt-0.5 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer text-muted-foreground">
                  Acepto los{' '}
                  <Link href="/terminos" className="text-primary hover:underline font-medium">Términos de uso</Link>
                  {' '}y la{' '}
                  <Link href="/privacidad" className="text-primary hover:underline font-medium">Política de privacidad</Link>
                </Label>
              </div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="marketing"
                  checked={form.marketing}
                  onCheckedChange={v => set('marketing', Boolean(v))}
                  className="mt-0.5 data-[state=checked]:bg-brand-green data-[state=checked]:border-brand-green"
                />
                <Label htmlFor="marketing" className="text-sm font-normal leading-snug cursor-pointer text-muted-foreground">
                  Quiero recibir ofertas y novedades por correo
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-11 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-semibold shadow-md"
            >
              {loading
                ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Creando cuenta…</>
                : 'Crear cuenta gratis'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground px-1">o continúa con</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full h-11 rounded-xl gap-2 border-border/60 relative" disabled>
            <FaGoogle className="h-4 w-4 text-red-500" />
            Continuar con Google
            <span className="absolute right-3 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Próximamente</span>
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-7">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
