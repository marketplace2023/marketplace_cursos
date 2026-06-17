'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaGraduationCap, FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-primary mb-8">
          <FaGraduationCap className="h-8 w-8 text-brand-green" />
          EduMarket
        </Link>

        <Card className="shadow-lg">
          {sent ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <FaCheckCircle className="h-12 w-12 text-brand-green" />
                </div>
                <CardTitle className="text-2xl font-heading">Revisa tu correo</CardTitle>
                <CardDescription>
                  Si <span className="font-medium text-foreground">{email}</span> está registrado,
                  recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  ¿No lo encuentras? Revisa tu carpeta de spam o correo no deseado.
                </p>
                <Button variant="outline" className="w-full gap-2" onClick={() => setSent(false)}>
                  <FaArrowLeft className="h-4 w-4" /> Intentar con otro correo
                </Button>
                <Link href="/login" className="text-center text-sm text-primary hover:underline font-medium">
                  Volver al inicio de sesión
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading">Recupera tu contraseña</CardTitle>
                <CardDescription>
                  Ingresa tu correo y te enviaremos un enlace para restablecerla
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-primary">
                    {loading
                      ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Enviando…</>
                      : 'Enviar enlace de recuperación'}
                  </Button>
                </form>

                <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <FaArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
