'use client'

import { useState, useEffect } from 'react'
import { FaStore, FaSave, FaCamera } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function TiendaPerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', legal_name: '', description: '', email: '', phone: '', website: '',
    country: 'CO', city: '', address: '', modality: 'online',
    refund_policy: '', support_policy: '',
    logo_url: '', cover_url: '',
  })

  useEffect(() => {
    fetch('/api/v1/stores/me').then(r => r.json()).then(d => {
      if (d.data) {
        setStore(d.data)
        setForm(prev => ({ ...prev, ...d.data }))
      }
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/stores/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Perfil de la tienda</h1>
          <p className="text-muted-foreground mt-0.5">Información pública de tu escuela o academia</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Identidad</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-xl">
                <AvatarImage src={form.logo_url} />
                <AvatarFallback className="rounded-xl bg-brand-green/10 text-brand-green text-2xl">
                  <FaStore />
                </AvatarFallback>
              </Avatar>
              <button type="button" className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                <FaCamera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input id="logo_url" type="url" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cover_url">URL de portada</Label>
            <Input id="cover_url" type="url" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://… (imagen ancha para el banner)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre de la tienda *</Label>
              <Input id="name" value={form.name} required onChange={e => set('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="legal_name">Razón social</Label>
              <Input id="legal_name" value={form.legal_name ?? ''} onChange={e => set('legal_name', e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={4} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Describe tu escuela o academia…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Modalidad</Label>
            <Select value={form.modality ?? 'online'} onValueChange={v => set('modality', v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="presential">Presencial</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email de contacto</Label>
            <Input id="email" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" value={form.city ?? ''} onChange={e => set('city', e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas</CardTitle>
          <CardDescription>Visibles para los compradores en tu ficha de tienda</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="refund_policy">Política de reembolso</Label>
            <Textarea id="refund_policy" rows={3} value={form.refund_policy ?? ''} onChange={e => set('refund_policy', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="support_policy">Política de soporte</Label>
            <Textarea id="support_policy" rows={3} value={form.support_policy ?? ''} onChange={e => set('support_policy', e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
