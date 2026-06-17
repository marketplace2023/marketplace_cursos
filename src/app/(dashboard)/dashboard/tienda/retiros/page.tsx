'use client'

import { useState, useEffect } from 'react'
import { FaMoneyBillWave, FaPlus, FaSpinner, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'

type Payout = {
  id: number
  amount: string
  currency: string
  state: string
  payment_method: string | null
  payment_reference: string | null
  period_start: string | null
  period_end: string | null
  processed_at: string | null
  created_at: string
}

const STATE_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', icon: <FaClock className="h-3 w-3 text-yellow-500" />, variant: 'secondary' },
  processing: { label: 'Procesando', icon: <FaSpinner className="h-3 w-3 animate-spin text-blue-500" />, variant: 'secondary' },
  paid: { label: 'Pagado', icon: <FaCheckCircle className="h-3 w-3 text-brand-green" />, variant: 'default' },
  failed: { label: 'Fallido', icon: <FaTimesCircle className="h-3 w-3 text-destructive" />, variant: 'destructive' },
  cancelled: { label: 'Cancelado', icon: <FaTimesCircle className="h-3 w-3 text-muted-foreground" />, variant: 'outline' },
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RetirosPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [netBalance, setNetBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', payment_method: 'bank_transfer', payment_reference: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/payouts').then(r => r.json()),
      fetch('/api/v1/stores/me').then(r => r.json()),
    ]).then(([po, st]) => {
      if (po.success) setPayouts(po.data ?? [])
      /* Estimate available balance from store's total sales minus paid payouts */
      if (st.success && st.data) {
        const totalSales = Number(st.data.total_sales ?? 0)
        const paidOut = (po.data ?? [])
          .filter((p: Payout) => p.state === 'paid')
          .reduce((s: number, p: Payout) => s + Number(p.amount), 0)
        setNetBalance(Math.max(0, totalSales - paidOut))
      }
    }).finally(() => setLoading(false))
  }, [])

  async function submitRequest() {
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/v1/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(form.amount),
          payment_method: form.payment_method,
          payment_reference: form.payment_reference || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Error al solicitar el retiro')
        return
      }
      setPayouts(prev => [data.data, ...prev])
      setShowDialog(false)
      setForm({ amount: '', payment_method: 'bank_transfer', payment_reference: '' })
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const pendingAmount = payouts.filter(p => ['pending', 'processing'].includes(p.state))
    .reduce((s, p) => s + Number(p.amount), 0)
  const paidAmount = payouts.filter(p => p.state === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Retiros</h1>
          <p className="text-muted-foreground text-sm mt-1">Solicita el pago de tus ganancias</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <FaPlus className="h-4 w-4" /> Solicitar retiro
        </Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Disponible estimado</p>
            <p className="text-2xl font-bold text-brand-green">{formatCurrency(netBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">En proceso</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">Total pagado</p>
            <p className="text-2xl font-bold">{formatCurrency(paidAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payouts history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de retiros</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <FaMoneyBillWave className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="font-medium">Sin retiros todavía</p>
              <p className="text-sm text-muted-foreground mt-1">Solicita tu primer retiro cuando tengas saldo disponible.</p>
            </div>
          ) : (
            <div className="divide-y">
              {payouts.map((payout) => {
                const cfg = STATE_CONFIG[payout.state] ?? { label: payout.state, icon: null, variant: 'secondary' as const }
                return (
                  <div key={payout.id} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {cfg.icon}
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        {payout.payment_method && (
                          <span className="text-xs text-muted-foreground capitalize">{payout.payment_method.replace('_', ' ')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Solicitado: {formatDate(payout.created_at)}</span>
                        {payout.processed_at && <span>Pagado: {formatDate(payout.processed_at)}</span>}
                        {payout.payment_reference && <span>Ref: {payout.payment_reference}</span>}
                      </div>
                    </div>
                    <span className="text-lg font-bold shrink-0">{formatCurrency(Number(payout.amount), payout.currency)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar retiro</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Monto (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="100.00"
              />
              <p className="text-xs text-muted-foreground">Balance disponible estimado: {formatCurrency(netBalance)}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="method">Método de pago</Label>
              <select
                id="method"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
              >
                <option value="bank_transfer">Transferencia bancaria</option>
                <option value="paypal">PayPal</option>
                <option value="check">Cheque</option>
                <option value="crypto">Cripto</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ref">Referencia / CLABE / email <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="ref"
                value={form.payment_reference}
                onChange={e => setForm(f => ({ ...f, payment_reference: e.target.value }))}
                placeholder="CLABE, correo PayPal, etc."
              />
            </div>
            <Alert>
              <FaExclamationTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Los retiros son procesados manualmente en 3-5 días hábiles. Recibirás una notificación cuando se procese.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={submitRequest} disabled={submitting || !form.amount}>
              {submitting ? <><FaSpinner className="h-4 w-4 animate-spin mr-2" /> Enviando…</> : 'Solicitar retiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
