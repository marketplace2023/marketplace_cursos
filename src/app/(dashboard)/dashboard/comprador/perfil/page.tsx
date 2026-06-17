'use client'

import { useState, useEffect } from 'react'
import { FaUser, FaCamera, FaSave } from 'react-icons/fa'
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

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Buenos_Aires',
  'Europe/Madrid', 'Europe/London', 'UTC',
]

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

const COUNTRIES = [
  { value: 'CO', label: 'Colombia' }, { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' }, { value: 'PE', label: 'Perú' },
  { value: 'CL', label: 'Chile' }, { value: 'US', label: 'United States' },
  { value: 'ES', label: 'España' }, { value: 'VE', label: 'Venezuela' },
]

export default function PerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '', last_name: '', public_name: '', username: '',
    email: '', phone: '', bio: '', website: '',
    avatar_url: '', timezone: 'America/New_York', language: 'es', country: 'CO',
  })

  useEffect(() => {
    fetch('/api/v1/auth/me').then(r => r.json()).then(data => {
      if (data.user) setForm(prev => ({ ...prev, ...data.user }))
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, last_name: form.last_name,
          public_name: form.public_name, username: form.username,
          phone: form.phone, bio: form.bio, website: form.website,
          timezone: form.timezone, language: form.language, country: form.country,
        }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const initials = `${form.name?.[0] ?? ''}${form.last_name?.[0] ?? ''}`.toUpperCase()

  if (loading) return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-64 bg-muted rounded-xl animate-pulse" />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-0.5">Actualiza tu información personal</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />
          {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Foto de perfil</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.avatar_url} />
              <AvatarFallback className="text-2xl bg-brand-green/10 text-brand-green">
                {initials || <FaUser />}
              </AvatarFallback>
            </Avatar>
            <button type="button" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
              <FaCamera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{form.name} {form.last_name}</p>
            <Badge variant="secondary" className="w-fit capitalize">{form.email}</Badge>
            <p className="text-xs text-muted-foreground">JPG, PNG o GIF. Máx. 2 MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="last_name">Apellido</Label>
            <Input id="last_name" value={form.last_name ?? ''} onChange={e => set('last_name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="public_name">Nombre público</Label>
            <Input id="public_name" value={form.public_name ?? ''} onChange={e => set('public_name', e.target.value)} placeholder="Nombre visible en el sitio" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={form.username ?? ''} onChange={e => set('username', e.target.value)} placeholder="@username" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={form.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="+57 300 000 0000" />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" value={form.bio ?? ''} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Cuéntanos un poco sobre ti…" />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" type="url" value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://mipagina.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias regionales</CardTitle>
          <CardDescription>Zona horaria, idioma y país para tu experiencia</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Idioma</Label>
            <Select value={form.language} onValueChange={v => set('language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>País</Label>
            <Select value={form.country} onValueChange={v => set('country', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Zona horaria</Label>
            <Select value={form.timezone} onValueChange={v => set('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIMEZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
