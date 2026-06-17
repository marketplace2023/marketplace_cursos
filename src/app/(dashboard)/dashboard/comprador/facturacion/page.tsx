'use client'

import { useState, useEffect } from 'react'
import { FaFileInvoice, FaDownload, FaSpinner, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'

type Order = {
  id: number
  name: string
  state: string
  payment_state: string
  amount_total: string
  currency: string
  billing_name: string
  billing_email: string
  billing_country: string
  billing_tax_id: string
  payment_gateway: string
  confirmed_at: string
  paid_at: string | null
  created_at: string
}

const PAYMENT_STATE_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pagado', color: 'default' },
  pending: { label: 'Pendiente', color: 'secondary' },
  processing: { label: 'Procesando', color: 'secondary' },
  failed: { label: 'Fallido', color: 'destructive' },
  refunded: { label: 'Reembolsado', color: 'outline' },
  cancelled: { label: 'Cancelado', color: 'outline' },
}

const PAYMENT_STATE_ICON: Record<string, React.ReactNode> = {
  paid: <FaCheckCircle className="h-3.5 w-3.5 text-brand-green" />,
  pending: <FaClock className="h-3.5 w-3.5 text-yellow-500" />,
  processing: <FaSpinner className="h-3.5 w-3.5 animate-spin text-blue-500" />,
  failed: <FaTimesCircle className="h-3.5 w-3.5 text-destructive" />,
  refunded: <FaCheckCircle className="h-3.5 w-3.5 text-muted-foreground" />,
}

function printInvoice(order: Order) {
  const content = `
    FACTURA / RECIBO
    ════════════════════════════════════
    Pedido: ${order.name}
    Fecha: ${new Date(order.confirmed_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
    ────────────────────────────────────
    Facturado a: ${order.billing_name}
    Email: ${order.billing_email}
    ${order.billing_country ? `País: ${order.billing_country}` : ''}
    ${order.billing_tax_id ? `Tax ID: ${order.billing_tax_id}` : ''}
    ────────────────────────────────────
    Total: ${formatCurrency(Number(order.amount_total), order.currency)}
    Estado de pago: ${PAYMENT_STATE_LABELS[order.payment_state]?.label ?? order.payment_state}
    Método: ${order.payment_gateway ?? '—'}
    ════════════════════════════════════
    EduMarket — Plataforma de Cursos
  `.trim()

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recibo-${order.name}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function FacturacionPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Facturación</h1>
        <p className="text-muted-foreground text-sm mt-1">Historial de pedidos y recibos de pago</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <FaFileInvoice className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-lg">Sin pedidos</p>
            <p className="text-muted-foreground text-sm">Cuando realices una compra, tus recibos aparecerán aquí.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const stateInfo = PAYMENT_STATE_LABELS[order.payment_state] ?? { label: order.payment_state, color: 'secondary' }
            return (
              <Card key={order.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FaFileInvoice className="h-4 w-4 text-primary" />
                        <span className="font-mono font-semibold text-sm">{order.name}</span>
                        <div className="flex items-center gap-1">
                          {PAYMENT_STATE_ICON[order.payment_state]}
                          <Badge variant={stateInfo.color as 'default' | 'secondary' | 'destructive' | 'outline'} className="text-xs">
                            {stateInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">Fecha</span>
                          <p>{new Date(order.confirmed_at ?? order.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Facturado a</span>
                          <p>{order.billing_name}</p>
                          <p>{order.billing_email}</p>
                        </div>
                        {order.billing_tax_id && (
                          <div>
                            <span className="font-medium text-foreground">Tax ID</span>
                            <p>{order.billing_tax_id}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(Number(order.amount_total), order.currency)}
                      </span>
                      {order.payment_gateway && (
                        <span className="text-xs text-muted-foreground capitalize">{order.payment_gateway}</span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => printInvoice(order)} className="gap-1.5">
                        <FaDownload className="h-3 w-3" /> Descargar recibo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
