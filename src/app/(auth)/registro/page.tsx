'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaGraduationCap, FaUser, FaEnvelope, FaLock,
  FaEye, FaEyeSlash, FaGoogle, FaSpinner, FaCheckCircle,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
]

export default function RegistroPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
    terms: false,
    marketing: false,
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
          name: form.name,
          last_name: form.last_name || undefined,
          email: form.email,
          password: form.password,
          terms_accepted: true,
          marketing_consent: form.marketing,
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
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-primary mb-8">
          <FaGraduationCap className="h-8 w-8 text-brand-green" />
          EduMarket
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Crea tu cuenta gratis</CardTitle>
            <CardDescription>Accede a miles de cursos desde el primer día</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      required
                      placeholder="Juan"
                      className="pl-9"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    placeholder="Pérez"
                    value={form.last_name}
                    onChange={e => set('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className="pl-9"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength indicators */}
                {form.password.length > 0 && (
                  <ul className="flex flex-col gap-1 mt-1">
                    {PASSWORD_RULES.map(rule => (
                      <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                        <FaCheckCircle
                          className={`h-3 w-3 ${rule.test(form.password) ? 'text-brand-green' : 'text-muted-foreground/40'}`}
                        />
                        <span className={rule.test(form.password) ? 'text-brand-green' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={form.terms}
                    onCheckedChange={v => set('terms', Boolean(v))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                    Acepto los{' '}
                    <Link href="/terminos" className="text-primary hover:underline">Términos de uso</Link>
                    {' '}y la{' '}
                    <Link href="/privacidad" className="text-primary hover:underline">Política de privacidad</Link>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="marketing"
                    checked={form.marketing}
                    onCheckedChange={v => set('marketing', Boolean(v))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal leading-snug cursor-pointer">
                    Quiero recibir ofertas, novedades y contenido educativo por correo
                  </Label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-brand-green hover:bg-brand-green-dark text-white">
                {loading
                  ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Creando cuenta…</>
                  : 'Crear cuenta gratis'}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" className="w-full gap-2" disabled>
              <FaGoogle className="h-4 w-4" />
              Continuar con Google
              <span className="ml-auto text-xs text-muted-foreground">Próximamente</span>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
