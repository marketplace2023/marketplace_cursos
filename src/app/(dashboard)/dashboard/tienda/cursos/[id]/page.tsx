'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaArrowLeft, FaSave, FaTrash, FaEye, FaImage, FaSpinner, FaTimes } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EditarCursoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', subtitle: '', description: '', level: 'all_levels',
    modality: 'online_async', format: 'video', language: 'es',
    list_price: '0', sale_price: '', is_free: false,
    has_certificate: false, currency: 'USD',
    objectives: '', requirements: '', target_audience: '', state: 'draft',
    cover_url: '',
  })

  useEffect(() => {
    fetch(`/api/v1/admin/courses/${id}`).then(r => r.json()).then(d => {
      if (d.data) {
        const c = d.data
        setCourse(c)
        setForm({
          name: c.name ?? '', subtitle: c.subtitle ?? '',
          description: c.description ?? '', level: c.level ?? 'beginner',
          modality: c.modality ?? 'online_async', format: c.format ?? 'video',
          language: c.language ?? 'es', list_price: String(c.list_price ?? 0),
          sale_price: String(c.sale_price ?? ''), is_free: c.is_free ?? false,
          has_certificate: c.has_certificate ?? false, currency: c.currency ?? 'USD',
          objectives: c.learning_objectives ?? '', requirements: c.requirements ?? '',
          target_audience: c.target_audience ?? '', state: c.state ?? 'draft',
          cover_url: c.cover_url ?? '',
        })
      }
      setLoading(false)
    })
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }))
    setSaved(false)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/v1/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.data?.url) {
        set('cover_url', data.data.url)
      } else {
        console.error('[upload error]', data)
        alert(`Error al subir imagen: ${data?.error?.message ?? JSON.stringify(data)}`)
      }
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, list_price: Number(form.list_price), sale_price: form.sale_price ? Number(form.sale_price) : null, learning_objectives: form.objectives }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    const newState = form.state === 'published' ? 'draft' : 'pending_review'
    const res = await fetch(`/api/v1/admin/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState }),
    })
    if (res.ok) setForm(p => ({ ...p, state: newState }))
  }

  const STATE_LABEL: Record<string, string> = {
    draft: 'Borrador', pending_review: 'En revisión',
    published: 'Publicado', rejected: 'Rechazado', archived: 'Archivado',
  }

  if (loading) return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="h-8 w-64 bg-muted rounded animate-pulse" />
      <div className="h-64 bg-muted rounded-xl animate-pulse" />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/tienda/cursos"><FaArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-bold line-clamp-1">{form.name || 'Editar curso'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{STATE_LABEL[form.state] ?? form.state}</Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {course?.slug && (
            <Button asChild type="button" variant="outline" size="sm">
              <Link href={`/cursos/${course.slug}`} target="_blank"><FaEye className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handlePublish}>
            {form.state === 'published' ? 'Despublicar' : 'Enviar a revisión'}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/dashboard/tienda/cursos/${id}/contenido`}>Gestionar contenido</Link>
          </Button>
        </div>
      </div>

      {/* Cover upload */}
      <Card>
        <CardHeader><CardTitle>Imagen de portada</CardTitle></CardHeader>
        <CardContent>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          {form.cover_url ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border/50 group">
              <Image src={form.cover_url} alt="Portada" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>Cambiar</Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => set('cover_url', '')}><FaTimes className="h-3 w-3" /></Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
              className="w-full h-44 rounded-xl border-2 border-dashed border-border/60 hover:border-brand-green/60 bg-muted/30 hover:bg-brand-green/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand-green">
              {uploadingCover
                ? <><FaSpinner className="h-7 w-7 animate-spin" /><span className="text-sm">Subiendo…</span></>
                : <><FaImage className="h-7 w-7" /><span className="text-sm font-medium">Subir imagen de portada</span><span className="text-xs">JPG, PNG o WebP · Máx 10 MB</span></>
              }
            </button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Información básica</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Título *</Label>
            <Input id="name" value={form.name} required onChange={e => set('name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={5} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { field: 'level', label: 'Nivel', options: [['beginner','Principiante'],['intermediate','Intermedio'],['advanced','Avanzado'],['all','Todos']] },
              { field: 'modality', label: 'Modalidad', options: [['online','Online'],['presential','Presencial'],['hybrid','Híbrido']] },
              { field: 'format', label: 'Formato', options: [['recorded','Grabado'],['live','En vivo'],['mixed','Mixto']] },
            ].map(s => (
              <div key={s.field} className="flex flex-col gap-1.5">
                <Label>{s.label}</Label>
                <Select value={(form as any)[s.field]} onValueChange={v => set(s.field, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{s.options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Precio regular</Label>
                <Input type="number" min="0" step="0.01" value={form.list_price} onChange={e => set('list_price', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Precio oferta</Label>
                <Input type="number" min="0" step="0.01" value={form.sale_price} onChange={e => set('sale_price', e.target.value)} placeholder="Opcional" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Moneda</Label>
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[['USD','USD'],['COP','COP'],['MXN','MXN'],['EUR','EUR']].map(([v,l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={form.has_certificate} onCheckedChange={v => set('has_certificate', v)} />
            <Label>Incluye certificado</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contenido pedagógico</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[
            { field: 'objectives', label: 'Objetivos de aprendizaje', rows: 3 },
            { field: 'requirements', label: 'Requisitos previos', rows: 2 },
            { field: 'target_audience', label: 'Audiencia objetivo', rows: 2 },
          ].map(f => (
            <div key={f.field} className="flex flex-col gap-1.5">
              <Label>{f.label}</Label>
              <Textarea rows={f.rows} value={(form as any)[f.field]}
                onChange={e => set(f.field, e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="gap-2">
              <FaTrash className="h-4 w-4" /> Eliminar curso
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este curso?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer. El curso será eliminado permanentemente.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-white" onClick={async () => {
                await fetch(`/api/v1/admin/courses/${id}`, { method: 'DELETE' })
                router.push('/dashboard/tienda/cursos')
              }}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
