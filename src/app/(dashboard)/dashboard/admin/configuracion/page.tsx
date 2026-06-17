'use client'

import { useState } from 'react'
import { FaCog, FaSave } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState({
    platform_name: 'EduMarket',
    support_email: 'soporte@edumarket.com',
    default_commission: '15',
    currency: 'USD',
    allow_free_courses: true,
    require_kyc: false,
    auto_publish_reviews: false,
    max_stores_per_user: '1',
    maintenance_mode: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setC(k: string, v: string | boolean) { setConfig(p => ({ ...p, [k]: v })); setSaved(false) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/v1/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      setSaved(true)
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-0.5">Parámetros globales de la plataforma</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nombre de la plataforma</Label>
            <Input value={config.platform_name} onChange={e => setC('platform_name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email de soporte</Label>
            <Input type="email" value={config.support_email} onChange={e => setC('support_email', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Moneda por defecto</Label>
            <Select value={config.currency} onValueChange={v => setC('currency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="COP">COP - Peso colombiano</SelectItem>
                <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Comisión por defecto (%)</Label>
            <Input type="number" min="0" max="100" value={config.default_commission} onChange={e => setC('default_commission', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reglas del marketplace</CardTitle>
          <CardDescription>Políticas de operación de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[
            { key: 'allow_free_courses', label: 'Permitir cursos gratuitos', desc: 'Las tiendas pueden publicar cursos sin precio' },
            { key: 'require_kyc', label: 'KYC obligatorio para tiendas', desc: 'Las tiendas deben verificar identidad para publicar' },
            { key: 'auto_publish_reviews', label: 'Auto-publicar reseñas', desc: 'Las reseñas se aprueban automáticamente sin moderación' },
            { key: 'maintenance_mode', label: 'Modo mantenimiento', desc: 'Solo admins pueden acceder a la plataforma' },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch checked={config[s.key as keyof typeof config] as boolean} onCheckedChange={v => setC(s.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Límites</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tiendas por usuario</Label>
            <Input type="number" min="1" value={config.max_stores_per_user} onChange={e => setC('max_stores_per_user', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
