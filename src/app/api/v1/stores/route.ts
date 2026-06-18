import { eq, and, ilike, desc, asc, sql, isNull, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { marketplace_store, res_users } from '@/lib/db/schema'
import { ok, created, unauthorized, forbidden, conflict, badRequest, serverError, pageMeta } from '@/lib/api/response'
import { getSession } from '@/lib/auth/session'

/* ── Approximate city/country → coordinates lookup ── */
const CITY_COORDS: Record<string, [number, number]> = {
  'CO:Bogotá': [4.7110, -74.0721], 'CO:Bogota': [4.7110, -74.0721],
  'CO:Medellín': [6.2530, -75.5736], 'CO:Medellin': [6.2530, -75.5736],
  'CO:Cali': [3.4516, -76.5320],
  'CO:Barranquilla': [10.9685, -74.7813],
  'CO:Cartagena': [10.3910, -75.4794],
  'CO:Bucaramanga': [7.1193, -73.1227],
  'CO:Pereira': [4.8133, -75.6961],
  'CO:Manizales': [5.0703, -75.5138],
  'MX:Ciudad de México': [19.4326, -99.1332], 'MX:Mexico City': [19.4326, -99.1332], 'MX:CDMX': [19.4326, -99.1332],
  'MX:Guadalajara': [20.6597, -103.3496],
  'MX:Monterrey': [25.6866, -100.3161],
  'MX:Puebla': [19.0414, -98.2063],
  'MX:Tijuana': [32.5149, -117.0382],
  'AR:Buenos Aires': [-34.6037, -58.3816],
  'AR:Córdoba': [-31.4201, -64.1888], 'AR:Cordoba': [-31.4201, -64.1888],
  'AR:Rosario': [-32.9442, -60.6505],
  'CL:Santiago': [-33.4489, -70.6693],
  'PE:Lima': [-12.0464, -77.0428],
  'EC:Quito': [-0.2299, -78.5249],
  'EC:Guayaquil': [-2.1962, -79.8862],
  'VE:Caracas': [10.4806, -66.9036],
  'BR:São Paulo': [-23.5505, -46.6333], 'BR:Sao Paulo': [-23.5505, -46.6333],
  'BR:Rio de Janeiro': [-22.9068, -43.1729],
  'BR:Brasília': [-15.7942, -47.8822], 'BR:Brasilia': [-15.7942, -47.8822],
  'US:Miami': [25.7617, -80.1918],
  'US:New York': [40.7128, -74.0060], 'US:Nueva York': [40.7128, -74.0060],
  'US:Los Angeles': [34.0522, -118.2437],
  'US:Chicago': [41.8781, -87.6298],
  'US:Houston': [29.7604, -95.3698],
  'US:San Francisco': [37.7749, -122.4194],
  'ES:Madrid': [40.4168, -3.7038],
  'ES:Barcelona': [41.3851, 2.1734],
  'DE:Berlin': [52.5200, 13.4050],
  'FR:París': [48.8566, 2.3522], 'FR:Paris': [48.8566, 2.3522],
  'GB:London': [51.5074, -0.1278], 'GB:Londres': [51.5074, -0.1278],
  'PT:Lisboa': [38.7169, -9.1399], 'PT:Lisbon': [38.7169, -9.1399],
  'CA:Toronto': [43.6510, -79.3470],
  'CA:Vancouver': [49.2827, -123.1207],
  'AU:Sydney': [-33.8688, 151.2093],
  'AU:Melbourne': [-37.8136, 144.9631],
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  'CO': [4.5709, -74.2973],
  'MX': [23.6345, -102.5528],
  'AR': [-38.4161, -63.6167],
  'CL': [-35.6751, -71.5430],
  'PE': [-9.1900, -75.0152],
  'EC': [-1.8312, -78.1834],
  'VE': [6.4238, -66.5897],
  'BR': [-14.2350, -51.9253],
  'US': [37.0902, -95.7129],
  'ES': [40.4637, -3.7492],
  'DE': [51.1657, 10.4515],
  'FR': [46.2276, 2.2137],
  'GB': [55.3781, -3.4360],
  'PT': [39.3999, -8.2245],
  'CA': [56.1304, -106.3468],
  'AU': [-25.2744, 133.7751],
}

function getApproxCoords(city?: string | null, country?: string | null): { lat: number; lng: number } | null {
  if (city && country) {
    const key = `${country}:${city}`
    if (CITY_COORDS[key]) return { lat: CITY_COORDS[key][0], lng: CITY_COORDS[key][1] }
    const lk = key.toLowerCase()
    const found = Object.entries(CITY_COORDS).find(([k]) => k.toLowerCase() === lk)
    if (found) return { lat: found[1][0], lng: found[1][1] }
  }
  if (country && COUNTRY_COORDS[country]) return { lat: COUNTRY_COORDS[country][0], lng: COUNTRY_COORDS[country][1] }
  return null
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36)
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!['store_owner', 'admin', 'superadmin'].includes(session.role)) return forbidden()

    const userId = Number(session.sub)
    const body = await req.json()
    if (!body.name?.trim()) return badRequest('El nombre de la tienda es requerido')

    /* Check if user already has a store */
    const [existing] = await db.select({ id: marketplace_store.id })
      .from(marketplace_store).where(eq(marketplace_store.owner_id, userId)).limit(1)
    if (existing) return conflict('Ya tienes una tienda registrada')

    const slug = toSlug(body.name.trim())
    const [store] = await db.insert(marketplace_store).values({
      owner_id: userId,
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      store_type: body.store_type ?? 'academy',
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      country: body.country || 'CO',
      city: body.city || null,
      logo_url: body.logo_url || null,
      cover_url: body.cover_url || null,
      plan: 'free',
      state: 'active',
    }).returning()

    return created(store)
  } catch (e) {
    console.error('[stores POST]', e)
    return serverError()
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(48, Math.max(1, Number(searchParams.get('limit') ?? '12')))
    const offset = (page - 1) * limit

    const q = searchParams.get('q')
    const store_type = searchParams.get('type')
    const is_verified = searchParams.get('verified')
    const modality = searchParams.get('modality')
    const rating_min = searchParams.get('rating_min')
    const sort = searchParams.get('sort') ?? 'newest'

    const conditions = [
      eq(marketplace_store.state, 'active'),
      isNull(marketplace_store.deleted_at),
    ]

    if (q) conditions.push(ilike(marketplace_store.name, `%${q}%`))
    if (store_type) conditions.push(eq(marketplace_store.store_type, store_type as 'academy' | 'individual' | 'corporate' | 'government'))
    if (is_verified === '1') conditions.push(eq(marketplace_store.is_verified, true))
    if (modality) conditions.push(eq(marketplace_store.modality, modality))
    if (rating_min) conditions.push(gte(marketplace_store.rating_avg, rating_min))

    const orderBy = (() => {
      switch (sort) {
        case 'rating': return desc(marketplace_store.rating_avg)
        case 'students': return desc(marketplace_store.total_students)
        case 'courses': return desc(marketplace_store.total_courses)
        case 'name_asc': return asc(marketplace_store.name)
        default: return desc(marketplace_store.created_at)
      }
    })()

    const where = and(...conditions)

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(marketplace_store)
      .where(where)

    const stores = await db
      .select({
        id: marketplace_store.id,
        name: marketplace_store.name,
        slug: marketplace_store.slug,
        store_type: marketplace_store.store_type,
        description: marketplace_store.description,
        logo_url: marketplace_store.logo_url,
        cover_url: marketplace_store.cover_url,
        country: marketplace_store.country,
        city: marketplace_store.city,
        modality: marketplace_store.modality,
        plan: marketplace_store.plan,
        total_courses: marketplace_store.total_courses,
        total_students: marketplace_store.total_students,
        rating_avg: marketplace_store.rating_avg,
        rating_count: marketplace_store.rating_count,
        is_verified: marketplace_store.is_verified,
        created_at: marketplace_store.created_at,
        owner_name: res_users.name,
      })
      .from(marketplace_store)
      .leftJoin(res_users, eq(marketplace_store.owner_id, res_users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    const storesWithCoords = stores.map(s => {
      const coords = getApproxCoords(s.city, s.country)
      return { ...s, lat: coords?.lat ?? null, lng: coords?.lng ?? null }
    })

    return ok(storesWithCoords, 'OK', pageMeta(total, page, limit))
  } catch (e) {
    console.error('[stores/list]', e)
    return serverError()
  }
}
