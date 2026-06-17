'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function VerificarPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch('/api/v1/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => setStatus(d.success ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-primary mb-8">
          <FaGraduationCap className="h-8 w-8 text-brand-green" />
          EduMarket
        </Link>

        <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-3">
              {status === 'loading' && <FaSpinner className="h-12 w-12 text-muted-foreground animate-spin" />}
              {status === 'success' && <FaCheckCircle className="h-12 w-12 text-brand-green" />}
              {status === 'error' && <FaTimesCircle className="h-12 w-12 text-destructive" />}
            </div>
            <CardTitle className="text-2xl font-heading">
              {status === 'loading' && 'Verificando…'}
              {status === 'success' && '¡Correo verificado!'}
              {status === 'error' && 'Enlace inválido'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Estamos verificando tu correo electrónico'}
              {status === 'success' && 'Tu cuenta ha sido verificada correctamente. Ya puedes acceder a todos los cursos.'}
              {status === 'error' && 'El enlace es inválido o ha expirado. Solicita uno nuevo desde tu perfil.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' && (
              <Button asChild className="w-full bg-brand-green hover:bg-brand-green-dark text-white">
                <Link href="/dashboard/comprador">Ir a mi cuenta</Link>
              </Button>
            )}
            {status === 'error' && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Volver al inicio</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
