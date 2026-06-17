'use client'

import { useState, useEffect } from 'react'
import { FaFileInvoice, FaPlus } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

const STATE_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary border-primary/20',
  accepted: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  expired: 'bg-muted text-muted-foreground',
}
const STATE_LABELS: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada', expired: 'Expirada',
}

export default function CorporativoCotizacionesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', participants: '', notes: '', budget_range: '' })

  useEffect(() => {
    fetch('/api/v1/quotes').then(r => r.json()).then(d => {
      setQuotes(Array.isArray(d.data) ? d.data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function setF(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, participants: form.participants ? Number(form.participants) : null }),
      })
      const d = await res.json()
      if (res.ok) {
        setQuotes(p => [d.data, ...p])
        setOpen(false)
        setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', participants: '', notes: '', budget_range: '' })
      }
    } finally { setSubmitting(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground mt-0.5">{quotes.length} cotizaciones solicitadas</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaPlus className="h-4 w-4" />Solicitar cotización
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">{[1,2].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaFileInvoice className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin cotizaciones. Solicita formación para tu equipo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q: any) => (
            <Card key={q.id}>
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold">{q.company_name}</p>
                      <Badge className={`text-xs border ${STATE_COLORS[q.state] ?? ''}`}>{STATE_LABELS[q.state] ?? q.state}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.contact_name} · {q.contact_email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDate(q.created_at)}</p>
                </div>
                {q.notes && <p className="text-sm text-muted-foreground">{q.notes}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {q.participants && <span>{q.participants} participantes</span>}
                  {q.budget_range && <span>Presupuesto: {q.budget_range}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Solicitar cotización</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label>Empresa</Label>
                <Input required value={form.company_name} onChange={e => setF('company_name', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Nombre de contacto</Label>
                <Input value={form.contact_name} onChange={e => setF('contact_name', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email de contacto</Label>
                <Input type="email" required value={form.contact_email} onChange={e => setF('contact_email', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Teléfono</Label>
                <Input value={form.contact_phone} onChange={e => setF('contact_phone', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Participantes</Label>
                <Input type="number" min="1" value={form.participants} onChange={e => setF('participants', e.target.value)} placeholder="Nº de personas" />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label>Rango de presupuesto</Label>
                <Input value={form.budget_range} onChange={e => setF('budget_range', e.target.value)} placeholder="Ej: $5,000 - $10,000 USD" />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label>Notas y requerimientos</Label>
                <Textarea rows={3} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Describe las necesidades de formación de tu empresa…" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark text-white">
                {submitting ? 'Enviando…' : 'Enviar solicitud'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
