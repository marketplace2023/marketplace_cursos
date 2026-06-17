'use client'

import { useState, useEffect } from 'react'
import { FaFolder, FaPlus, FaTrash, FaEdit } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' })

  useEffect(() => {
    fetch('/api/v1/categories').then(r => r.json()).then(d => {
      setCategories(Array.isArray(d.data) ? d.data : [])
      setLoading(false)
    })
  }, [])

  function setF(field: string, value: string) {
    setForm(p => ({
      ...p, [field]: value,
      ...(field === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (res.ok) {
        setCategories(p => [...p, d.data])
        setOpen(false)
        setForm({ name: '', slug: '', description: '', icon: '' })
      }
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await fetch(`/api/v1/categories/${id}`, { method: 'DELETE' })
    setCategories(p => p.filter(c => c.id !== id))
  }

  const roots = categories.filter(c => !c.parent_id)
  const children = (parentId: number) => categories.filter(c => c.parent_id === parentId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Categorías</h1>
          <p className="text-muted-foreground mt-0.5">{categories.length} categorías</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaPlus className="h-4 w-4" />Nueva categoría
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaFolder className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {roots.map(cat => (
            <div key={cat.id}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  {cat.icon && <span className="text-xl">{cat.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{cat.name}</p>
                      {cat.featured && <Badge className="text-xs bg-brand-orange/10 text-brand-orange border-brand-orange/20">Destacada</Badge>}
                      {!cat.active && <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">/{cat.slug} · {children(cat.id).length} subcategorías</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(cat.id)}>
                    <FaTrash className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
              {children(cat.id).map(child => (
                <Card key={child.id} className="ml-6 mt-1">
                  <CardContent className="p-3 flex items-center gap-3">
                    {child.icon && <span className="text-sm">{child.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground">/{child.slug}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(child.id)}>
                      <FaTrash className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nueva categoría</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nombre</Label>
              <Input required value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ej: Programación" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Slug (URL)</Label>
              <Input required value={form.slug} onChange={e => setF('slug', e.target.value)} placeholder="programacion" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ícono (emoji)</Label>
              <Input value={form.icon} onChange={e => setF('icon', e.target.value)} placeholder="💻" maxLength={4} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Descripción</Label>
              <Input value={form.description} onChange={e => setF('description', e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark text-white">
                {submitting ? 'Guardando…' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
