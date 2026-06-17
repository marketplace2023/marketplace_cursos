'use client'

import { useState } from 'react'
import { FaBell, FaPaperPlane } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminNotificacionesPage() {
  const [form, setForm] = useState({ title: '', body: '', type: 'system', target: 'all', link: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function setF(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); setSent(false) }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('/api/v1/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSent(true)
      setForm({ title: '', body: '', type: 'system', target: 'all', link: '' })
    } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Notificaciones</h1>
        <p className="text-muted-foreground mt-0.5">Envía notificaciones masivas a los usuarios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar notificación</CardTitle>
          <CardDescription>Se enviará a los usuarios según el segmento seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setF('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="moderation">Moderación</SelectItem>
                    <SelectItem value="payment">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Destinatarios</Label>
                <Select value={form.target} onValueChange={v => setF('target', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="buyers">Solo compradores</SelectItem>
                    <SelectItem value="store_owners">Solo tiendas</SelectItem>
                    <SelectItem value="instructors">Solo instructores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Título</Label>
              <Input required value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Título de la notificación" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cuerpo</Label>
              <Textarea rows={3} value={form.body} onChange={e => setF('body', e.target.value)} placeholder="Mensaje de la notificación" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Enlace (opcional)</Label>
              <Input type="url" value={form.link} onChange={e => setF('link', e.target.value)} placeholder="https://…" />
            </div>
            <Button type="submit" disabled={sending || !form.title} className="gap-2 self-end bg-brand-green hover:bg-brand-green-dark text-white">
              <FaPaperPlane className="h-4 w-4" />
              {sending ? 'Enviando…' : sent ? '¡Enviado!' : 'Enviar notificación'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de difusiones</CardTitle>
          <CardDescription>Últimas notificaciones enviadas por administradores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FaBell className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">El historial se registra en los logs de auditoría</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
