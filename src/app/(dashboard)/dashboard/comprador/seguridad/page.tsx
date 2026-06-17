'use client'

import { useState } from 'react'
import { FaLock, FaShieldAlt, FaKey, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function SeguridadPage() {
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const passwordRules = [
    { label: 'Mínimo 8 caracteres', ok: pwForm.next.length >= 8 },
    { label: 'Una letra mayúscula', ok: /[A-Z]/.test(pwForm.next) },
    { label: 'Un número o símbolo', ok: /[0-9!@#$%^&*]/.test(pwForm.next) },
  ]
  const passwordStrong = passwordRules.every(r => r.ok)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordStrong) return
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ ok: false, text: 'Las contraseñas no coinciden' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwMsg({ ok: true, text: 'Contraseña actualizada correctamente' })
        setPwForm({ current: '', next: '', confirm: '' })
      } else {
        setPwMsg({ ok: false, text: data.error ?? 'Error al cambiar la contraseña' })
      }
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Seguridad</h1>
        <p className="text-muted-foreground mt-0.5">Controla el acceso y la seguridad de tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaLock className="h-4 w-4 text-brand-green" />
            <CardTitle>Cambiar contraseña</CardTitle>
          </div>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current">Contraseña actual</Label>
              <Input id="current" type="password" value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="next">Nueva contraseña</Label>
              <Input id="next" type="password" value={pwForm.next}
                onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} required />
              <ul className="flex flex-col gap-1 mt-1">
                {passwordRules.map(r => (
                  <li key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-brand-green' : 'text-muted-foreground'}`}>
                    {r.ok ? <FaCheckCircle className="h-3 w-3" /> : <FaTimesCircle className="h-3 w-3" />}
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <Input id="confirm" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
              {pwForm.confirm && pwForm.next !== pwForm.confirm && (
                <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
              )}
            </div>
            {pwMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${pwMsg.ok ? 'bg-brand-green/10 text-brand-green' : 'bg-destructive/10 text-destructive'}`}>
                {pwMsg.ok ? <FaCheckCircle className="h-4 w-4" /> : <FaTimesCircle className="h-4 w-4" />}
                {pwMsg.text}
              </div>
            )}
            <Button type="submit" disabled={pwSaving || !passwordStrong} className="w-fit bg-brand-green hover:bg-brand-green-dark text-white">
              {pwSaving ? 'Guardando…' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaShieldAlt className="h-4 w-4 text-brand-purple" />
            <CardTitle>Autenticación de dos factores (2FA)</CardTitle>
          </div>
          <CardDescription>Añade una capa extra de seguridad a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="text-xs mb-2">No activado</Badge>
            <p className="text-sm text-muted-foreground">
              Con el 2FA activo necesitarás un código adicional de tu app de autenticación al iniciar sesión.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 gap-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5">
            <FaKey className="h-4 w-4" /> Activar 2FA
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones activas</CardTitle>
          <CardDescription>Dispositivos donde tienes sesión iniciada</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Sesión actual</p>
              <p className="text-xs text-muted-foreground">Navegador web · Ahora mismo</p>
            </div>
            <Badge className="bg-brand-green/10 text-brand-green border-0">Activa</Badge>
          </div>
          <Separator />
          <Button variant="destructive" size="sm" className="w-fit" onClick={() => {
            fetch('/api/v1/auth/logout', { method: 'POST' }).then(() => { window.location.href = '/login' })
          }}>
            Cerrar todas las sesiones
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
