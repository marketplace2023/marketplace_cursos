import { db } from '@/lib/db'
import { res_users, marketplace_instructor } from '@/lib/db/schema'
import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm'
import { ok, serverError, pageMeta } from '@/lib/api/response'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    const sort = searchParams.get('sort') ?? 'popular'
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))
    const offset = (page - 1) * limit

    const conditions = [eq(res_users.user_type, 'instructor'), eq(res_users.state, 'active')]
    if (q) conditions.push(ilike(res_users.name, `%${q}%`))

    const where = and(...conditions)

    let orderBy
    switch (sort) {
      case 'rating': orderBy = desc(marketplace_instructor.rating_avg); break
      case 'students': orderBy = desc(marketplace_instructor.total_students); break
      case 'courses': orderBy = desc(marketplace_instructor.total_courses); break
      default: orderBy = desc(marketplace_instructor.total_students)
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(res_users)
      .leftJoin(marketplace_instructor, eq(marketplace_instructor.user_id, res_users.id))
      .where(where)

    const instructors = await db
      .select({
        id: res_users.id,
        name: res_users.name,
        last_name: res_users.last_name,
        public_name: res_users.public_name,
        username: res_users.username,
        avatar_url: res_users.avatar_url,
        bio: res_users.bio,
        country: res_users.country,
        headline: marketplace_instructor.headline,
        expertise: marketplace_instructor.expertise,
        rating_avg: marketplace_instructor.rating_avg,
        rating_count: marketplace_instructor.rating_count,
        total_courses: marketplace_instructor.total_courses,
        total_students: marketplace_instructor.total_students,
      })
      .from(res_users)
      .leftJoin(marketplace_instructor, eq(marketplace_instructor.user_id, res_users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    const data = instructors.map(i => ({
      ...i,
      display_name: i.public_name ?? `${i.name}${i.last_name ? ' ' + i.last_name : ''}`,
      expertise: i.expertise ? JSON.parse(i.expertise) : [],
    }))

    return ok(data, 'OK', pageMeta(count, page, limit))
  } catch {
    return serverError()
  }
}
