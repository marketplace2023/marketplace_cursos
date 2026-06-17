'use client'

import { useState, useEffect } from 'react'
import { FaHeadset, FaPlus } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  open: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  closed: 'bg-muted text-muted-foreground',
}
const STATE_LABELS: Record<string, string> = {
  open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado',
}

export default function InstructorSoportePage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ subject: '', category: 'technical', description: '' })

  useEffect(() => {
    fetch('/api/v1/support').then(r => r.json()).then(d => {
      setTickets(Array.isArray(d.data) ? d.data : [])
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) { setForm(p => ({ ...p, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (res.ok) {
        setTickets(p => [d.data, ...p])
        setOpen(false)
        setForm({ subject: '', category: 'technical', description: '' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Soporte</h1>
          <p className="text-muted-foreground mt-0.5">Tus tickets de ayuda con el equipo</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaPlus className="h-4 w-4" />Nuevo ticket
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHeadset className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin tickets</h3>
          <p className="text-muted-foreground">¿Tienes algún problema? Crea un ticket y te ayudaremos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{t.subject}</p>
                    <Badge className={`shrink-0 border text-xs ${STATE_COLORS[t.state] ?? STATE_COLORS.open}`}>
                      {STATE_LABELS[t.state] ?? t.state}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.ticket_number} · {formatDate(t.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuevo ticket de soporte</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subject">Asunto</Label>
              <Input id="subject" required value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Describe brevemente tu problema" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="payment">Pagos</SelectItem>
                  <SelectItem value="content">Contenido</SelectItem>
                  <SelectItem value="account">Cuenta</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" rows={4} required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Explica el problema con el mayor detalle posible" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark text-white">
                {submitting ? 'Enviando…' : 'Enviar ticket'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
