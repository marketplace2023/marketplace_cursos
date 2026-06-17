'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FaShoppingCart, FaTrash, FaTag, FaTimes, FaLock,
  FaGraduationCap, FaArrowRight, FaCheckCircle,
} from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'

type CartItem = {
  item_id: number
  course_id: number
  course_name: string
  course_slug: string
  course_cover?: string
  list_price: string
  sale_price?: string
  is_free: boolean
  currency: string
  store_name?: string
  duration_hours?: string
  has_certificate: boolean
}

type CartData = {
  items: CartItem[]
  coupon: { code: string; type: string; value: number } | null
  subtotal: number
  discount: number
  total: number
}

function ItemRow({ item, onRemove }: { item: CartItem; onRemove: (id: number) => void }) {
  const price = Number(item.sale_price ?? item.list_price)
  const originalPrice = item.sale_price ? Number(item.list_price) : null
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  return (
    <div className="flex gap-4 py-4">
      <Link href={`/cursos/${item.course_slug}`} className="shrink-0">
        <div className="h-20 w-32 rounded-lg bg-muted overflow-hidden">
          {item.course_cover
            ? <img src={item.course_cover} alt={item.course_name} className="h-full w-full object-cover" />
            : <div className="h-full w-full flex items-center justify-center"><FaGraduationCap className="h-7 w-7 text-muted-foreground/40" /></div>
          }
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/cursos/${item.course_slug}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
          {item.course_name}
        </Link>
        {item.store_name && <p className="text-xs text-muted-foreground mt-0.5">{item.store_name}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {item.has_certificate && <Badge variant="outline" className="text-xs">Certificado</Badge>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {item.is_free ? (
          <span className="font-bold text-brand-green">Gratis</span>
        ) : (
          <div className="text-right">
            <span className="font-bold text-primary">{formatCurrency(price, item.currency)}</span>
            {originalPrice && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(originalPrice, item.currency)}</span>
                {discount > 0 && <Badge className="text-xs bg-destructive text-white border-0">-{discount}%</Badge>}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => onRemove(item.course_id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Eliminar"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function CarritoPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [removing, setRemoving] = useState<number | null>(null)

  async function loadCart() {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/cart')
      if (res.status === 401) {
        setIsLoggedIn(false)
        setCart({ items: [], coupon: null, subtotal: 0, discount: 0, total: 0 })
        return
      }
      setIsLoggedIn(true)
      const data = await res.json()
      if (data.success) setCart(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCart() }, [])

  async function removeItem(courseId: number) {
    setRemoving(courseId)
    try {
      await fetch('/api/v1/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      })
      await loadCart()
    } finally { setRemoving(null) }
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/v1/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: couponInput.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setCouponError(data.error?.message ?? 'Cupón inválido'); return }
      await loadCart()
      setCouponInput('')
    } finally { setCouponLoading(false) }
  }

  async function removeCoupon() {
    await fetch('/api/v1/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupon_code: null }),
    })
    await loadCart()
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const items = cart?.items ?? []

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <FaLock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
        <h1 className="text-2xl font-heading font-bold mb-2">Inicia sesión para ver tu carrito</h1>
        <p className="text-muted-foreground mb-6">Tu carrito se guarda en tu cuenta para que puedas retomarlo cuando quieras.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary">
            <Link href="/login?next=/carrito">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/registro">Crear cuenta gratis</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <FaShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h1 className="text-2xl font-heading font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Explora nuestro catálogo y agrega los cursos que quieres tomar.</p>
        <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
          <Link href="/cursos">Explorar cursos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">
        Carrito <span className="text-muted-foreground font-normal text-lg">({items.length} {items.length === 1 ? 'curso' : 'cursos'})</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="divide-y">
            {items.map(item => (
              <ItemRow
                key={item.item_id}
                item={item}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-lg">Resumen del pedido</h2>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cart?.subtotal ?? 0)}</span>
                </div>
                {(cart?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Descuento cupón</span>
                    <span>-{formatCurrency(cart?.discount ?? 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(cart?.total ?? 0)}</span>
                </div>
              </div>

              {/* Coupon */}
              {cart?.coupon ? (
                <div className="flex items-center gap-2 bg-brand-green/10 text-brand-green rounded-lg px-3 py-2 text-sm">
                  <FaCheckCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Cupón <strong>{cart.coupon.code}</strong> aplicado</span>
                  <button onClick={removeCoupon} className="hover:text-destructive"><FaTimes className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                        placeholder="Código de cupón"
                        className="pl-9 text-sm"
                        onKeyDown={e => { if (e.key === 'Enter') applyCoupon() }}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}>
                      Aplicar
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                </div>
              )}

              <Button
                size="lg"
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white gap-2"
                onClick={() => router.push('/checkout')}
              >
                Proceder al pago <FaArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <FaLock className="h-3 w-3" /> Pago seguro con cifrado SSL
              </p>

              {/* Guarantee */}
              <Alert className="border-brand-green/20 bg-brand-green/5">
                <AlertDescription className="text-xs text-muted-foreground">
                  <FaCheckCircle className="inline mr-1 h-3 w-3 text-brand-green" />
                  Garantía de devolución 30 días sin preguntas
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
