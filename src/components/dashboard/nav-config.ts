import {
  FaHome, FaBookOpen, FaShoppingBag, FaHeart, FaCertificate,
  FaUserCircle, FaCog, FaBell, FaComments, FaLifeRing,
  FaStore, FaPlus, FaChartBar, FaMoneyBillWave, FaUsers,
  FaStar, FaBullhorn, FaClipboardList, FaFileInvoice,
  FaShieldAlt, FaSearchDollar, FaGavel, FaDatabase,
  FaUserTie, FaBuilding, FaTicketAlt, FaTags, FaPercent,
  FaLayerGroup, FaChartLine, FaUsersCog, FaLock,
  FaCreditCard, FaListAlt, FaCalendarAlt, FaQuestion,
  FaStickyNote, FaWallet,
} from 'react-icons/fa'
import type { NavItem } from './sidebar-nav'

export const BUYER_NAV: NavItem[] = [
  { label: 'Inicio', href: '/dashboard/comprador', icon: FaHome },
  { label: 'Mis cursos', href: '/dashboard/comprador/cursos', icon: FaBookOpen },
  { label: 'Evaluaciones', href: '/dashboard/comprador/evaluaciones', icon: FaClipboardList },
  { label: 'Mis notas', href: '/dashboard/comprador/notas', icon: FaStickyNote },
  { label: 'Mis certificados', href: '/dashboard/comprador/certificados', icon: FaCertificate },
  { label: 'Mis órdenes', href: '/dashboard/comprador/ordenes', icon: FaShoppingBag },
  { label: 'Facturación', href: '/dashboard/comprador/facturacion', icon: FaFileInvoice },
  { label: 'Favoritos', href: '/dashboard/comprador/favoritos', icon: FaHeart },
  { label: 'Reseñas', href: '/dashboard/comprador/reviews', icon: FaStar },
  { label: 'Mensajes', href: '/dashboard/comprador/mensajes', icon: FaComments },
  { label: 'Notificaciones', href: '/dashboard/comprador/notificaciones', icon: FaBell },
  { label: 'Soporte', href: '/dashboard/comprador/soporte', icon: FaLifeRing },
  { label: 'Mi perfil', href: '/dashboard/comprador/perfil', icon: FaUserCircle },
  { label: 'Configuración', href: '/dashboard/comprador/configuracion', icon: FaCog },
]

export const STORE_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/tienda', icon: FaHome },
  { label: 'Mis cursos', href: '/dashboard/tienda/cursos', icon: FaBookOpen },
  { label: 'Crear curso', href: '/dashboard/tienda/cursos/nuevo', icon: FaPlus },
  { label: 'Ventas', href: '/dashboard/tienda/ventas', icon: FaMoneyBillWave },
  { label: 'Estudiantes', href: '/dashboard/tienda/estudiantes', icon: FaUsers },
  { label: 'Reseñas', href: '/dashboard/tienda/reviews', icon: FaStar },
  { label: 'Finanzas', href: '/dashboard/tienda/finanzas', icon: FaCreditCard },
  { label: 'Retiros', href: '/dashboard/tienda/retiros', icon: FaWallet },
  { label: 'Promociones', href: '/dashboard/tienda/promociones', icon: FaTags },
  { label: 'Publicidad', href: '/dashboard/tienda/publicidad', icon: FaBullhorn },
  { label: 'Reportes', href: '/dashboard/tienda/reportes', icon: FaChartBar },
  { label: 'Verificación', href: '/dashboard/tienda/verificacion', icon: FaShieldAlt },
  { label: 'Perfil de tienda', href: '/dashboard/tienda/perfil', icon: FaStore },
  { label: 'Instructores', href: '/dashboard/tienda/instructores', icon: FaUsers },
  { label: 'SEO', href: '/dashboard/tienda/seo', icon: FaSearchDollar },
  { label: 'Configuración', href: '/dashboard/tienda/configuracion', icon: FaCog },
]

