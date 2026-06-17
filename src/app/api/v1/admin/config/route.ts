import { getSession } from '@/lib/auth/session'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api/response'

const DEFAULT_CONFIG = {
  allow_registration: true,
  require_email_verification: true,
  allow_store_creation: true,
  require_store_approval: true,
  allow_course_creation: true,
  require_course_approval: true,
  platform_commission: 15,
  min_payout: 50,
  payout_period: 'monthly',
  maintenance_mode: false,
  default_currency: 'USD',
  supported_languages: ['es', 'en'],
  max_file_upload_mb: 500,
  enable_subscriptions: true,
  enable_coupons: true,
  enable_ads: true,
  enable_b2b: true,
  enable_certificates: true,
}

let _config = { ...DEFAULT_CONFIG }

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()
    return ok(_config)
  } catch {
    return serverError()
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['admin', 'superadmin'].includes(session.role)) return forbidden()

    const body = await req.json()
    _config = { ..._config, ...body }
    return ok(_config)
  } catch {
    return serverError()
  }
}
