'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHeadset, FaPlus, FaTicketAlt } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

const STATE_COLORS: Record<string, string> = {
  open: 'bg-brand-orange/10 text-brand-orange',
  in_progress: 'bg-primary/10 text-primary',
  waiting_user: 'bg-brand-secondary/10 text-brand-secondary',
  resolved: 'bg-brand-green/10 text-brand-green',
  closed: 'bg-muted text-muted-foreground',
  escalated: 'bg-destructive/10 text-destructive',
}
const STATE_LABELS: Record<string, string> = {
  open: 'Abierto', in_progress: 'En progreso', waiting_user: 'Esperando respuesta',
  resolved: 'Resuelto', closed: 'Cerrado', escalated: 'Escalado',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground', normal: 'text-brand-orange',
  high: 'text-destructive', urgent: 'text-destructive font-bold',
}

interface Ticket {
  id: number; ticket_number: string; subject: string
  state: string; priority: string; category: string; created_at: string
}

export default function SoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ subject: '', description: '', category: 'other' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/v1/support').then(r => r.json()).then(d => {
      setTickets(d.data ?? [])
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/v1/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setTickets(prev => [data.data, ...prev])
      setForm({ subject: '', description: '', category: 'other' })
      setOpen(false)
    }
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Soporte</h1>
          <p className="text-muted-foreground mt-0.5">Gestiona tus solicitudes de ayuda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
              <FaPlus className="h-4 w-4" /> Nuevo ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear ticket de soporte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="subject">Asunto *</Label>
                <Input id="subject" value={form.subject} required
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Describe brevemente el problema" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat">Categoría</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Pago</SelectItem>
                    <SelectItem value="refund">Reembolso</SelectItem>
                    <SelectItem value="course_access">Acceso a curso</SelectItem>
                    <SelectItem value="technical">Problema técnico</SelectItem>
                    <SelectItem value="account">Cuenta</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="desc">Descripción *</Label>
                <Textarea id="desc" rows={4} value={form.description} required
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe tu problema con el mayor detalle posible…" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark text-white">
                  {submitting ? 'Enviando…' : 'Enviar ticket'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaHeadset className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin tickets</h3>
          <p className="text-muted-foreground mb-4">¿Tienes algún problema? Crea un ticket y te ayudamos</p>
          <Button onClick={() => setOpen(true)} className="bg-brand-green hover:bg-brand-green-dark text-white gap-2">
            <FaPlus className="h-4 w-4" /> Crear ticket
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map(t => (
            <Link key={t.id} href={`/dashboard/comprador/soporte/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <FaTicketAlt className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <span className="text-xs text-muted-foreground shrink-0 font-mono">{t.ticket_number}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-xs border-0 ${STATE_COLORS[t.state] ?? ''}`}>
                        {STATE_LABELS[t.state] ?? t.state}
                      </Badge>
                      <span className={`text-xs capitalize ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                        {t.priority}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(t.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
