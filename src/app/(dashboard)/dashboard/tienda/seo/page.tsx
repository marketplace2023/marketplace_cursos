'use client'

import { useState } from 'react'
import { FaSearch, FaSave } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function TiendaSeoPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    meta_title: '', meta_description: '', og_title: '', og_description: '', og_image: '',
  })

  function set(field: string, value: string) { setForm(p => ({ ...p, [field]: value })); setSaved(false) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/v1/stores/me/seo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setSaving(false)
  }

  const titleLen = form.meta_title.length
  const descLen = form.meta_description.length

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">SEO</h1>
          <p className="text-muted-foreground mt-0.5">Optimiza tu tienda para motores de búsqueda</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      {/* Preview */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Vista previa en Google</p>
          <p className="text-blue-600 text-sm truncate">{form.meta_title || 'Título de tu tienda'}</p>
          <p className="text-green-700 text-xs">furcompany.com/tiendas/tu-tienda</p>
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{form.meta_description || 'Descripción de tu tienda para los buscadores…'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><FaSearch className="h-4 w-4 text-primary" /><CardTitle>Meta tags</CardTitle></div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_title">Meta título</Label>
              <Badge variant={titleLen > 60 ? 'destructive' : 'secondary'} className="text-xs">{titleLen}/60</Badge>
            </div>
            <Input id="meta_title" value={form.meta_title} onChange={e => set('meta_title', e.target.value)} maxLength={70} placeholder="Mi Academia de Cursos" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_desc">Meta descripción</Label>
              <Badge variant={descLen > 160 ? 'destructive' : 'secondary'} className="text-xs">{descLen}/160</Badge>
            </div>
            <Textarea id="meta_desc" rows={3} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} maxLength={200} placeholder="Aprende con los mejores cursos de…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Open Graph (redes sociales)</CardTitle><CardDescription>Cómo se ve cuando compartes en redes</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="og_title">OG Título</Label>
            <Input id="og_title" value={form.og_title} onChange={e => set('og_title', e.target.value)} placeholder="Igual al meta título o personalizado" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="og_desc">OG Descripción</Label>
            <Textarea id="og_desc" rows={2} value={form.og_description} onChange={e => set('og_description', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="og_image">OG Imagen (URL)</Label>
            <Input id="og_image" type="url" value={form.og_image} onChange={e => set('og_image', e.target.value)} placeholder="https://… (1200×630 px recomendado)" />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
