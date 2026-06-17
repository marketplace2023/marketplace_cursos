'use client'

import { useState, useEffect } from 'react'
import { FaBuilding, FaSave, FaShieldAlt } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function TiendaFurTPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    fiscal_data: '', bank_data: '', verification_notes: '',
  })
  const [verState, setVerState] = useState('unverified')

  useEffect(() => {
    fetch('/api/v1/stores/me/fur-t').then(r => r.json()).then(d => {
      if (d.data) {
        setForm({
          fiscal_data: d.data.fiscal_data ?? '',
          bank_data: d.data.bank_data ?? '',
          verification_notes: d.data.verification_notes ?? '',
        })
        setVerState(d.data.verification_state ?? 'unverified')
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/stores/me/fur-t', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const STATE_COLORS: Record<string, string> = {
    unverified: 'text-muted-foreground',
    pending: 'text-brand-orange',
    verified: 'text-brand-green',
    rejected: 'text-destructive',
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">FUR-T — Datos legales y bancarios</h1>
          <p className="text-muted-foreground mt-0.5">Información privada para procesamiento de pagos</p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2 bg-brand-green hover:bg-brand-green-dark text-white">
          <FaSave className="h-4 w-4" />{saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </Button>
      </div>

      <div className={`flex items-center gap-2 text-sm ${STATE_COLORS[verState] ?? STATE_COLORS.unverified}`}>
        <FaShieldAlt className="h-4 w-4" />
        <span>Estado de verificación: <strong className="capitalize">{verState}</strong></span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FaBuilding className="h-4 w-4 text-primary" />
            <CardTitle>Datos fiscales</CardTitle>
          </div>
          <CardDescription>NIF, RUC o identificación tributaria de la entidad</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={form.fiscal_data}
            onChange={e => { setForm(p => ({ ...p, fiscal_data: e.target.value })); setSaved(false) }}
            placeholder={'{\n  "tax_id": "123456789",\n  "entity_type": "SAS",\n  "legal_name": "Mi Empresa SAS"\n}'}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground mt-2">Formato JSON. Esta información es privada y encriptada.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos bancarios</CardTitle>
          <CardDescription>Cuenta para recibir tus pagos cada mes</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={form.bank_data}
            onChange={e => { setForm(p => ({ ...p, bank_data: e.target.value })); setSaved(false) }}
            placeholder={'{\n  "bank": "Bancolombia",\n  "account_type": "savings",\n  "account_number": "****9876"\n}'}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground mt-2">Formato JSON. Encriptado con AES-256.</p>
        </CardContent>
      </Card>
    </form>
  )
}
