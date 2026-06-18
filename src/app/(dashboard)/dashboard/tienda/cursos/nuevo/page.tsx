'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaImage, FaSpinner, FaTimes } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function NuevoCursoPage() {
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', subtitle: '', description: '',
    level: 'all_levels', modality: 'online_async', format: 'video',
    language: 'es', list_price: '0', is_free: false,
    has_certificate: false, currency: 'USD',
    objectives: '', requirements: '', target_audience: '',
    cover_url: '',
  })

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/v1/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.data?.url) {
        set('cover_url', data.data.url)
      } else {
        setError(data.error?.message ?? 'Error al subir la imagen')
      }
    } catch {
      setError('Error de conexión al subir imagen')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('El título es requerido'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/v1/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          list_price: form.is_free ? 0 : Number(form.list_price),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/dashboard/tienda/cursos/${data.data?.id}`)
      } else {
        setError(data.error?.message ?? 'Error al crear el curso')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/tienda/cursos"><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">Nuevo Curso</h1>
          <p className="text-muted-foreground mt-0.5">Completa la información básica de tu curso</p>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Cover image */}
      <Card>
        <CardHeader><CardTitle>Imagen de portada</CardTitle></CardHeader>
        <CardContent>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverUpload}
          />
          {form.cover_url ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border/50 group">
              <Image src={form.cover_url} alt="Portada del curso" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>
                  Cambiar
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => set('cover_url', '')}>
                  <FaTimes className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="w-full h-48 rounded-xl border-2 border-dashed border-border/60 hover:border-brand-green/60 bg-muted/30 hover:bg-brand-green/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand-green"
            >
              {uploadingCover
                ? <><FaSpinner className="h-8 w-8 animate-spin" /><span className="text-sm">Subiendo…</span></>
                : <><FaImage className="h-8 w-8" /><span className="text-sm font-medium">Haz clic para subir una imagen</span><span className="text-xs">JPG, PNG o WebP · Máx 10 MB</span></>
              }
            </button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Información básica</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Título del curso *</Label>
            <Input id="name" value={form.name} required onChange={e => set('name', e.target.value)}
              placeholder="Ej: Introducción al diseño UX/UI" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
              placeholder="Descripción corta para el catálogo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción completa</Label>
            <Textarea id="description" rows={5} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe el curso en detalle…" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nivel</Label>
              <Select value={form.level} onValueChange={v => set('level', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_levels">Todos los niveles</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Modalidad</Label>
              <Select value={form.modality} onValueChange={v => set('modality', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online_async">Online (asíncrono)</SelectItem>
                  <SelectItem value="online_sync">Online (en vivo)</SelectItem>
                  <SelectItem value="presential">Presencial</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                  <SelectItem value="recorded">Grabado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Formato</Label>
              <Select value={form.format} onValueChange={v => set('format', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="live">En vivo</SelectItem>
                  <SelectItem value="blended">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Idioma</Label>
            <Select value={form.language} onValueChange={v => set('language', v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Precio</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_free} onCheckedChange={v => set('is_free', v)} />
            <Label>Curso gratuito</Label>
          </div>
          {!form.is_free && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">Precio base</Label>
                <Input id="price" type="number" min="0" step="0.01"
                  value={form.list_price} onChange={e => set('list_price', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Moneda</Label>
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={form.has_certificate} onCheckedChange={v => set('has_certificate', v)} />
            <Label>Incluye certificado de finalización</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contenido pedagógico</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="objectives">Objetivos de aprendizaje</Label>
            <Textarea id="objectives" rows={3} value={form.objectives}
              onChange={e => set('objectives', e.target.value)}
              placeholder="Un objetivo por línea. Ej: Al finalizar el curso podrás…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="requirements">Requisitos previos</Label>
            <Textarea id="requirements" rows={2} value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
              placeholder="¿Qué debe saber el estudiante antes de empezar?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audience">Audiencia objetivo</Label>
            <Textarea id="audience" rows={2} value={form.target_audience}
              onChange={e => set('target_audience', e.target.value)}
              placeholder="¿Para quién es este curso?" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/tienda/cursos">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={saving || uploadingCover} className="bg-brand-green hover:bg-brand-green-dark text-white">
          {saving ? <><FaSpinner className="mr-2 h-4 w-4 animate-spin" />Creando…</> : 'Crear curso'}
        </Button>
      </div>
    </form>
  )
}
