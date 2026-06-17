import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { marketplace_certificate, product_template, marketplace_enrollment } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ok, unauthorized, serverError } from '@/lib/api/response'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const certs = await db
      .select({
        id: marketplace_certificate.id,
        verify_code: marketplace_certificate.verify_code,
        verify_url: marketplace_certificate.verify_url,
        pdf_url: marketplace_certificate.pdf_url,
        issued_at: marketplace_certificate.issued_at,
        revoked: marketplace_certificate.revoked,
        course_id: marketplace_certificate.course_id,
        course_name: product_template.name,
        course_slug: product_template.slug,
        course_image: product_template.cover_url,
      })
      .from(marketplace_certificate)
      .innerJoin(product_template, eq(marketplace_certificate.course_id, product_template.id))
      .where(eq(marketplace_certificate.user_id, Number(session.sub)))
      .orderBy(desc(marketplace_certificate.issued_at))

    return ok(certs)
  } catch {
    return serverError()
  }
}
