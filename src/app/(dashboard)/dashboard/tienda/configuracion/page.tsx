'use client'

import { useState, useEffect } from 'react'
import { FaSave, FaBell, FaGlobe } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function TiendaConfiguracionPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({
    email_new_sale: true,
    email_new_review: true,
    email_refund_request: true,
    email_new_student: false,
  })
  const [settings, setSettings] = useState({
    default_currency: 'USD',
    tax_enabled: false,
    tax_rate: '0',
    auto_publish: false,
  })

  async function handleSave() {
    setSaving(true)
    await fetch('/api/v1/stores/me/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications: notifs, settings }),
    })
    setSaved(true)
    setSaving(false)
  }

  const NOTIF_ROWS = [
    { key: 'email_new_sale' as const, label: 'Nueva venta', desc: 'Cuando alguien compra un curso' },
    { key: 'email_new_review' as const, label: 'Nueva reseña', desc: 'Cuando un estudiante deja una reseña' },
    { key: 'email_refund_request' as const, label: 'Solicitud de reembolso', desc: 'Cuando se solicita un reembolso' },
    { key: 'email_new_student' as const, label: 'Nuevo estudiante', desc: 'Resumen diario de inscripciones' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-0.5">Preferencias de la tienda</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaBell className="h-4 w-4 text-brand-orange" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
          <CardDescription>Alertas por email cuando ocurren eventos</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {NOTIF_ROWS.map((row, i) => (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">{row.label}</Label>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch checked={notifs[row.key]} onCheckedChange={v => { setNotifs(p => ({ ...p, [row.key]: v })); setSaved(false) }} />
              </div>
              {i < NOTIF_ROWS.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaGlobe className="h-4 w-4 text-primary" />
            <CardTitle>Comercial</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={settings.tax_enabled} onCheckedChange={v => setSettings(p => ({ ...p, tax_enabled: v }))} />
            <div>
              <Label className="text-sm font-medium">Cobrar impuestos</Label>
              <p className="text-xs text-muted-foreground">Aplica impuestos adicionales al precio del curso</p>
            </div>
          </div>
          {settings.tax_enabled && (
            <div className="flex flex-col gap-1.5 ml-10">
              <Label>Tasa de impuesto (%)</Label>
              <Input type="number" min="0" max="100" step="0.01" value={settings.tax_rate}
                onChange={e => setSettings(p => ({ ...p, tax_rate: e.target.value }))} className="w-28" />
            </div>
          )}
          <Separator />
          <div className="flex items-center gap-3">
            <Switch checked={settings.auto_publish} onCheckedChange={v => setSettings(p => ({ ...p, auto_publish: v }))} />
            <div>
              <Label className="text-sm font-medium">Publicación automática</Label>
              <p className="text-xs text-muted-foreground">Los cursos nuevos se publican sin revisión manual</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs">Tu plan: Gratuito</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
