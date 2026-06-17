'use client'

import { useState, useEffect } from 'react'
import { FaTag, FaPlus, FaTrash } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function MarketingCuponesPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', coupon_type: 'percent', discount_value: '',
    min_purchase: '0', max_uses: '', active: true, expires_at: '',
  })

  useEffect(() => {
    fetch('/api/v1/coupons').then(r => r.json()).then(d => {
      setCoupons(Array.isArray(d.data) ? d.data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function setF(f: string, v: any) { setForm(p => ({ ...p, [f]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, discount_value: Number(form.discount_value), max_uses: form.max_uses ? Number(form.max_uses) : null }),
      })
      const d = await res.json()
      if (res.ok) {
        setCoupons(p => [d.data, ...p])
        setOpen(false)
        setForm({ code: '', description: '', coupon_type: 'percent', discount_value: '', min_purchase: '0', max_uses: '', active: true, expires_at: '' })
      }
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Desactivar este cupón?')) return
    await fetch(`/api/v1/coupons/${id}`, { method: 'DELETE' })
    setCoupons(p => p.filter(c => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Cupones de plataforma</h1>
          <p className="text-muted-foreground mt-0.5">{coupons.length} cupones globales</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaPlus className="h-4 w-4" />Nuevo cupón
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaTag className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin cupones de plataforma</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((c: any) => (
            <Card key={c.id} className={!c.active ? 'opacity-60' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="font-mono font-bold text-sm bg-muted px-3 py-1.5 rounded-lg">{c.code}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                      {c.coupon_type === 'percent' ? `${c.discount_value}%` : formatCurrency(Number(c.discount_value), 'USD')} descuento
                    </Badge>
                    <Badge variant={c.active ? 'default' : 'secondary'} className="text-xs">{c.active ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{c.used_count}/{c.max_uses ?? '∞'} usos</span>
                    {c.expires_at && <span>Vence {formatDate(c.expires_at)}</span>}
                    {c.min_purchase > 0 && <span>Min. {formatCurrency(Number(c.min_purchase), 'USD')}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10 shrink-0" onClick={() => handleDelete(c.id)}>
                  <FaTrash className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuevo cupón de plataforma</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Código</Label>
                <Input required value={form.code} onChange={e => setF('code', e.target.value.toUpperCase())} placeholder="PROMO2026" maxLength={50} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.coupon_type} onValueChange={v => setF('coupon_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje</SelectItem>
                    <SelectItem value="fixed">Monto fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Descuento {form.coupon_type === 'percent' ? '(%)' : '(USD)'}</Label>
                <Input required type="number" min="0" value={form.discount_value} onChange={e => setF('discount_value', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Usos máximos</Label>
                <Input type="number" min="1" value={form.max_uses} onChange={e => setF('max_uses', e.target.value)} placeholder="Sin límite" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Compra mínima (USD)</Label>
                <Input type="number" min="0" value={form.min_purchase} onChange={e => setF('min_purchase', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha de vencimiento</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={e => setF('expires_at', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={v => setF('active', v)} />
              <Label>Cupón activo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark text-white">
                {submitting ? 'Creando…' : 'Crear cupón'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