export const INSTRUCTOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/instructor', icon: FaHome },
  { label: 'Mis cursos', href: '/dashboard/instructor/cursos', icon: FaBookOpen },
  { label: 'Estudiantes', href: '/dashboard/instructor/estudiantes', icon: FaUsers },
  { label: 'Contenido', href: '/dashboard/instructor/contenido', icon: FaLayerGroup },
  { label: 'Evaluaciones', href: '/dashboard/instructor/evaluaciones', icon: FaClipboardList },
  { label: 'Preguntas', href: '/dashboard/instructor/preguntas', icon: FaQuestion },
  { label: 'Reseñas', href: '/dashboard/instructor/reviews', icon: FaStar },
  { label: 'Mensajes', href: '/dashboard/instructor/mensajes', icon: FaComments },
  { label: 'Ingresos', href: '/dashboard/instructor/ingresos', icon: FaMoneyBillWave },
  { label: 'Reportes', href: '/dashboard/instructor/reportes', icon: FaChartLine },
  { label: 'Calendario', href: '/dashboard/instructor/calendario', icon: FaCalendarAlt },
  { label: 'Soporte', href: '/dashboard/instructor/soporte', icon: FaLifeRing },
  { label: 'Mi perfil', href: '/dashboard/instructor/perfil', icon: FaUserTie },
]

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: FaHome },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: FaUsers },
  { label: 'Compradores', href: '/dashboard/admin/compradores', icon: FaUserCircle },
  { label: 'Tiendas', href: '/dashboard/admin/tiendas', icon: FaStore },
  { label: 'Instructores', href: '/dashboard/admin/instructores', icon: FaUserTie },
  { label: 'Staff', href: '/dashboard/admin/staff', icon: FaUsersCog },
  { label: 'Cursos', href: '/dashboard/admin/cursos', icon: FaBookOpen },
  { label: 'Moderación', href: '/dashboard/admin/cursos/moderacion', icon: FaGavel },
  { label: 'Categorías', href: '/dashboard/admin/categorias', icon: FaListAlt },
  { label: 'Pedidos', href: '/dashboard/admin/pedidos', icon: FaShoppingBag },
  { label: 'Pagos', href: '/dashboard/admin/pagos', icon: FaCreditCard },
  { label: 'Reembolsos', href: '/dashboard/admin/reembolsos', icon: FaMoneyBillWave },
  { label: 'Comisiones', href: '/dashboard/admin/comisiones', icon: FaPercent },
  { label: 'Suscripciones', href: '/dashboard/admin/suscripciones', icon: FaClipboardList },
  { label: 'Reseñas', href: '/dashboard/admin/reviews', icon: FaStar },
  { label: 'Publicidad', href: '/dashboard/admin/publicidad', icon: FaBullhorn },
  { label: 'Home Manager', href: '/dashboard/admin/home-manager', icon: FaHome },
  { label: 'Soporte', href: '/dashboard/admin/soporte', icon: FaTicketAlt },
  { label: 'Notificaciones', href: '/dashboard/admin/notificaciones', icon: FaBell },
  { label: 'Reportes', href: '/dashboard/admin/reportes', icon: FaChartLine },
  { label: 'Auditoría', href: '/dashboard/admin/auditoria', icon: FaDatabase },
  { label: 'SEO', href: '/dashboard/admin/seo', icon: FaSearchDollar },
  { label: 'FUR-U', href: '/dashboard/admin/fur-u', icon: FaUserCircle },
  { label: 'FUR-T', href: '/dashboard/admin/fur-t', icon: FaStore },
  { label: 'FUR-P', href: '/dashboard/admin/fur-p', icon: FaBookOpen },
  { label: 'FUR-GBP', href: '/dashboard/admin/fur-gbp', icon: FaBuilding },
  { label: 'Roles', href: '/dashboard/admin/roles', icon: FaLock },
  { label: 'Salud del sistema', href: '/dashboard/admin/salud', icon: FaShieldAlt },
  { label: 'Configuración', href: '/dashboard/admin/configuracion', icon: FaCog },
]

export const SUPPORT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/soporte', icon: FaHome },
  { label: 'Todos los tickets', href: '/dashboard/soporte/tickets', icon: FaTicketAlt },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: FaUsers },
  { label: 'Órdenes', href: '/dashboard/admin/pedidos', icon: FaShoppingBag },
  { label: 'Mensajes', href: '/dashboard/comprador/mensajes', icon: FaComments },
]

export const MARKETING_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/marketing', icon: FaHome },
  { label: 'Campañas', href: '/dashboard/marketing/campanas', icon: FaBullhorn },
  { label: 'Cupones', href: '/dashboard/marketing/cupones', icon: FaPercent },
  { label: 'Banners', href: '/dashboard/marketing/banners', icon: FaHome },
  { label: 'SEO', href: '/dashboard/admin/seo', icon: FaSearchDollar },
  { label: 'Notificaciones', href: '/dashboard/admin/notificaciones', icon: FaBell },
]

export const FINANCE_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/finanzas', icon: FaHome },
  { label: 'Cobros', href: '/dashboard/finanzas/cobros', icon: FaMoneyBillWave },
  { label: 'Liquidaciones', href: '/dashboard/finanzas/liquidaciones', icon: FaCreditCard },
  { label: 'Suscripciones', href: '/dashboard/admin/suscripciones', icon: FaClipboardList },
  { label: 'Reportes', href: '/dashboard/admin/reportes', icon: FaChartBar },
]

export const COMPLIANCE_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/compliance', icon: FaHome },
  { label: 'Casos', href: '/dashboard/compliance/casos', icon: FaGavel },
  { label: 'FUR-U', href: '/dashboard/compliance/fur-u', icon: FaUserCircle },
  { label: 'FUR-T', href: '/dashboard/compliance/fur-t', icon: FaStore },
  { label: 'FUR-P', href: '/dashboard/compliance/fur-p', icon: FaBookOpen },
  { label: 'Auditoría', href: '/dashboard/admin/auditoria', icon: FaDatabase },
]

export const B2B_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/corporativo', icon: FaHome },
  { label: 'Mi formación', href: '/dashboard/corporativo/equipo', icon: FaUsersCog },
  { label: 'Cotizaciones', href: '/dashboard/corporativo/cotizaciones', icon: FaFileInvoice },
  { label: 'Mis cursos', href: '/dashboard/comprador/cursos', icon: FaBookOpen },
]

export function getNavForRole(role: string): NavItem[] {
  switch (role) {
    case 'store_owner': return STORE_NAV
    case 'instructor': return INSTRUCTOR_NAV
    case 'admin':
    case 'superadmin': return ADMIN_NAV
    case 'support': return SUPPORT_NAV
    case 'marketing': return MARKETING_NAV
    case 'finance': return FINANCE_NAV
    case 'compliance': return COMPLIANCE_NAV
    case 'analyst': return ADMIN_NAV
    case 'b2b_user': return B2B_NAV
    default: return BUYER_NAV
  }
}

export function getDashboardTitle(role: string): string {
  const titles: Record<string, string> = {
    buyer: 'Mi cuenta',
    store_owner: 'Mi tienda',
    instructor: 'Instructor',
    admin: 'Administración',
    superadmin: 'Super Admin',
    support: 'Soporte',
    marketing: 'Marketing',
    finance: 'Finanzas',
    compliance: 'Compliance',
    analyst: 'Analítica',
    b2b_user: 'Corporativo',
  }
  return titles[role] ?? 'Dashboard'
}
