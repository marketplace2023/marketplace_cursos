import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { hashSync } from 'bcryptjs'
import * as schema from '../schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Seeding minimal data...')

  /* ── 1. roles/groups ── */
  const groups = await db.insert(schema.res_groups).values([
    { name: 'marketplace_buyer',     full_name: 'Comprador final' },
    { name: 'marketplace_store_owner', full_name: 'Propietario de tienda' },
    { name: 'marketplace_instructor', full_name: 'Instructor' },
    { name: 'marketplace_admin',     full_name: 'Administrador' },
    { name: 'marketplace_superadmin', full_name: 'Superadministrador' },
    { name: 'marketplace_support',   full_name: 'Soporte operativo' },
    { name: 'marketplace_marketing', full_name: 'Marketing' },
    { name: 'marketplace_finance',   full_name: 'Finanzas' },
    { name: 'marketplace_compliance', full_name: 'Compliance / Moderación' },
    { name: 'marketplace_analyst',   full_name: 'Analista' },
    { name: 'marketplace_b2b',       full_name: 'Usuario corporativo B2B' },
  ]).onConflictDoNothing().returning()

  console.log(`  ✓ ${groups.length} groups`)

  const pw = hashSync('Demo1234!', 10)

  /* ── 2. users (one per relevant role) ── */
  const users = await db.insert(schema.res_users).values([
    {
      name: 'Admin', last_name: 'Sistema', email: 'admin@edumarket.demo',
      password_hash: pw, user_type: 'admin', state: 'active',
      email_verified: true, terms_accepted: true, privacy_accepted: true,
      fur_code: 'FUR-U-001', username: 'admin',
    },
    {
      name: 'Ana', last_name: 'García', email: 'tienda@edumarket.demo',
      password_hash: pw, user_type: 'store_owner', state: 'active',
      email_verified: true, terms_accepted: true, privacy_accepted: true,
      fur_code: 'FUR-U-002', username: 'ana_garcia',
    },
    {
      name: 'Carlos', last_name: 'Mendoza', email: 'instructor@edumarket.demo',
      password_hash: pw, user_type: 'instructor', state: 'active',
      email_verified: true, terms_accepted: true, privacy_accepted: true,
      fur_code: 'FUR-U-003', username: 'carlos_mendoza',
    },
    {
      name: 'Laura', last_name: 'Romero', email: 'comprador@edumarket.demo',
      password_hash: pw, user_type: 'buyer', state: 'active',
      email_verified: true, terms_accepted: true, privacy_accepted: true,
      fur_code: 'FUR-U-004', username: 'laura_romero',
    },
    {
      name: 'Soporte', last_name: 'EduMarket', email: 'soporte@edumarket.demo',
      password_hash: pw, user_type: 'support', state: 'active',
      email_verified: true, terms_accepted: true, privacy_accepted: true,
      fur_code: 'FUR-U-005', username: 'soporte',
    },
  ]).onConflictDoNothing().returning()

  console.log(`  ✓ ${users.length} users`)

  /* ── 3. category ── */
  const cats = await db.insert(schema.product_category).values([
    {
      name: 'Desarrollo Web', slug: 'desarrollo-web',
      description: 'Cursos de programación y desarrollo web',
      icon: 'FaCode', featured: true,
    },
  ]).onConflictDoNothing().returning()

  console.log(`  ✓ ${cats.length} categories`)

  if (users.length === 0 || cats.length === 0) {
    console.log('  ⚠ Data already exists, skipping store/course creation')
    return
  }

  const storeOwner = users.find(u => u.user_type === 'store_owner')!
  const instructor = users.find(u => u.user_type === 'instructor')!

  /* ── 4. store ── */
  const stores = await db.insert(schema.marketplace_store).values([
    {
      name: 'Academia Tech Demo', legal_name: 'Tech Demo S.A.',
      slug: 'academia-tech-demo', store_type: 'academy',
      state: 'active', owner_id: storeOwner.id,
      description: 'Academia líder en formación tecnológica profesional.',
      email: 'contacto@techdem.demo', country: 'US',
      city: 'Miami', modality: 'online',
      is_verified: true, plan: 'pro', commission_rate: '15.00',
      fur_code: 'FUR-T-001',
    },
  ]).onConflictDoNothing().returning()

  console.log(`  ✓ ${stores.length} stores`)

  if (stores.length === 0) {
    console.log('  ⚠ Skipping course/lesson seeding')
    return
  }

  const store = stores[0]

  /* ── 5. course ── */
  const courses = await db.insert(schema.product_template).values([
    {
      name: 'Desarrollo Web Full Stack con React y Next.js',
      subtitle: 'De cero a profesional en desarrollo moderno',
      slug: 'desarrollo-web-full-stack-react-nextjs',
      description: 'Aprende a construir aplicaciones web completas con las tecnologías más demandadas del mercado.',
      learning_objectives: JSON.stringify([
        'Dominar HTML5, CSS3 y JavaScript moderno',
        'Construir UIs reactivas con React',
        'Desarrollar aplicaciones full-stack con Next.js',
        'Gestionar bases de datos con PostgreSQL',
      ]),
      requirements: JSON.stringify(['Conocimientos básicos de HTML', 'Computadora con internet']),
      target_audience: 'Desarrolladores junior y personas que quieren iniciar en programación web',
      category_id: cats[0].id,
      level: 'beginner',
      language: 'es',
      modality: 'online_async',
      format: 'video',
      duration_hours: '48.00',
      store_id: store.id,
      instructor_id: instructor.id,
      has_certificate: true,
      list_price: '199.00',
      sale_price: '49.00',
      currency: 'USD',
      is_free: false,
      state: 'published',
      is_featured: true,
      is_bestseller: true,
      cover_url: '/images/course-placeholder.jpg',
      fur_code: 'FUR-P-001',
      published_at: new Date(),
    },
  ]).onConflictDoNothing().returning()

  console.log(`  ✓ ${courses.length} courses`)

  if (courses.length === 0) return

  const course = courses[0]

  /* ── 6. module + lesson ── */
  const modules = await db.insert(schema.slide_channel).values([
    { course_id: course.id, name: 'Módulo 1: Fundamentos', sort_order: 1 },
  ]).returning()

  await db.insert(schema.slide_slide).values([
    {
      channel_id: modules[0].id, course_id: course.id,
      name: 'Introducción al curso', slide_type: 'video',
      duration: 300, sort_order: 1, is_preview: true,
    },
  ])

  console.log('  ✓ 1 module, 1 lesson')

  /* ── 7. instructor profile ── */
  await db.insert(schema.marketplace_instructor).values([
    {
      user_id: instructor.id, store_id: store.id,
      headline: 'Desarrollador Full Stack con 8 años de experiencia',
      expertise: JSON.stringify(['React', 'Next.js', 'Node.js', 'PostgreSQL']),
    },
  ]).onConflictDoNothing()

  /* ── 8. home sections ── */
  await db.insert(schema.marketplace_home_section).values([
    { key: 'hero',              title: 'Hero principal',       sort_order: 1, active: true, config: JSON.stringify({ type: 'hero' }) },
    { key: 'featured_courses',  title: 'Cursos destacados',    sort_order: 2, active: true, config: JSON.stringify({ limit: 8, filter: 'featured' }) },
    { key: 'featured_stores',   title: 'Academias destacadas', sort_order: 3, active: true, config: JSON.stringify({ limit: 6, filter: 'verified' }) },
    { key: 'categories',        title: 'Categorías populares', sort_order: 4, active: true, config: JSON.stringify({ limit: 8 }) },
    { key: 'bestsellers',       title: 'Más vendidos',         sort_order: 5, active: true, config: JSON.stringify({ limit: 8, filter: 'bestseller' }) },
    { key: 'new_courses',       title: 'Nuevos cursos',        sort_order: 6, active: true, config: JSON.stringify({ limit: 8, filter: 'new' }) },
    { key: 'plans',             title: 'Planes y suscripciones', sort_order: 7, active: true, config: JSON.stringify({ type: 'plans' }) },
    { key: 'testimonials',      title: 'Testimonios',          sort_order: 8, active: true, config: JSON.stringify({ type: 'testimonials' }) },
    { key: 'cta_buy',           title: 'CTA compradores',      sort_order: 9, active: true, config: JSON.stringify({ type: 'cta_buy' }) },
    { key: 'cta_sell',          title: 'CTA vender cursos',    sort_order: 10, active: true, config: JSON.stringify({ type: 'cta_sell' }) },
  ]).onConflictDoNothing()

  /* ── 9. subscription plans ── */
  await db.insert(schema.marketplace_subscription_plan).values([
    { name: 'Free',       slug: 'store-free',       target: 'store', period: 'monthly', price: '0.00',    features: JSON.stringify(['5 cursos', '1 usuario staff', 'Comisión 20%']),           max_courses: 5,  max_users: 1,  commission_rate: '20.00', sort_order: 1 },
    { name: 'Basic',      slug: 'store-basic',      target: 'store', period: 'monthly', price: '29.00',   features: JSON.stringify(['20 cursos', '3 usuarios staff', 'Comisión 15%']),          max_courses: 20, max_users: 3,  commission_rate: '15.00', sort_order: 2 },
    { name: 'Pro',        slug: 'store-pro',        target: 'store', period: 'monthly', price: '79.00',   features: JSON.stringify(['100 cursos', '10 usuarios staff', 'Comisión 10%']),        max_courses: 100, max_users: 10, commission_rate: '10.00', sort_order: 3 },
    { name: 'Enterprise', slug: 'store-enterprise', target: 'store', period: 'monthly', price: '199.00',  features: JSON.stringify(['Cursos ilimitados', 'Staff ilimitado', 'Comisión 7%']),    commission_rate: '7.00',  sort_order: 4 },
  ]).onConflictDoNothing()

  console.log('  ✓ 4 subscription plans')
  console.log('✅ Seed complete!')
  console.log('')
  console.log('📧 Demo credentials (password: Demo1234!):')
  console.log('   admin@edumarket.demo       → Administrador')
  console.log('   tienda@edumarket.demo      → Propietario de tienda')
  console.log('   instructor@edumarket.demo  → Instructor')
  console.log('   comprador@edumarket.demo   → Comprador')
  console.log('   soporte@edumarket.demo     → Soporte')
}

seed().catch(console.error)
