'use client'

import { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaSave, FaGlobe } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function TiendaFurGbpPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    commercial_name: '', legal_name: '', entity_type: '',
    phone: '', email: '', website: '', gbp_url: '',
    address: '', city: '', state_province: '', country: 'CO', zip: '',
    latitude: '', longitude: '',
    description: '', modality: 'online', languages: '["es"]',
    business_hours: '', service_area: '',
  })

  function set(field: string, value: string) { setForm(p => ({ ...p, [field]: value })); setSaved(false) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/stores/me/fur-gbp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">FUR-GBP — Perfil de negocio</h1>
          <p className="text-muted-foreground mt-0.5">Datos para presencia en directorios y Google Business Profile</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><FaGlobe className="h-4 w-4 text-primary" /><CardTitle>Identidad del negocio</CardTitle></div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'commercial_name', label: 'Nombre comercial', placeholder: 'Academia Ejemplo' },
            { id: 'legal_name', label: 'Razón social', placeholder: 'Ejemplo SAS' },
            { id: 'entity_type', label: 'Tipo de entidad', placeholder: 'SAS, Autónomo, ONG…' },
            { id: 'gbp_url', label: 'URL de Google Business', placeholder: 'https://g.co/…' },
            { id: 'website', label: 'Sitio web', placeholder: 'https://…' },
            { id: 'email', label: 'Email de negocio', placeholder: 'info@…' },
            { id: 'phone', label: 'Teléfono', placeholder: '+57 300…' },
            { id: 'modality', label: 'Modalidad', placeholder: 'online / presential / hybrid' },
          ].map(f => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} value={(form as any)[f.id]} onChange={e => set(f.id, e.target.value)} placeholder={f.placeholder} />
            </div>
          ))}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción del negocio</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><FaMapMarkerAlt className="h-4 w-4 text-brand-orange" /><CardTitle>Ubicación</CardTitle></div>
          <CardDescription>Dirección física para directorios y mapas</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'address', label: 'Dirección', span: true },
            { id: 'city', label: 'Ciudad' },
            { id: 'state_province', label: 'Departamento / Estado' },
            { id: 'country', label: 'País (código ISO)' },
            { id: 'zip', label: 'Código postal' },
            { id: 'latitude', label: 'Latitud' },
            { id: 'longitude', label: 'Longitud' },
          ].map(f => (
            <div key={f.id} className={`flex flex-col gap-1.5 ${(f as any).span ? 'sm:col-span-2' : ''}`}>
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} value={(form as any)[f.id]} onChange={e => set(f.id, e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  )
}
