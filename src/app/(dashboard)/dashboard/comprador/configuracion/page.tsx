'use client'

import { useState } from 'react'
import { FaBell, FaGlobe, FaToggleOn, FaSave } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function ConfiguracionPage() {
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({
    email_enrollment: true,
    email_certificate: true,
    email_review_reply: true,
    email_order: true,
    email_promotional: false,
    push_messages: true,
    push_tickets: true,
  })
  const [display, setDisplay] = useState({
    theme: 'system',
    currency: 'USD',
  })

  function toggleNotif(key: keyof typeof notifs) {
    setNotifs(p => ({ ...p, [key]: !p[key] }))
    setSaved(false)
  }

  async function handleSave() {
    setSaved(false)
    await fetch('/api/v1/users/me/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: notifs, display }),
    })
    setSaved(true)
  }

  const NOTIF_ROWS = [
    { key: 'email_enrollment' as const, label: 'Confirmación de inscripción', desc: 'Cuando te inscribes a un nuevo curso' },
    { key: 'email_certificate' as const, label: 'Certificado disponible', desc: 'Cuando obtienes un certificado' },
    { key: 'email_review_reply' as const, label: 'Respuesta a tu reseña', desc: 'Cuando una tienda responde tu reseña' },
    { key: 'email_order' as const, label: 'Confirmación de compra', desc: 'Resumen de órdenes y pagos' },
    { key: 'email_promotional' as const, label: 'Ofertas y promociones', desc: 'Descuentos y cursos destacados' },
  ]

  const PUSH_ROWS = [
    { key: 'push_messages' as const, label: 'Mensajes directos', desc: 'Cuando recibes un mensaje nuevo' },
    { key: 'push_tickets' as const, label: 'Actualizaciones de soporte', desc: 'Cuando hay actividad en tu ticket' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-0.5">Preferencias de notificaciones y apariencia</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />
          {saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaBell className="h-4 w-4 text-brand-orange" />
            <CardTitle>Notificaciones por email</CardTitle>
          </div>
          <CardDescription>Elige qué correos quieres recibir</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {NOTIF_ROWS.map((row, i) => (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">{row.label}</Label>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch checked={notifs[row.key]} onCheckedChange={() => toggleNotif(row.key)} />
              </div>
              {i < NOTIF_ROWS.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaToggleOn className="h-4 w-4 text-primary" />
            <CardTitle>Notificaciones push</CardTitle>
          </div>
          <CardDescription>Alertas en tiempo real dentro de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {PUSH_ROWS.map((row, i) => (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">{row.label}</Label>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch checked={notifs[row.key]} onCheckedChange={() => toggleNotif(row.key)} />
              </div>
              {i < PUSH_ROWS.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaGlobe className="h-4 w-4 text-brand-secondary" />
            <CardTitle>Apariencia y moneda</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tema</Label>
            <Select value={display.theme} onValueChange={v => setDisplay(p => ({ ...p, theme: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Moneda</Label>
            <Select value={display.currency} onValueChange={v => setDisplay(p => ({ ...p, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — Dólar</SelectItem>
                <SelectItem value="COP">COP — Peso colombiano</SelectItem>
                <SelectItem value="MXN">MXN — Peso mexicano</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="ARS">ARS — Peso argentino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
