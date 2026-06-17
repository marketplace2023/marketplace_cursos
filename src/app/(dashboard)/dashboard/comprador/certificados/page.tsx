import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FaCertificate, FaDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_certificate, product_template, marketplace_store } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function CertificadosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const certs = await db
    .select({
      id: marketplace_certificate.id,
      verify_code: marketplace_certificate.verify_code,
      issued_at: marketplace_certificate.issued_at,
      pdf_url: marketplace_certificate.pdf_url,
      verify_url: marketplace_certificate.verify_url,
      course_name: product_template.name,
      course_slug: product_template.slug,
      store_name: marketplace_store.name,
    })
    .from(marketplace_certificate)
    .leftJoin(product_template, eq(marketplace_certificate.course_id, product_template.id))
    .leftJoin(marketplace_store, eq(product_template.store_id, marketplace_store.id))
    .where(eq(marketplace_certificate.user_id, Number(session.sub)))
    .orderBy(desc(marketplace_certificate.issued_at))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Mis Certificados</h1>
        <p className="text-muted-foreground mt-0.5">{certs.length} certificado{certs.length !== 1 ? 's' : ''} obtenido{certs.length !== 1 ? 's' : ''}</p>
      </div>

      {certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaCertificate className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aún no tienes certificados</h3>
          <p className="text-muted-foreground mb-4">Completa un curso con certificado para obtener el tuyo</p>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
            <Link href="/cursos?has_certificate=1">Ver cursos con certificado</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {certs.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow border-brand-purple/20">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <FaCertificate className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">{c.course_name}</h3>
                    {c.store_name && <p className="text-xs text-muted-foreground">{c.store_name}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>Emitido: {c.issued_at ? formatDate(c.issued_at) : '—'}</span>
                  {c.verify_code && (
                    <span className="font-mono">ID: {c.verify_code}</span>
                  )}
                </div>

                <Badge className="w-fit bg-brand-purple/10 text-brand-purple border-(--brand-purple)/30">
                  Certificado verificado
                </Badge>

                <div className="flex gap-2 mt-auto">
                  {c.pdf_url && (
                    <Button asChild size="sm" variant="outline" className="gap-1 flex-1">
                      <a href={c.pdf_url} download>
                        <FaDownload className="h-3 w-3" /> Descargar PDF
                      </a>
                    </Button>
                  )}
                  {c.verify_url && (
                    <Button asChild size="sm" variant="ghost" className="gap-1">
                      <a href={c.verify_url} target="_blank" rel="noopener noreferrer">
                        <FaExternalLinkAlt className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
