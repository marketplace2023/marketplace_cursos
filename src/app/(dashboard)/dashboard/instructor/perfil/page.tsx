'use client'

import { useState, useEffect } from 'react'
import { FaChalkboardTeacher, FaSave } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function InstructorPerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    headline: '', expertise: '', credentials: '',
    linkedin_url: '', portfolio_url: '',
    bio: '', name: '', public_name: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/auth/me').then(r => r.json()),
      fetch('/api/v1/instructors/me').then(r => r.json()).catch(() => ({ data: null })),
    ]).then(([me, inst]) => {
      setForm(prev => ({
        ...prev,
        name: me.user?.name ?? '',
        bio: me.user?.bio ?? '',
        public_name: me.user?.public_name ?? '',
        headline: inst.data?.headline ?? '',
        expertise: Array.isArray(inst.data?.expertise) ? inst.data.expertise.join(', ') : (inst.data?.expertise ?? ''),
        linkedin_url: inst.data?.linkedin_url ?? '',
        portfolio_url: inst.data?.portfolio_url ?? '',
      }))
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) { setForm(p => ({ ...p, [field]: value })); setSaved(false) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/v1/users/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, public_name: form.public_name, bio: form.bio }),
        }),
        fetch('/api/v1/instructors/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headline: form.headline,
            expertise: form.expertise.split(',').map(e => e.trim()).filter(Boolean),
            linkedin_url: form.linkedin_url,
            portfolio_url: form.portfolio_url,
          }),
        }),
      ])
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-48 bg-muted rounded-xl animate-pulse" />

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Perfil de instructor</h1>
          <p className="text-muted-foreground mt-0.5">Visible para los estudiantes en los cursos</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="public_name">Nombre público</Label>
              <Input id="public_name" value={form.public_name} onChange={e => set('public_name', e.target.value)} placeholder="Como aparece en el sitio" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="headline">Título profesional</Label>
            <Input id="headline" value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="Ej: Desarrollador Full Stack con 10 años de experiencia" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Cuéntales a tus estudiantes quién eres…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expertise">Áreas de especialidad</Label>
            <Input id="expertise" value={form.expertise} onChange={e => set('expertise', e.target.value)} placeholder="React, Node.js, Python (separadas por coma)" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes profesionales</CardTitle>
          <CardDescription>Aparecen en tu ficha de instructor</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portfolio">Portfolio / Web personal</Label>
            <Input id="portfolio" type="url" value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://…" />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
