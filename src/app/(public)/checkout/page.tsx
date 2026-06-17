'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FaLock, FaShoppingCart, FaCheckCircle, FaGraduationCap,
  FaCreditCard, FaPaypal, FaArrowLeft, FaSpinner,
} from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrency } from '@/lib/utils'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

type CartItem = {
  item_id: number; course_id: number; course_name: string
  course_slug: string; course_cover?: string
  list_price: string; sale_price?: string; is_free: boolean; currency: string
  store_name?: string
}

type CartData = { items: CartItem[]; coupon: { code: string } | null; subtotal: number; discount: number; total: number }

type BillingForm = {
  billing_name: string
  billing_email: string
  billing_country: string
  billing_tax_id: string
}

/* ─── Inner Stripe payment form ─── */
function StripePaymentForm({
  billing,
  cart,
  paymentIntentId,
  onSuccess,
  onError,
}: {
  billing: BillingForm
  cart: CartData
  paymentIntentId: string
  onSuccess: (intentId: string) => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: billing.billing_name,
            email: billing.billing_email,
          },
        },
      },
    })

    if (error) {
      onError(error.message ?? 'Error al procesar el pago')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else {
      onError('El pago no se completó. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleConfirm} className="flex flex-col gap-4 mt-4">
      <PaymentElement />
      <Button
        type="submit"
        size="lg"
        disabled={submitting || !stripe}
        className="w-full bg-brand-green hover:bg-brand-green-dark text-white gap-2"
      >
        {submitting
          ? <><FaSpinner className="h-4 w-4 animate-spin" /> Procesando…</>
          : <><FaLock className="h-4 w-4" /> Pagar {formatCurrency(cart.total)}</>
        }
      </Button>
    </form>
  )
}

/* ─── Main checkout page ─── */
export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [gateway, setGateway] = useState('card')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [form, setForm] = useState<BillingForm>({
    billing_name: '',
    billing_email: '',
    billing_country: '',
    billing_tax_id: '',
  })

  useEffect(() => {
    fetch('/api/v1/cart')
      .then(r => r.json())
      .then(d => { if (d.success) setCart(d.data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setForm(f => ({
            ...f,
            billing_name: d.data.name + (d.data.last_name ? ` ${d.data.last_name}` : ''),
            billing_email: d.data.email,
            billing_country: d.data.country ?? '',
          }))
        }
      })
  }, [])

  /* Create Stripe PaymentIntent when switching to card + stripe is available */
  const fetchIntent = useCallback(async () => {
    if (!stripePromise) return
    try {
      const res = await fetch('/api/v1/payments/create-intent', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setClientSecret(data.data.client_secret)
        setPaymentIntentId(data.data.payment_intent_id)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (gateway === 'card' && cart && cart.total > 0 && !clientSecret) {
      fetchIntent()
    }
  }, [gateway, cart, clientSecret, fetchIntent])

  async function finalizeOrder(opts: { payment_gateway: string; payment_intent_id?: string }) {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...opts }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Error al crear el pedido')
        return
      }
      router.push(`/dashboard/comprador/ordenes?nuevo=${data.data.order_name}`)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (gateway === 'card' && stripePromise) return // handled by StripePaymentForm
    await finalizeOrder({ payment_gateway: gateway })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const items = cart?.items ?? []
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <FaShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
        <h1 className="text-xl font-bold mb-2">No hay nada que pagar</h1>
        <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
        <Button asChild><Link href="/cursos">Ver cursos</Link></Button>
      </div>
    )
  }

  const showStripeElements = gateway === 'card' && !!stripePromise && !!clientSecret && (cart?.total ?? 0) > 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/carrito" className="text-muted-foreground hover:text-foreground transition-colors">
          <FaArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-heading font-bold">Finalizar compra</h1>
        <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <FaLock className="h-4 w-4 text-brand-green" /> Pago seguro
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — billing + payment */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Billing info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Datos de facturación</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="billing_name">Nombre completo</Label>
                  <Input id="billing_name" required value={form.billing_name}
                    onChange={e => setForm(f => ({ ...f, billing_name: e.target.value }))} placeholder="Juan Pérez" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="billing_email">Correo electrónico</Label>
                  <Input id="billing_email" type="email" required value={form.billing_email}
                    onChange={e => setForm(f => ({ ...f, billing_email: e.target.value }))} placeholder="tu@correo.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="billing_country">País (código ISO)</Label>
                  <Input id="billing_country" maxLength={2} value={form.billing_country}
                    onChange={e => setForm(f => ({ ...f, billing_country: e.target.value.toUpperCase() }))} placeholder="US" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="billing_tax_id">RFC / NIF / Tax ID <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input id="billing_tax_id" value={form.billing_tax_id}
                    onChange={e => setForm(f => ({ ...f, billing_tax_id: e.target.value }))} placeholder="Opcional" />
                </div>
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
              <CardHeader><CardTitle className="text-base">Método de pago</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={gateway} onValueChange={setGateway} className="flex flex-col gap-3">
                  <Label htmlFor="card" className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="card" id="card" />
                    <FaCreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Tarjeta de crédito / débito</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {['VISA', 'MC', 'AMEX'].map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}
                    </div>
                  </Label>

                  <Label htmlFor="paypal" className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <FaPaypal className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">PayPal</p>
                      <p className="text-xs text-muted-foreground">Paga con tu cuenta PayPal</p>
                    </div>
                  </Label>

                  <Label htmlFor="manual" className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors has-checked:border-primary has-checked:bg-primary/5">
                    <RadioGroupItem value="manual" id="manual" />
                    <FaGraduationCap className="h-5 w-5 text-brand-green" />
                    <div>
                      <p className="font-medium text-sm">Pago manual / transferencia</p>
                      <p className="text-xs text-muted-foreground">Te enviaremos instrucciones por correo</p>
                    </div>
                  </Label>
                </RadioGroup>

                {/* Stripe Payment Element */}
                {gateway === 'card' && (
                  <div className="mt-4">
                    {showStripeElements ? (
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <StripePaymentForm
                          billing={form}
                          cart={cart!}
                          paymentIntentId={paymentIntentId!}
                          onSuccess={(intentId) => finalizeOrder({ payment_gateway: 'stripe', payment_intent_id: intentId })}
                          onError={setError}
                        />
                      </Elements>
                    ) : !stripePromise ? (
                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        <p className="font-medium">Stripe no configurado</p>
                        <p className="text-xs mt-1">Añade <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> a las variables de entorno.</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                        <FaSpinner className="h-4 w-4 animate-spin" /> Cargando pago seguro…
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — order summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-5 flex flex-col gap-4">
                <h2 className="font-semibold">Resumen del pedido</h2>

                {/* Items */}
                <div className="flex flex-col gap-3">
                  {items.map(item => {
                    const price = Number(item.sale_price ?? item.list_price)
                    return (
                      <div key={item.item_id} className="flex gap-2">
                        <div className="h-12 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                          {item.course_cover
                            ? <img src={item.course_cover} alt={item.course_name} className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center"><FaGraduationCap className="h-4 w-4 text-muted-foreground/40" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-2">{item.course_name}</p>
                          {item.store_name && <p className="text-xs text-muted-foreground truncate">{item.store_name}</p>}
                        </div>
                        <div className="shrink-0 text-xs font-semibold">
                          {item.is_free ? <span className="text-brand-green">Gratis</span> : formatCurrency(price, item.currency)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{formatCurrency(cart?.subtotal ?? 0)}</span>
                  </div>
                  {(cart?.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-brand-green">
                      <span>Descuento</span><span>-{formatCurrency(cart?.discount ?? 0)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span><span className="text-primary">{formatCurrency(cart?.total ?? 0)}</span>
                  </div>
                </div>

                {/* Submit for non-Stripe gateways */}
                {gateway !== 'card' && (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white gap-2"
                  >
                    {submitting
                      ? <><FaSpinner className="h-4 w-4 animate-spin" /> Procesando…</>
                      : <><FaLock className="h-4 w-4" /> Confirmar pedido</>
                    }
                  </Button>
                )}

                {/* Free courses submit */}
                {gateway === 'card' && (cart?.total ?? 0) === 0 && (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white gap-2"
                  >
                    {submitting
                      ? <><FaSpinner className="h-4 w-4 animate-spin" /> Procesando…</>
                      : <><FaCheckCircle className="h-4 w-4" /> Obtener gratis</>
                    }
                  </Button>
                )}

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="h-3 w-3 text-brand-green shrink-0" />
                    Garantía de devolución 30 días
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="h-3 w-3 text-brand-green shrink-0" />
                    Acceso inmediato tras el pago
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="h-3 w-3 text-brand-green shrink-0" />
                    Factura disponible en tu cuenta
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
