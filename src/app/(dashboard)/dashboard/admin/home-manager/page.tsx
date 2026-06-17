'use client'

import { useState, useEffect } from 'react'
import { FaHome, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminHomeManagerPage() {
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/admin/home-sections').then(r => r.json()).then(d => {
      setSections(Array.isArray(d.data) ? d.data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function toggleSection(id: number, active: boolean) {
    setSaving(id)
    setSections(p => p.map(s => s.id === id ? { ...s, active } : s))
    try {
      await fetch(`/api/v1/admin/home-sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
    } finally { setSaving(null) }
  }

  async function updateTitle(id: number, title: string) {
    setSections(p => p.map(s => s.id === id ? { ...s, title } : s))
  }

  async function saveSection(id: number) {
    setSaving(id)
    const section = sections.find(s => s.id === id)
    try {
      await fetch(`/api/v1/admin/home-sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: section?.title, subtitle: section?.subtitle }),
      })
    } finally { setSaving(null) }
  }

  if (loading) {
    return <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Gestor de inicio</h1>
        <p className="text-muted-foreground mt-0.5">Configura las secciones de la página de inicio</p>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHome className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin secciones configuradas. Crea secciones de inicio desde la base de datos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(sec => (
            <Card key={sec.id} className={!sec.active ? 'opacity-60' : ''}>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{sec.key}</Badge>
                    <Badge variant={sec.active ? 'default' : 'secondary'} className="text-xs">
                      {sec.active ? 'Visible' : 'Oculta'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm" className="h-7 gap-1 text-xs"
                      onClick={() => toggleSection(sec.id, !sec.active)}
                      disabled={saving === sec.id}
                    >
                      {sec.active ? <FaEyeSlash className="h-3 w-3" /> : <FaEye className="h-3 w-3" />}
                      {sec.active ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    <Button
                      size="sm" className="h-7 gap-1 text-xs bg-brand-green hover:bg-brand-green-dark text-white"
                      onClick={() => saveSection(sec.id)}
                      disabled={saving === sec.id}
                    >
                      <FaSave className="h-3 w-3" />{saving === sec.id ? 'Guardando…' : 'Guardar'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Título</Label>
                    <Input className="h-8 text-sm" value={sec.title ?? ''} onChange={e => updateTitle(sec.id, e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Subtítulo</Label>
                    <Input className="h-8 text-sm" value={sec.subtitle ?? ''} onChange={e => setSections(p => p.map(s => s.id === sec.id ? { ...s, subtitle: e.target.value } : s))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
