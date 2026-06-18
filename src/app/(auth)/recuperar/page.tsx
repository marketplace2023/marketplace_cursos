'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaGraduationCap, FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft, FaKey } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Error al enviar el correo')
        return
      }
      setSent(true)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-center items-center bg-linear-to-br from-primary via-[#0d3a6e] to-brand-secondary overflow-hidden p-12">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 -left-20 h-64 w-64 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="relative text-center max-w-xs">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white mb-12">
            <div className="h-10 w-10 rounded-xl bg-brand-green flex items-center justify-center">
              <FaGraduationCap className="h-5 w-5 text-white" />
            </div>
            EduMarket
          </Link>
          <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <FaKey className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¿Olvidaste tu contraseña?</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            No te preocupes. Ingresa tu correo y te enviaremos un enlace seguro para restablecerla en minutos.
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
          {sent ? (
            <div className="flex flex-col items-center text-center gap-5">
              <div className="h-20 w-20 rounded-3xl bg-brand-green/10 flex items-center justify-center">
                <FaCheckCircle className="h-10 w-10 text-brand-green" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold mb-2">Revisa tu correo</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Si <span className="font-semibold text-foreground">{email}</span> está registrado,
                  recibirás un enlace de recuperación en los próximos minutos.
                </p>
              </div>
              <div className="w-full rounded-xl bg-muted/50 border border-border/50 p-4 text-sm text-muted-foreground">
                ¿No lo encuentras? Revisa tu carpeta de <strong>spam</strong> o correo no deseado.
              </div>
              <Button variant="outline" className="w-full h-11 rounded-xl gap-2" onClick={() => setSent(false)}>
                <FaArrowLeft className="h-4 w-4" /> Intentar con otro correo
              </Button>
              <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-heading text-2xl font-bold text-foreground">Recupera tu contraseña</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Ingresa tu correo y te enviaremos un enlace para restablecerla
                </p>
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

                <Button type="submit" disabled={loading} size="lg" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
                  {loading
                    ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Enviando…</>
                    : 'Enviar enlace de recuperación'}
                </Button>
              </form>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-6">
                <FaArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
