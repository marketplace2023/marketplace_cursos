# PRD — Marketplace de Cursos y Capacitación Profesional

**Código del documento:** PRD-MC-001  
**Versión:** 1.0  
**Estado:** Documento maestro funcional y técnico  
**Fecha:** 2026-06-16  
**Producto:** Marketplace multi-tienda de cursos y capacitación profesional  
**Stack propuesto:** React.js + NestJS + MySQL + JSON-LD  
**Modelo de datos:** Fichas Únicas de Registro (FUR)  
**Referencia ERP:** Modelos normalizados de Odoo como referencia conceptual, sin integración obligatoria  
**Idioma principal:** Español  
**Mercado inicial:** Estados Unidos, con capacidad multi-país, multi-moneda y multi-idioma  

---

# 1. Resumen ejecutivo

El Marketplace de Cursos y Capacitación Profesional será una plataforma digital multi-tienda que conectará compradores, estudiantes, academias, instructores, proveedores de formación y clientes corporativos B2B.

El producto permitirá descubrir, comparar, comprar, impartir, gestionar y evaluar cursos de formación profesional. La plataforma combinará un catálogo público tipo marketplace, perfiles de tiendas y academias, fichas de cursos, carrito de compras, checkout, pagos, suscripciones, publicidad interna, reseñas, certificados, mensajería, notificaciones, dashboards por rol y herramientas administrativas.

La gobernanza de datos se apoyará en Fichas Únicas de Registro:

- **FUR-GBP:** ficha del perfil empresarial o Google Business Profile.
- **FUR-U:** ficha de usuario.
- **FUR-P:** ficha del producto o curso.
- **FUR-T:** ficha de tienda o academia.

El frontend se desarrollará en React.js, el backend en NestJS y la base de datos operacional en MySQL. JSON-LD se empleará para generar datos estructurados y mejorar la interoperabilidad semántica, el SEO técnico y la exposición de entidades como cursos, personas, organizaciones, tiendas y ofertas.

---

# 2. Visión del producto

## 2.1 Visión

Construir un ecosistema digital escalable donde múltiples academias e instructores puedan crear tiendas, publicar cursos, captar estudiantes, vender formación y administrar su operación comercial, mientras los compradores acceden a una experiencia confiable de búsqueda, comparación, compra y aprendizaje.

## 2.2 Propuesta de valor

### Para compradores

- Encontrar cursos de múltiples academias en un solo lugar.
- Comparar precio, modalidad, duración, nivel, reputación y certificación.
- Comprar cursos individualmente o mediante planes.
- Acceder a cursos, materiales, evaluaciones y certificados.
- Consultar opiniones verificadas de otros estudiantes.
- Solicitar cotizaciones para compras corporativas o grupales.

### Para tiendas y academias

- Crear una presencia comercial propia dentro del marketplace.
- Publicar y administrar cursos.
- Gestionar instructores, alumnos, ventas, promociones y reseñas.
- Acceder a reportes comerciales y académicos.
- Contratar publicidad interna y posiciones destacadas.
- Recibir pagos y consultar comisiones y liquidaciones.

### Para instructores

- Crear y administrar contenido formativo.
- Atender estudiantes.
- Gestionar evaluaciones y seguimiento.
- Consultar desempeño, reputación e ingresos asociados.

### Para el operador del marketplace

- Monetizar mediante comisiones, suscripciones, publicidad y servicios premium.
- Administrar usuarios, tiendas, cursos, pagos, moderación y soporte.
- Mantener datos estructurados y gobernados mediante fichas FUR.
- Medir rendimiento por medio de KPI y reportes.

---

# 3. Objetivos del producto

## 3.1 Objetivo general

Desarrollar un marketplace multi-tienda de cursos que integre catálogo público, venta de cursos, perfiles de tiendas y academias, dashboards por rol, pagos, suscripciones, publicidad, reputación, certificación, soporte, SEO estructurado y gobierno de datos mediante fichas FUR.

## 3.2 Objetivos específicos

1. Diseñar un home público moderno, responsive y orientado a conversión.
2. Crear un catálogo navegable de cursos, categorías, instructores y tiendas.
3. Implementar fichas públicas de curso y tienda.
4. Diseñar dashboards privados por perfil.
5. Implementar carrito, checkout, pagos, cupones y órdenes.
6. Estructurar las fichas FUR-GBP, FUR-U, FUR-P y FUR-T.
7. Generar JSON-LD para cursos, personas, organizaciones, tiendas y ofertas.
8. Implementar roles, permisos y auditoría.
9. Incorporar reviews, reputación y moderación.
10. Implementar notificaciones, mensajería y soporte.
11. Incorporar analítica, KPI y reportes.
12. Permitir la evolución hacia compras corporativas B2B, suscripciones y cursos en vivo.

---

# 4. Alcance del producto

## 4.1 Alcance incluido

### Experiencia pública

- Home público.
- Navegación por categorías y subcategorías.
- Búsqueda y filtros.
- Catálogo de cursos.
- Catálogo de tiendas y academias.
- Catálogo de instructores.
- Ficha pública de curso.
- Ficha pública de tienda.
- Ficha pública de instructor.
- Promociones y ofertas.
- Planes y suscripciones.
- Carrito.
- Checkout.
- Registro, login y recuperación de acceso.
- Páginas legales y de ayuda.
- Datos estructurados JSON-LD.

### Comprador final

- Perfil.
- Cursos comprados.
- Progreso.
- Certificados.
- Compras y facturación.
- Favoritos.
- Reviews.
- Notificaciones.
- Mensajería y soporte.

### Tienda o academia

- Perfil de tienda.
- FUR-T y FUR-GBP.
- Usuarios internos.
- Cursos y FUR-P.
- Contenido académico.
- Estudiantes.
- Ventas.
- Promociones.
- Publicidad.
- Finanzas.
- Reportes.
- Configuración SEO y JSON-LD.

### Instructor

- Perfil profesional.
- Cursos asignados.
- Contenido.
- Evaluaciones.
- Estudiantes.
- Mensajes.
- Reportes.
- Ingresos.

### Administrador

- Gestión global de usuarios.
- Gestión de tiendas.
- Gestión de cursos.
- Validación de fichas FUR.
- Gestión del home.
- Publicidad.
- Pedidos.
- Pagos.
- Comisiones.
- Moderación.
- Soporte.
- Reportes.
- Auditoría.
- Seguridad.

### Perfiles operativos

- Soporte.
- Marketing.
- Finanzas.
- Moderación y compliance.
- Usuario corporativo B2B.

## 4.2 Fuera de alcance inicial

- Aplicaciones móviles nativas.
- Integración obligatoria con Odoo.
- Contabilidad financiera completa tipo ERP.
- Gestión de inventario físico.
- Videoconferencia propia.
- Motor de streaming propio.
- Inteligencia artificial avanzada para generación automática de cursos.
- Analítica predictiva compleja.
- Emisión de acreditaciones académicas oficiales reguladas.
- Marketplace de empleo.
- Gestión presencial de aulas o sedes físicas en el MVP.
- Integración con múltiples LMS externos en la primera etapa.

## 4.3 Alcance futuro

- Aplicaciones móviles.
- Cursos en vivo.
- Integración con LMS externos.
- Afiliados.
- Membresías avanzadas.
- Marketplaces regionales.
- Recomendaciones con IA.
- Asistente educativo.
- Traducción automática.
- Integraciones contables.
- Integración opcional con Odoo.
- Gestión de formación empresarial.
- Gestión de cohortes.
- Marketplace de tutores.
- Programas de acreditación.

---

# 5. Usuarios, perfiles y roles

## 5.1 Roles principales

| Rol | Descripción | Acceso |
|---|---|---|
| Visitante | Usuario no autenticado que navega por el catálogo | Público |
| Comprador final | Persona que compra y consume cursos | Dashboard comprador |
| Usuario corporativo B2B | Empresa que compra formación para equipos | Dashboard corporativo |
| Propietario de tienda | Responsable principal de una academia o tienda | Dashboard tienda |
| Administrador de tienda | Gestiona operación, cursos, ventas y usuarios de tienda | Dashboard tienda |
| Instructor | Crea o imparte cursos | Dashboard instructor |
| Administrador del marketplace | Gestiona la plataforma completa | Dashboard administrador |
| Superadministrador | Control total técnico y funcional | Dashboard global |
| Soporte operativo | Atiende tickets e incidencias | Dashboard soporte |
| Marketing | Gestiona campañas, promociones y publicidad | Dashboard marketing |
| Finanzas | Gestiona cobros, comisiones, retiros y conciliaciones | Dashboard finanzas |
| Moderador / Compliance | Valida fichas, cursos, tiendas y reseñas | Dashboard compliance |
| Analista | Consulta KPI y reportes | Dashboard analítico |

## 5.2 Principio de acceso

La plataforma aplicará control de acceso basado en roles y permisos. Cada acción deberá validarse en frontend y backend. Las operaciones críticas requerirán permisos específicos y quedarán registradas en auditoría.

## 5.3 Permisos CRUD generales

| Perfil | Crear | Leer | Actualizar | Eliminar | Aprobar | Publicar |
|---|---:|---:|---:|---:|---:|---:|
| Visitante | No | Público | No | No | No | No |
| Comprador | Cuenta propia | Propio | Propio | Limitado | No | Reviews propias |
| Tienda | Recursos propios | Propios | Propios | Archivar | Solicitar | Recursos propios |
| Instructor | Cursos autorizados | Asignados | Asignados | Limitado | No | Según permiso |
| Soporte | Tickets | Operativo | Tickets | No | No | No |
| Marketing | Campañas | Marketing | Campañas | Archivar | Según flujo | Sí |
| Finanzas | Ajustes autorizados | Financiero | Financiero | No | Reembolsos | No |
| Compliance | Casos | Moderación | Estados | No | Sí | Sí |
| Administrador | Global | Global | Global | Lógico | Sí | Sí |
| Superadministrador | Global | Global | Global | Global | Sí | Sí |

---

# 6. Arquitectura funcional

## 6.1 Dominios principales

1. Identidad y acceso.
2. Usuarios.
3. Tiendas y academias.
4. Instructores.
5. Cursos y contenido.
6. Categorías y taxonomías.
7. Búsqueda y descubrimiento.
8. Carrito y checkout.
9. Órdenes.
10. Pagos.
11. Suscripciones.
12. Promociones.
13. Publicidad.
14. Reviews y reputación.
15. Certificados.
16. Notificaciones.
17. Mensajería.
18. Soporte.
19. Fichas FUR.
20. JSON-LD y SEO.
21. Reportes y KPI.
22. Auditoría.
23. Configuración.
24. Gestión B2B.

## 6.2 Arquitectura por capas

### Capa pública

- Home.
- Catálogos.
- Fichas públicas.
- Contenido SEO.
- Registro y autenticación.

### Capa de aplicación

- Dashboard comprador.
- Dashboard tienda.
- Dashboard instructor.
- Dashboard administrador.
- Dashboards operativos.

### Capa de negocio

- Usuarios.
- Tiendas.
- Cursos.
- Ventas.
- Pagos.
- Suscripciones.
- FUR.
- Moderación.
- Soporte.

### Capa API

- API REST versionada.
- Autenticación JWT.
- Validación de DTO.
- Control de permisos.
- Manejo de errores.
- Webhooks.

### Capa de datos

- MySQL.
- Migraciones.
- Auditoría.
- Copias de seguridad.
- Índices.
- Datos históricos.

### Servicios externos

- Pasarela de pago.
- Almacenamiento de archivos.
- Correo electrónico.
- Notificaciones push.
- Analítica.
- Mapas.
- Monitoreo y observabilidad.

---

# 7. Arquitectura tecnológica

## 7.1 Frontend

- React.js.
- TypeScript.
- React Router.
- Redux Toolkit, Zustand o equivalente.
- React Query / TanStack Query.
- Tailwind CSS, Material UI o sistema de diseño propio.
- Formularios con React Hook Form.
- Validación con Zod o Yup.
- Renderizado de JSON-LD.
- Diseño responsive y accesible.

## 7.2 Backend

- NestJS.
- TypeScript.
- API REST.
- Passport.
- JWT.
- Guards por rol y permiso.
- DTO y validación.
- Prisma o TypeORM.
- OpenAPI / Swagger.
- Jobs programados.
- Webhooks.
- Sistema de eventos internos.

## 7.3 Base de datos

- MySQL.
- Tablas normalizadas.
- Índices por búsqueda y relaciones.
- Soft delete.
- Auditoría.
- Datos agregados para reportes.
- Migraciones versionadas.

## 7.4 SEO semántico

- JSON-LD.
- Schema.org.
- URL canónicas.
- Meta title.
- Meta description.
- Open Graph.
- Sitemap XML.
- Robots.txt.
- Breadcrumbs.
- Datos estructurados para Course, Product, Offer, Person, Organization, EducationalOrganization, AggregateRating y Review.

## 7.5 Referencia Odoo

Los modelos Odoo se utilizarán como referencia conceptual de normalización:

- `res.partner`.
- `res.users`.
- `res.groups`.
- `product.template`.
- `slide.channel`.
- `slide.slide`.
- `sale.order`.
- `website`.

No se establece una integración obligatoria con Odoo en el MVP. La base de datos operacional propuesta será MySQL.

---

# 8. Fichas Únicas de Registro

## 8.1 FUR-GBP — Perfil empresarial

### Objetivo

Registrar información pública, local y comercial de una tienda, academia, sede o entidad educativa.

### Campos principales

- Código FUR.
- Tienda relacionada.
- Nombre comercial.
- Razón social.
- Tipo de entidad.
- Categoría principal.
- Categorías secundarias.
- Descripción.
- Teléfono.
- Email.
- Website.
- URL de Google Business Profile.
- Dirección.
- País.
- Estado.
- Ciudad.
- Código postal.
- Latitud.
- Longitud.
- Área de servicio.
- Horarios.
- Modalidad.
- Idiomas.
- Logo.
- Portada.
- Galería.
- Rating.
- Total de reviews.
- Estado de verificación.
- Estado de publicación.
- Fuente.
- Referencia de sincronización.
- Auditoría.

## 8.2 FUR-U — Usuario

### Objetivo

Registrar identidad, acceso, perfil, preferencias, roles y estados de cada usuario.

### Campos principales

- Código FUR.
- Tipo de usuario.
- Estado.
- Nombre.
- Apellido.
- Nombre público.
- Username.
- Email.
- Teléfono.
- Verificaciones.
- Avatar.
- Ubicación.
- Idiomas.
- Biografía.
- Rol comercial.
- Tienda asociada.
- Nivel de acceso.
- Método de registro.
- Preferencias.
- Consentimientos.
- Zona horaria.
- Estado KYC.
- Métricas.
- Bloqueos.
- Auditoría.

## 8.3 FUR-P — Producto o curso

### Objetivo

Registrar todos los datos académicos, comerciales, editoriales y SEO de un curso.

### Campos principales

- Código FUR.
- SKU.
- Tipo de producto.
- Título.
- Subtítulo.
- Slug.
- Descripción.
- Objetivos de aprendizaje.
- Requisitos.
- Público objetivo.
- Categoría.
- Subcategoría.
- Etiquetas.
- Nivel.
- Idioma.
- Modalidad.
- Formato.
- Duración.
- Módulos.
- Lecciones.
- Fechas.
- Instructor.
- Tienda.
- Certificación.
- Precio.
- Oferta.
- Moneda.
- Tipo de acceso.
- Política de reembolso.
- Portada.
- Video de presentación.
- Recursos.
- Evaluaciones.
- Rating.
- Reviews.
- Estudiantes.
- Ventas.
- Estado.
- Visibilidad.
- SEO.
- Auditoría.

## 8.4 FUR-T — Tienda o academia

### Objetivo

Registrar la entidad comercial que publica y vende cursos.

### Campos principales

- Código FUR.
- Nombre.
- Razón social.
- Tipo de tienda.
- Propietario.
- Slug.
- Descripción.
- Logo.
- Portada.
- Galería.
- Email.
- Teléfono.
- Website.
- URL interna.
- Ubicación.
- Modalidad.
- Idiomas.
- Categorías.
- Total de cursos.
- Total de estudiantes.
- Total de ventas.
- Rating.
- Reviews.
- Verificación.
- Datos fiscales.
- Método de pago.
- Comisión.
- Plan.
- Fecha de alta.
- Estado.
- Políticas.
- Redes sociales.
- SEO.
- Auditoría.

## 8.5 Relaciones principales

- Una tienda tiene muchos cursos.
- Una tienda tiene muchos usuarios.
- Una tienda puede tener varias fichas GBP o sedes.
- Un instructor puede participar en varios cursos.
- Un comprador puede adquirir varios cursos.
- Una orden puede contener cursos de una o varias tiendas.
- Una review pertenece a un comprador y a un curso o tienda.
- Un certificado pertenece a una inscripción completada.
- Una ficha FUR conserva historial y auditoría.

---

# 9. Mapa de navegación pública

## 9.1 Header

- Logo.
- Buscador global.
- Categorías.
- Tiendas.
- Cursos.
- Promociones.
- Planes.
- Notificaciones.
- Favoritos.
- Carrito.
- Login.
- Registro.
- Menú de cuenta.

## 9.2 Home

- Hero principal.
- Búsqueda destacada.
- Categorías populares.
- Cursos destacados.
- Cursos más vendidos.
- Cursos nuevos.
- Tiendas destacadas.
- Academias verificadas.
- Instructores destacados.
- Promociones.
- Publicidad.
- Planes.
- Testimonios.
- Certificados.
- Contenido editorial.
- CTA para compradores.
- CTA para vender cursos.

## 9.3 Footer

- Sobre nosotros.
- Contacto.
- Ayuda.
- Preguntas frecuentes.
- Términos.
- Privacidad.
- Política de cookies.
- Política de reembolsos.
- Vender cursos.
- Crear tienda.
- Afiliados.
- Empresas.
- Blog.
- Categorías.
- Tiendas.
- Cursos populares.
- Redes sociales.
- Sitemap.

---

# 10. Listado de páginas públicas

| Código | Página | Objetivo |
|---|---|---|
| PUB-001 | Home | Presentar propuesta de valor y facilitar descubrimiento |
| PUB-002 | Categorías | Explorar taxonomía de cursos |
| PUB-003 | Resultados de búsqueda | Mostrar resultados y filtros |
| PUB-004 | Catálogo de cursos | Navegar todos los cursos |
| PUB-005 | Ficha de curso | Evaluar y comprar un curso |
| PUB-006 | Catálogo de tiendas | Descubrir academias |
| PUB-007 | Ficha de tienda | Consultar oferta y reputación de una tienda |
| PUB-008 | Catálogo de instructores | Descubrir instructores |
| PUB-009 | Perfil de instructor | Consultar cursos y reputación |
| PUB-010 | Promociones | Consultar ofertas |
| PUB-011 | Planes | Consultar planes y suscripciones |
| PUB-012 | Carrito | Revisar cursos seleccionados |
| PUB-013 | Checkout | Completar compra |
| PUB-014 | Confirmación de compra | Confirmar pago e inscripción |
| PUB-015 | Login | Iniciar sesión |
| PUB-016 | Registro | Crear cuenta |
| PUB-017 | Recuperar contraseña | Restablecer acceso |
| PUB-018 | Verificar email | Activar cuenta |
| PUB-019 | Ayuda | Consultar documentación |
| PUB-020 | FAQ | Resolver preguntas frecuentes |
| PUB-021 | Contacto | Contactar a la plataforma |
| PUB-022 | Términos | Exponer términos de uso |
| PUB-023 | Privacidad | Exponer política de privacidad |
| PUB-024 | Reembolsos | Exponer política de devoluciones |
| PUB-025 | Blog | Publicar contenido editorial |
| PUB-026 | Landing B2B | Captar clientes corporativos |
| PUB-027 | Solicitud de cotización | Solicitar oferta corporativa |
| PUB-028 | Sitemap | Navegación estructurada |

---

# 11. Dashboard del comprador final

## 11.1 Menú lateral

- Resumen.
- Mi perfil.
- Mis cursos.
- Continuar aprendiendo.
- Mis compras.
- Certificados.
- Favoritos.
- Reviews.
- Notificaciones.
- Mensajes.
- Facturación.
- Soporte.
- Configuración.
- Seguridad.
- Cerrar sesión.

## 11.2 Páginas

| Código | Página | Funciones |
|---|---|---|
| BUY-001 | Resumen | Cursos recientes, progreso, recomendaciones |
| BUY-002 | Mi perfil | Datos personales y preferencias |
| BUY-003 | Editar perfil | Actualización de datos |
| BUY-004 | Seguridad | Contraseña, 2FA, sesiones |
| BUY-005 | Mis cursos activos | Cursos en progreso |
| BUY-006 | Mis cursos completados | Historial académico |
| BUY-007 | Reproductor del curso | Lecciones, materiales y progreso |
| BUY-008 | Evaluaciones | Quizzes y pruebas |
| BUY-009 | Notas | Notas personales |
| BUY-010 | Certificados | Consultar y descargar |
| BUY-011 | Historial de compras | Órdenes realizadas |
| BUY-012 | Detalle de orden | Pago, cursos y comprobantes |
| BUY-013 | Facturación | Datos fiscales |
| BUY-014 | Métodos de pago | Métodos guardados |
| BUY-015 | Favoritos | Cursos y tiendas guardadas |
| BUY-016 | Reviews | Crear y editar reviews |
| BUY-017 | Notificaciones | Centro de alertas |
| BUY-018 | Mensajes | Conversaciones |
| BUY-019 | Tickets | Soporte |
| BUY-020 | Recomendaciones | Sugerencias personalizadas |

---

# 12. Dashboard de tienda o academia

## 12.1 Menú lateral

- Resumen.
- Mi tienda.
- FUR-T.
- FUR-GBP.
- Usuarios.
- Instructores.
- Cursos.
- FUR-P.
- Contenido.
- Categorías.
- Estudiantes.
- Ventas.
- Promociones.
- Publicidad.
- Reviews.
- Finanzas.
- Reportes.
- Notificaciones.
- Mensajes.
- Soporte.
- Configuración.
- SEO / JSON-LD.
- Seguridad.

## 12.2 Páginas

| Código | Página | Funciones |
|---|---|---|
| STO-001 | Dashboard | KPI de tienda |
| STO-002 | Perfil de tienda | Datos públicos |
| STO-003 | Branding | Logo, portada y galería |
| STO-004 | FUR-T | Registro maestro |
| STO-005 | FUR-GBP | Perfil empresarial |
| STO-006 | Verificación | Estado y observaciones |
| STO-007 | Usuarios | Staff |
| STO-008 | Roles y permisos | Permisos internos |
| STO-009 | Instructores | Gestión de instructores |
| STO-010 | Cursos | Listado |
| STO-011 | Crear curso | Alta de FUR-P |
| STO-012 | Editar curso | Modificación |
| STO-013 | Contenido | Módulos y lecciones |
| STO-014 | Evaluaciones | Quizzes y pruebas |
| STO-015 | Recursos | Archivos descargables |
| STO-016 | Publicación | Flujo editorial |
| STO-017 | Categorías | Clasificación |
| STO-018 | Estudiantes | Inscritos |
| STO-019 | Progreso | Seguimiento |
| STO-020 | Ventas | Pedidos |
| STO-021 | Detalle de venta | Orden y comprador |
| STO-022 | Cupones | Descuentos |
| STO-023 | Promociones | Campañas |
| STO-024 | Publicidad | Anuncios internos |
| STO-025 | Reviews | Opiniones recibidas |
| STO-026 | Responder review | Respuesta pública |
| STO-027 | Finanzas | Ingresos |
| STO-028 | Comisiones | Fees |
| STO-029 | Retiros | Liquidaciones |
| STO-030 | Reporte de ventas | Rendimiento |
| STO-031 | Reporte de cursos | Desempeño |
| STO-032 | Reporte de alumnos | Finalización |
| STO-033 | SEO / JSON-LD | Datos estructurados |
| STO-034 | Políticas | Reembolso y soporte |
| STO-035 | Seguridad | Accesos y actividad |

---

# 13. Dashboard del instructor

## 13.1 Menú lateral

- Resumen.
- Perfil profesional.
- Mis cursos.
- Contenido.
- Evaluaciones.
- Estudiantes.
- Preguntas.
- Mensajes.
- Calendario.
- Reviews.
- Certificados.
- Ingresos.
- Reportes.
- Notificaciones.
- Soporte.
- Configuración.

## 13.2 Páginas

| Código | Página | Funciones |
|---|---|---|
| INS-001 | Dashboard | Actividad y KPI |
| INS-002 | Perfil profesional | Biografía y credenciales |
| INS-003 | Mis cursos | Cursos asignados |
| INS-004 | Editor de curso | Contenido autorizado |
| INS-005 | Lecciones | Gestión de clases |
| INS-006 | Evaluaciones | Pruebas |
| INS-007 | Estudiantes | Participantes |
| INS-008 | Progreso | Seguimiento |
| INS-009 | Preguntas | Responder consultas |
| INS-010 | Mensajes | Comunicación |
| INS-011 | Calendario | Clases y eventos |
| INS-012 | Reviews | Reputación |
| INS-013 | Ingresos | Liquidaciones |
| INS-014 | Reportes | Rendimiento |
| INS-015 | Soporte | Tickets |

---

# 14. Dashboard del administrador

## 14.1 Menú lateral

- Resumen.
- Usuarios.
- Compradores.
- Tiendas.
- Instructores.
- FUR-U.
- FUR-T.
- FUR-P.
- FUR-GBP.
- Categorías.
- Cursos.
- Pedidos.
- Pagos.
- Comisiones.
- Suscripciones.
- Publicidad.
- Home.
- Reviews.
- Notificaciones.
- Soporte.
- Reportes.
- Auditoría.
- SEO / JSON-LD.
- Configuración.
- Seguridad.

## 14.2 Páginas

| Código | Página | Funciones |
|---|---|---|
| ADM-001 | Dashboard ejecutivo | KPI globales |
| ADM-002 | Usuarios | Gestión global |
| ADM-003 | Compradores | Segmento comprador |
| ADM-004 | Tiendas | Gestión de sellers |
| ADM-005 | Instructores | Gestión docente |
| ADM-006 | Administradores | Staff interno |
| ADM-007 | FUR-U | Validación de usuarios |
| ADM-008 | FUR-T | Validación de tiendas |
| ADM-009 | FUR-P | Validación de cursos |
| ADM-010 | FUR-GBP | Validación empresarial |
| ADM-011 | Categorías | Taxonomía |
| ADM-012 | Cursos | Catálogo global |
| ADM-013 | Moderación de cursos | Aprobar o rechazar |
| ADM-014 | Pedidos | Operación transaccional |
| ADM-015 | Pagos | Transacciones |
| ADM-016 | Reembolsos | Solicitudes |
| ADM-017 | Comisiones | Reglas y liquidaciones |
| ADM-018 | Suscripciones | Planes |
| ADM-019 | Publicidad | Campañas |
| ADM-020 | Banners | Posiciones |
| ADM-021 | Home Manager | Secciones del home |
| ADM-022 | Destacados | Cursos y tiendas |
| ADM-023 | Reviews | Moderación |
| ADM-024 | Notificaciones | Envíos |
| ADM-025 | Soporte | Tickets globales |
| ADM-026 | Reportes | Analítica |
| ADM-027 | Auditoría | Logs |
| ADM-028 | SEO / JSON-LD | Configuración semántica |
| ADM-029 | Configuración global | Parámetros |
| ADM-030 | Roles y permisos | RBAC |
| ADM-031 | Integraciones | Servicios externos |
| ADM-032 | Salud del sistema | Monitoreo |

---

# 15. Dashboards operativos

## 15.1 Soporte

- Dashboard de tickets.
- Bandeja de entrada.
- Detalle de ticket.
- Usuarios.
- Tiendas.
- Pedidos.
- Pagos.
- Reembolsos.
- Base de conocimiento.
- Plantillas.
- SLA.
- Reportes.

## 15.2 Marketing

- Dashboard de campañas.
- Banners.
- Espacios del home.
- Cupones.
- Promociones.
- Segmentación.
- Email marketing.
- Landing pages.
- Cursos patrocinados.
- Tiendas destacadas.
- A/B testing.
- Reportes.

## 15.3 Finanzas

- Resumen financiero.
- Cobros.
- Pagos a tiendas.
- Comisiones.
- Retiros.
- Reembolsos.
- Conciliación.
- Facturación.
- Impuestos.
- Reportes.

## 15.4 Compliance

- Casos pendientes.
- Validación FUR-U.
- Validación FUR-T.
- Validación FUR-P.
- Validación FUR-GBP.
- Moderación de cursos.
- Moderación de tiendas.
- Moderación de reviews.
- Documentos.
- Sanciones.
- Auditoría.
- Reportes.

## 15.5 Corporativo B2B

- Dashboard de empresa.
- Perfil corporativo.
- Equipos.
- Usuarios empleados.
- Catálogo corporativo.
- Solicitudes de cotización.
- Cotizaciones recibidas.
- Órdenes.
- Inscripciones masivas.
- Progreso de equipos.
- Certificados.
- Facturación.
- Reportes.

---

# 16. Módulos funcionales detallados

## 16.1 Identidad y autenticación

### Funciones

- Registro.
- Login.
- Recuperación de contraseña.
- Verificación de email.
- Login social opcional.
- 2FA opcional.
- Gestión de sesiones.
- Bloqueos.
- Consentimientos.
- Roles y permisos.

### Requisitos

- Contraseñas seguras.
- Tokens con expiración.
- Revocación de sesión.
- Registro de intentos fallidos.
- Protección contra fuerza bruta.
- Auditoría de acciones sensibles.

## 16.2 Usuarios

- Perfil.
- Preferencias.
- Avatar.
- Idioma.
- Zona horaria.
- Notificaciones.
- Estado.
- FUR-U.
- Roles.
- Historial.

## 16.3 Tiendas

- Alta.
- FUR-T.
- Branding.
- Verificación.
- Estado.
- Staff.
- Plan.
- Comisión.
- Políticas.
- SEO.
- FUR-GBP.
- Métricas.

## 16.4 Cursos

- Alta.
- FUR-P.
- Contenido.
- Precio.
- Modalidad.
- Instructor.
- Categorías.
- Certificación.
- Publicación.
- Moderación.
- SEO.
- Reviews.
- Métricas.

## 16.5 Contenido académico

- Módulos.
- Lecciones.
- Video.
- Audio.
- Texto.
- Archivos.
- Quizzes.
- Evaluaciones.
- Proyectos.
- Progreso.
- Finalización.

## 16.6 Búsqueda y filtros

- Texto libre.
- Categoría.
- Subcategoría.
- Precio.
- Rating.
- Nivel.
- Modalidad.
- Idioma.
- Duración.
- Certificado.
- Tienda.
- Instructor.
- Fecha.
- Promoción.

## 16.7 Carrito y checkout

- Agregar curso.
- Eliminar curso.
- Actualizar carrito.
- Aplicar cupón.
- Calcular impuestos.
- Calcular comisión.
- Seleccionar método de pago.
- Confirmar términos.
- Crear orden.
- Confirmar pago.
- Generar inscripción.

## 16.8 Órdenes

- Número de orden.
- Comprador.
- Líneas.
- Tiendas.
- Precio.
- Descuento.
- Impuestos.
- Comisión.
- Estado.
- Pago.
- Reembolso.
- Historial.

## 16.9 Pagos

- Intención de pago.
- Confirmación.
- Fallo.
- Reintento.
- Reembolso.
- Webhooks.
- Conciliación.
- Payouts futuros.
- Registro de transacciones.

## 16.10 Suscripciones

- Planes para compradores.
- Planes para tiendas.
- Periodicidad.
- Renovación.
- Cancelación.
- Beneficios.
- Límites.
- Prueba gratuita.
- Facturación.

## 16.11 Promociones

- Cupones.
- Descuentos porcentuales.
- Descuentos fijos.
- Fechas.
- Límites.
- Segmentos.
- Cursos aplicables.
- Tiendas aplicables.
- Uso mínimo.
- Historial.

## 16.12 Publicidad

- Banner.
- Posición.
- Periodo.
- Presupuesto.
- Impresiones.
- Clics.
- Conversiones.
- Moderación.
- Cursos patrocinados.
- Tiendas destacadas.

## 16.13 Reviews y reputación

- Rating.
- Comentario.
- Compra verificada.
- Respuesta de tienda.
- Denuncia.
- Moderación.
- Ocultamiento.
- Historial.
- Promedio.
- Conteo.

## 16.14 Certificados

- Plantilla.
- Datos del estudiante.
- Curso.
- Instructor.
- Fecha.
- Código verificable.
- Descarga.
- Revocación.
- URL pública de verificación.

## 16.15 Notificaciones

- In-app.
- Email.
- Push futura.
- Preferencias.
- Lectura.
- Prioridad.
- Plantillas.
- Eventos.
- Historial.

## 16.16 Mensajería

- Conversaciones.
- Participantes.
- Mensajes.
- Archivos.
- Estado leído.
- Bloqueo.
- Moderación.
- Contexto de curso u orden.

## 16.17 Soporte

- Ticket.
- Categoría.
- Prioridad.
- SLA.
- Estado.
- Agente.
- Historial.
- Adjuntos.
- Respuestas.
- Escalamiento.
- Satisfacción.

## 16.18 Reportes y KPI

- Ventas.
- Usuarios.
- Tiendas.
- Cursos.
- Conversión.
- Retención.
- Finalización.
- Certificados.
- Publicidad.
- Soporte.
- Finanzas.
- Compliance.

## 16.19 Auditoría

- Usuario.
- Acción.
- Entidad.
- ID de entidad.
- Valor anterior.
- Valor nuevo.
- Fecha.
- IP.
- Dispositivo.
- Resultado.

---

# 17. Casos de uso

## UC-001 Registro de comprador

**Actor:** Visitante  
**Precondición:** No posee cuenta.  
**Flujo principal:**

1. El visitante abre la página de registro.
2. Ingresa nombre, email y contraseña.
3. Acepta términos y privacidad.
4. El sistema valida datos.
5. El sistema crea FUR-U.
6. El sistema envía correo de verificación.
7. El usuario verifica su correo.
8. La cuenta queda activa.

**Resultado:** comprador registrado y autenticable.

## UC-002 Registro de tienda

**Actor:** Propietario de tienda  
**Flujo principal:**

1. El usuario selecciona “Crear tienda”.
2. Completa datos comerciales.
3. Crea FUR-T.
4. Completa FUR-GBP si aplica.
5. Adjunta documentos requeridos.
6. Envía a revisión.
7. Compliance revisa.
8. Aprueba, observa o rechaza.
9. La tienda recibe notificación.

**Resultado:** tienda verificada o pendiente de corrección.

## UC-003 Publicación de curso

**Actor:** Tienda o instructor autorizado  
**Flujo principal:**

1. Crea FUR-P.
2. Completa información comercial.
3. Carga contenido.
4. Asigna categorías.
5. Define precio.
6. Configura certificado.
7. Previsualiza.
8. Envía a revisión.
9. Moderador aprueba.
10. El curso se publica.

## UC-004 Búsqueda de curso

**Actor:** Visitante o comprador  
**Flujo principal:**

1. Ingresa una palabra clave.
2. El sistema devuelve resultados.
3. Aplica filtros.
4. Ordena resultados.
5. Abre ficha de curso.
6. Consulta precio, rating y tienda.

## UC-005 Compra individual

**Actor:** Comprador  
**Flujo principal:**

1. Agrega curso al carrito.
2. Abre checkout.
3. Aplica cupón.
4. Selecciona pago.
5. Confirma compra.
6. El sistema procesa pago.
7. Crea orden.
8. Crea inscripción.
9. Envía confirmación.
10. Habilita acceso.

## UC-006 Compra de cursos de múltiples tiendas

**Actor:** Comprador  
**Flujo principal:**

1. Agrega cursos de varias tiendas.
2. El carrito agrupa líneas por tienda.
3. El checkout muestra totales.
4. Se procesa un pago del comprador.
5. La plataforma registra comisiones por línea.
6. Se crean liquidaciones pendientes.
7. El comprador obtiene acceso a cada curso.

## UC-007 Solicitud de cotización B2B

**Actor:** Usuario corporativo  
**Flujo principal:**

1. Selecciona cursos.
2. Define número de participantes.
3. Indica necesidades.
4. Envía solicitud.
5. Tiendas elegibles responden.
6. El cliente compara propuestas.
7. Acepta una cotización.
8. Se crea orden corporativa.

## UC-008 Progreso del curso

**Actor:** Comprador  
**Flujo principal:**

1. Accede al curso.
2. Completa una lección.
3. El sistema registra avance.
4. Actualiza porcentaje.
5. Desbloquea siguiente contenido.
6. Notifica hitos.

## UC-009 Emisión de certificado

**Actor:** Sistema  
**Precondición:** Curso completado y reglas cumplidas.  
**Flujo principal:**

1. Valida progreso.
2. Valida evaluación.
3. Genera certificado.
4. Asigna código.
5. Publica URL verificable.
6. Notifica al estudiante.

## UC-010 Review de curso

**Actor:** Comprador  
**Precondición:** Compra verificada.  
**Flujo principal:**

1. Abre curso comprado.
2. Selecciona rating.
3. Escribe comentario.
4. Envía review.
5. El sistema valida contenido.
6. Publica o envía a moderación.
7. Actualiza rating agregado.

## UC-011 Respuesta de tienda a review

**Actor:** Tienda  
**Flujo principal:**

1. Recibe notificación.
2. Abre review.
3. Responde.
4. El sistema publica la respuesta.
5. El comprador recibe aviso.

## UC-012 Reembolso

**Actor:** Comprador / soporte / finanzas  
**Flujo principal:**

1. El comprador solicita reembolso.
2. El sistema valida política.
3. Soporte revisa.
4. Finanzas aprueba o rechaza.
5. Se procesa devolución.
6. Se revoca acceso si corresponde.
7. Se actualiza orden y comisión.

## UC-013 Campaña publicitaria

**Actor:** Tienda / marketing  
**Flujo principal:**

1. Crea campaña.
2. Selecciona posición.
3. Define fechas y presupuesto.
4. Carga creatividad.
5. Envía a revisión.
6. Marketing aprueba.
7. Se publica.
8. Se registran impresiones, clics y conversiones.

## UC-014 Moderación de curso

**Actor:** Compliance  
**Flujo principal:**

1. Consulta cola.
2. Revisa FUR-P.
3. Revisa contenido.
4. Registra observaciones.
5. Aprueba o rechaza.
6. Notifica a la tienda.
7. Conserva auditoría.

## UC-015 Gestión de ticket

**Actor:** Comprador / soporte  
**Flujo principal:**

1. El usuario crea ticket.
2. Selecciona categoría.
3. Adjunta evidencia.
4. El sistema asigna prioridad.
5. Soporte responde.
6. Se intercambian mensajes.
7. Se resuelve.
8. El usuario califica atención.

## UC-016 Suscripción de tienda

**Actor:** Propietario de tienda  
**Flujo principal:**

1. Compara planes.
2. Selecciona uno.
3. Confirma pago recurrente.
4. El sistema activa beneficios.
5. Controla límites.
6. Renueva o cancela según configuración.

## UC-017 Bloqueo de usuario

**Actor:** Administrador  
**Flujo principal:**

1. Abre perfil.
2. Selecciona bloquear.
3. Indica motivo.
4. Confirma.
5. El sistema revoca sesiones.
6. Registra auditoría.
7. Notifica según política.

## UC-018 Gestión del home

**Actor:** Administrador o marketing  
**Flujo principal:**

1. Abre Home Manager.
2. Ordena secciones.
3. Selecciona cursos y tiendas.
4. Configura banners.
5. Previsualiza.
6. Publica cambios.
7. El sistema registra versión.

---

# 18. Requisitos funcionales

## RF-001 Gestión de usuarios

El sistema debe permitir crear, consultar, actualizar, bloquear y desactivar usuarios.

## RF-002 Gestión de roles

El sistema debe permitir asignar roles y permisos configurables.

## RF-003 Fichas FUR

El sistema debe permitir crear, editar, validar, publicar y auditar FUR-GBP, FUR-U, FUR-P y FUR-T.

## RF-004 Catálogo

El sistema debe mostrar cursos, tiendas, instructores, categorías y promociones.

## RF-005 Búsqueda

El sistema debe permitir búsquedas por texto y filtros combinados.

## RF-006 Carrito

El sistema debe permitir agregar cursos de múltiples tiendas.

## RF-007 Checkout

El sistema debe calcular precios, descuentos, impuestos y totales.

## RF-008 Pagos

El sistema debe procesar pagos y recibir webhooks.

## RF-009 Órdenes

El sistema debe registrar órdenes y líneas por curso.

## RF-010 Inscripciones

El sistema debe habilitar acceso después de pago confirmado.

## RF-011 Progreso

El sistema debe registrar avance por curso y lección.

## RF-012 Certificados

El sistema debe emitir certificados verificables.

## RF-013 Reviews

El sistema debe admitir reviews verificadas y respuestas.

## RF-014 Publicidad

El sistema debe administrar campañas, posiciones y métricas.

## RF-015 Suscripciones

El sistema debe administrar planes, renovaciones y cancelaciones.

## RF-016 Mensajería

El sistema debe permitir conversaciones contextualizadas.

## RF-017 Notificaciones

El sistema debe generar avisos por eventos.

## RF-018 Soporte

El sistema debe gestionar tickets, SLA y escalamiento.

## RF-019 Reportes

El sistema debe generar reportes por rol.

## RF-020 JSON-LD

El sistema debe generar datos estructurados por entidad pública.

## RF-021 Auditoría

El sistema debe registrar acciones sensibles.

## RF-022 Responsive

Todas las pantallas deben adaptarse a móvil, tablet y escritorio.

## RF-023 Home Manager

El administrador debe poder configurar secciones del home.

## RF-024 B2B

El sistema debe permitir solicitudes de cotización corporativa.

---

# 19. Requisitos no funcionales

## 19.1 Rendimiento

- Tiempo objetivo de carga inicial inferior a 3 segundos en condiciones normales.
- Paginación en listados.
- Carga diferida de imágenes.
- Caché para catálogo.
- Consultas indexadas.
- CDN para archivos públicos.

## 19.2 Seguridad

- HTTPS.
- Hash seguro de contraseñas.
- JWT con expiración.
- Refresh tokens protegidos.
- Rate limiting.
- Validación de entrada.
- Protección CSRF cuando aplique.
- Sanitización de contenido.
- Control de archivos.
- Cifrado de secretos.
- Auditoría.
- Backups.
- Política de mínimos privilegios.

## 19.3 Disponibilidad

- Objetivo inicial de disponibilidad: 99,5 %.
- Monitoreo de servicios.
- Alertas.
- Recuperación ante fallos.
- Copias de seguridad.

## 19.4 Escalabilidad

- Arquitectura modular.
- Servicios desacoplados.
- Jobs asíncronos.
- Posibilidad de colas.
- Separación futura de dominios.
- Escalado horizontal del backend.

## 19.5 Usabilidad

- Navegación clara.
- Menús consistentes.
- Estados vacíos.
- Confirmaciones.
- Mensajes de error útiles.
- Accesibilidad visual.
- Responsive.
- Diseño mobile-first.

## 19.6 Accesibilidad

- Contraste adecuado.
- Navegación por teclado.
- Etiquetas ARIA.
- Texto alternativo.
- Formularios accesibles.
- Estructura semántica.

## 19.7 Compatibilidad

- Chrome.
- Edge.
- Firefox.
- Safari.
- Navegadores móviles modernos.

## 19.8 Mantenibilidad

- Código tipado.
- Convenciones.
- Documentación.
- Tests.
- CI/CD.
- Migraciones.
- Versionado de API.
- Logs estructurados.

---

# 20. Modelo de datos propuesto

## 20.1 Tablas maestras principales

- `marketplace_users`
- `marketplace_roles`
- `marketplace_permissions`
- `marketplace_user_roles`
- `marketplace_stores`
- `marketplace_store_users`
- `marketplace_instructors`
- `marketplace_courses`
- `marketplace_course_modules`
- `marketplace_course_lessons`
- `marketplace_categories`
- `marketplace_course_categories`
- `marketplace_tags`
- `marketplace_course_tags`
- `marketplace_fur_gbp`
- `marketplace_fur_u`
- `marketplace_fur_p`
- `marketplace_fur_t`

## 20.2 Tablas transaccionales

- `marketplace_carts`
- `marketplace_cart_items`
- `marketplace_orders`
- `marketplace_order_items`
- `marketplace_payments`
- `marketplace_refunds`
- `marketplace_commissions`
- `marketplace_payouts`
- `marketplace_enrollments`
- `marketplace_progress`
- `marketplace_certificates`

## 20.3 Tablas comerciales

- `marketplace_coupons`
- `marketplace_promotions`
- `marketplace_subscriptions`
- `marketplace_subscription_plans`
- `marketplace_ad_campaigns`
- `marketplace_ad_placements`
- `marketplace_ad_metrics`
- `marketplace_quotes`
- `marketplace_quote_items`

## 20.4 Tablas de interacción

- `marketplace_reviews`
- `marketplace_review_replies`
- `marketplace_favorites`
- `marketplace_notifications`
- `marketplace_messages`
- `marketplace_conversations`
- `marketplace_support_tickets`
- `marketplace_ticket_messages`

## 20.5 Tablas de gobierno

- `marketplace_audit_logs`
- `marketplace_status_history`
- `marketplace_moderation_cases`
- `marketplace_documents`
- `marketplace_settings`
- `marketplace_home_sections`
- `marketplace_seo_metadata`
- `marketplace_jsonld_snapshots`

---

# 21. API REST propuesta

## 21.1 Convención

`/api/v1/{resource}`

## 21.2 Recursos principales

- `/auth`
- `/users`
- `/roles`
- `/stores`
- `/instructors`
- `/courses`
- `/categories`
- `/search`
- `/carts`
- `/checkout`
- `/orders`
- `/payments`
- `/refunds`
- `/subscriptions`
- `/promotions`
- `/ads`
- `/reviews`
- `/certificates`
- `/notifications`
- `/messages`
- `/support`
- `/reports`
- `/fur/gbp`
- `/fur/users`
- `/fur/products`
- `/fur/stores`
- `/admin/home`
- `/admin/audit`
- `/seo/jsonld`

## 21.3 Operaciones estándar

- `POST` crear.
- `GET` listar.
- `GET /{id}` consultar.
- `PUT /{id}` reemplazar.
- `PATCH /{id}` modificar.
- `DELETE /{id}` eliminar lógicamente.
- `POST /{id}/publish` publicar.
- `POST /{id}/verify` verificar.
- `POST /{id}/approve` aprobar.
- `POST /{id}/reject` rechazar.
- `POST /{id}/archive` archivar.

## 21.4 Respuesta estándar

```json
{
  "success": true,
  "message": "Operación completada",
  "data": {},
  "meta": {}
}
```

## 21.5 Error estándar

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": []
  }
}
```

---

# 22. JSON-LD y SEO

## 22.1 Tipos semánticos

| Entidad | Tipo schema.org |
|---|---|
| Marketplace | Organization / WebSite |
| Tienda | EducationalOrganization / Organization |
| FUR-GBP | LocalBusiness / EducationalOrganization |
| Usuario instructor | Person |
| Curso | Course |
| Oferta | Offer |
| Producto | Product |
| Review | Review |
| Rating | AggregateRating |
| Breadcrumb | BreadcrumbList |
| FAQ | FAQPage |

## 22.2 Reglas

- Cada entidad pública tendrá URL canónica.
- Cada entidad tendrá `@id` estable.
- Los datos JSON-LD se generarán desde backend o una capa SEO controlada.
- No se publicarán propiedades vacías.
- Los ratings solo se expondrán cuando exista información real.
- Los precios y disponibilidad deberán coincidir con la página visible.
- Cada curso debe enlazar a su proveedor.
- Cada tienda debe enlazar a sus cursos.

---

# 23. Flujos de negocio principales

## 23.1 Flujo de compra

Buscar → comparar → ficha de curso → carrito → checkout → pago → orden → inscripción → acceso → certificado → review.

## 23.2 Flujo de tienda

Registro → FUR-T → FUR-GBP → verificación → configuración → creación de curso → FUR-P → moderación → publicación → venta → liquidación.

## 23.3 Flujo de instructor

Registro → perfil → asignación de tienda → creación de contenido → estudiantes → evaluaciones → progreso → reputación → ingresos.

## 23.4 Flujo de moderación

Cola pendiente → revisión → observaciones → corrección → aprobación o rechazo → publicación → auditoría.

## 23.5 Flujo de soporte

Ticket → clasificación → asignación → respuesta → escalamiento → resolución → cierre → encuesta.

## 23.6 Flujo B2B

Registro corporativo → selección de cursos → solicitud de cotización → propuestas → aceptación → orden → inscripción masiva → seguimiento → reporte.

---

# 24. Modelo de negocio

## 24.1 Fuentes de ingreso

- Comisión por venta.
- Suscripciones de tiendas.
- Planes premium de compradores.
- Publicidad interna.
- Cursos patrocinados.
- Tiendas destacadas.
- Capacitación corporativa B2B.
- Servicios de certificación.
- Servicios de marketing.
- Servicios de implementación futura.

## 24.2 Reglas de comisión

- Comisión configurable por tienda.
- Comisión configurable por plan.
- Comisión por categoría futura.
- Registro por línea de orden.
- Ajustes por reembolso.
- Historial de cambios.
- Transparencia para tienda.

## 24.3 Planes sugeridos para tienda

- Free.
- Basic.
- Pro.
- Enterprise.

## 24.4 Beneficios por plan

- Número de cursos.
- Número de usuarios staff.
- Comisión.
- Publicidad.
- Analítica.
- Personalización.
- Soporte.
- Integraciones.

---

# 25. KPI principales

## 25.1 Adquisición

- Visitantes.
- Registros.
- Tasa de registro.
- Fuente de tráfico.
- CAC cuando aplique.

## 25.2 Conversión

- Agregados al carrito.
- Inicio de checkout.
- Pagos completados.
- Tasa de conversión.
- Abandono de carrito.

## 25.3 Operación

- Usuarios activos.
- Tiendas activas.
- Cursos publicados.
- Cursos pendientes.
- Tiempo de moderación.
- Tickets abiertos.

## 25.4 Ingresos

- GMV.
- Ingresos netos.
- Comisiones.
- Suscripciones.
- Publicidad.
- Ticket promedio.
- Reembolsos.

## 25.5 Aprendizaje

- Inscripciones.
- Progreso promedio.
- Tasa de finalización.
- Evaluaciones completadas.
- Certificados emitidos.
- Tiempo de aprendizaje.

## 25.6 Reputación

- Rating promedio.
- Reviews.
- Tiendas verificadas.
- Cursos mejor valorados.
- Incidencias.
- Satisfacción de soporte.

---

# 26. Roadmap de implementación

## Fase 0 — Descubrimiento y diseño

### Alcance

- Validación de visión.
- Arquitectura.
- Diseño UX/UI.
- Modelo de datos.
- Diseño FUR.
- Prototipos.
- Backlog.
- Criterios de aceptación.

### Entregables

- PRD.
- Mapa de sitio.
- Wireframes.
- Arquitectura.
- Modelo de datos.
- Roadmap.

## Fase 1 — MVP

### Alcance

- Home.
- Registro y login.
- Roles básicos.
- Catálogo de cursos.
- Catálogo de tiendas.
- Ficha de curso.
- Ficha de tienda.
- Carrito.
- Checkout.
- Pago.
- Orden.
- Inscripción.
- Dashboard comprador.
- Dashboard tienda básico.
- Admin básico.
- FUR-U, FUR-T y FUR-P.
- JSON-LD básico.

### Criterio de salida

Un comprador puede registrarse, encontrar un curso, pagarlo y acceder; una tienda puede registrarse, publicar un curso aprobado y recibir una venta.

## Fase 2 — Gestión avanzada de tiendas

### Alcance

- FUR-GBP.
- Usuarios staff.
- Instructores.
- Contenido académico.
- Evaluaciones.
- Progreso.
- Certificados.
- Reviews.
- Promociones.
- Reportes básicos.

## Fase 3 — Monetización ampliada

### Alcance

- Suscripciones.
- Comisiones avanzadas.
- Retiros.
- Reembolsos.
- Publicidad.
- Cursos patrocinados.
- Planes premium.
- Cotizaciones B2B.

## Fase 4 — Operación y analítica

### Alcance

- Dashboards avanzados.
- KPI.
- Reportes.
- Soporte.
- Compliance.
- Auditoría.
- Home Manager.
- Segmentación.
- Notificaciones avanzadas.

## Fase 5 — Optimización y escalabilidad

### Alcance

- Rendimiento.
- Caché.
- CDN.
- Multidioma.
- Multimoneda.
- Multi-país.
- Aplicación móvil futura.
- IA para recomendaciones.
- Integraciones externas.
- Alta disponibilidad.

---

# 27. Priorización MoSCoW

## Must Have

- Usuarios.
- Roles.
- Tiendas.
- Cursos.
- FUR principales.
- Catálogo.
- Búsqueda.
- Carrito.
- Checkout.
- Pago.
- Órdenes.
- Inscripción.
- Dashboards básicos.
- Admin.
- Seguridad.
- Auditoría.
- JSON-LD básico.

## Should Have

- Reviews.
- Certificados.
- Promociones.
- Notificaciones.
- Soporte.
- Reportes.
- FUR-GBP.
- Instructores.
- Progreso.

## Could Have

- Publicidad.
- Suscripciones.
- Cotizaciones B2B.
- Mensajería.
- Payouts.
- Planes premium.
- Multi-idioma.

## Won't Have en MVP

- Aplicaciones nativas.
- IA avanzada.
- Streaming propio.
- Integración ERP completa.
- Contabilidad completa.
- Analítica predictiva.

---

# 28. Criterios de aceptación generales

1. Los permisos deben impedir accesos no autorizados.
2. Los formularios deben validar datos en frontend y backend.
3. Las acciones críticas deben registrarse en auditoría.
4. Las páginas públicas deben ser responsive.
5. El catálogo debe permitir filtros combinados.
6. El carrito debe admitir cursos de múltiples tiendas.
7. Una orden solo debe confirmarse después de pago válido.
8. La inscripción debe crearse una sola vez por línea comprada.
9. Los certificados deben ser verificables.
10. Las reviews deben requerir compra verificada.
11. Las fichas FUR deben conservar estados e historial.
12. JSON-LD debe coincidir con la información visible.
13. Las imágenes deben optimizarse.
14. Los errores deben presentarse de manera comprensible.
15. Las operaciones administrativas deben estar auditadas.

---

# 29. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Complejidad de pagos multi-tienda | Alto | Diseñar ledger y comisión por línea |
| Contenido de baja calidad | Alto | Moderación y criterios de publicación |
| Fraude en reviews | Medio | Compra verificada y moderación |
| Escalabilidad de video | Alto | Almacenamiento y CDN externos |
| Datos FUR incompletos | Medio | Validaciones y flujo de aprobación |
| Conflicto entre roles | Medio | RBAC y pruebas de permisos |
| Reembolsos complejos | Alto | Estados y reglas claras |
| SEO inconsistente | Medio | Generación centralizada de JSON-LD |
| Dependencia de proveedores | Medio | Interfaces desacopladas |
| Abandono de carrito | Medio | UX, recordatorios y pagos simples |
| Crecimiento desordenado | Alto | Arquitectura modular y roadmap |
| Exposición de datos | Alto | Cifrado, mínimos privilegios y auditoría |

---

# 30. Supuestos

- El marketplace operará inicialmente con un único operador legal.
- Las tiendas serán entidades comerciales dentro de la plataforma.
- Los cursos podrán ser gratuitos o pagados.
- El acceso al curso se activará después de confirmarse el pago.
- La base de datos principal será MySQL.
- Odoo será una referencia conceptual, no una dependencia del MVP.
- Los videos y archivos se almacenarán en un servicio externo.
- La pasarela de pago deberá soportar webhooks.
- Las liquidaciones a tiendas podrán ser manuales en la primera versión.
- La plataforma podrá evolucionar a payouts automáticos.

---

# 31. Dependencias

- Proveedor de pagos.
- Proveedor de correo.
- Almacenamiento de archivos.
- CDN.
- Servicio de mapas opcional.
- Dominio y certificados SSL.
- Infraestructura de despliegue.
- Herramientas de monitoreo.
- Políticas legales.
- Diseño visual.
- Catálogo inicial de tiendas y cursos.

---

# 32. Estructura de carpetas recomendada

```text
marketplace-cursos/
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── stores/
│       │   ├── courses/
│       │   ├── categories/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── orders/
│       │   ├── payments/
│       │   ├── subscriptions/
│       │   ├── reviews/
│       │   ├── notifications/
│       │   ├── support/
│       │   ├── fur/
│       │   └── admin/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── schemas/
│       ├── types/
│       ├── utils/
│       └── main.tsx
├── backend/
│   └── src/
│       ├── common/
│       ├── config/
│       ├── database/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── roles/
│       │   ├── stores/
│       │   ├── instructors/
│       │   ├── courses/
│       │   ├── categories/
│       │   ├── search/
│       │   ├── carts/
│       │   ├── checkout/
│       │   ├── orders/
│       │   ├── payments/
│       │   ├── refunds/
│       │   ├── subscriptions/
│       │   ├── promotions/
│       │   ├── ads/
│       │   ├── reviews/
│       │   ├── certificates/
│       │   ├── notifications/
│       │   ├── messages/
│       │   ├── support/
│       │   ├── reports/
│       │   ├── fur/
│       │   ├── seo/
│       │   ├── audit/
│       │   └── admin/
│       ├── shared/
│       ├── jobs/
│       └── main.ts
├── docs/
│   ├── prd/
│   ├── api/
│   ├── database/
│   ├── ux/
│   └── fur/
└── infrastructure/
    ├── docker/
    ├── nginx/
    ├── ci/
    └── deployment/
```

---

# 33. Estrategia de pruebas

## 33.1 Pruebas unitarias

- Servicios.
- Validadores.
- Cálculo de comisión.
- Cálculo de descuentos.
- Estados de órdenes.
- Reglas FUR.

## 33.2 Pruebas de integración

- Registro y login.
- Creación de tienda.
- Publicación de curso.
- Pago.
- Orden.
- Inscripción.
- Reembolso.
- Webhooks.

## 33.3 Pruebas end-to-end

- Compra completa.
- Alta de tienda.
- Alta de curso.
- Moderación.
- Certificación.
- Review.
- Ticket.

## 33.4 Pruebas de seguridad

- Autorización.
- Inyección.
- XSS.
- Rate limiting.
- Archivos.
- Sesiones.
- Escalamiento de privilegios.

## 33.5 Pruebas de usabilidad

- Navegación.
- Responsive.
- Formularios.
- Estados vacíos.
- Errores.
- Accesibilidad.

---

# 34. Observabilidad y operación

- Logs estructurados.
- Métricas de API.
- Monitoreo de errores.
- Trazabilidad de pagos.
- Alertas de webhooks.
- Dashboards de infraestructura.
- Historial de despliegues.
- Monitoreo de jobs.
- Control de backups.
- Health checks.

---

# 35. Criterio de finalización del producto

El producto se considerará listo para una primera salida a producción cuando:

1. El flujo de registro funcione.
2. Las tiendas puedan registrarse y ser aprobadas.
3. Los cursos puedan crearse, revisarse y publicarse.
4. El comprador pueda buscar, pagar y acceder.
5. Las órdenes y pagos sean trazables.
6. Los permisos hayan sido probados.
7. Existan logs y auditoría.
8. El sistema tenga backups.
9. Las páginas críticas sean responsive.
10. La documentación API esté disponible.
11. El JSON-LD básico esté validado.
12. Los casos críticos tengan pruebas end-to-end.
13. El administrador pueda operar el marketplace.
14. El soporte pueda gestionar incidencias.
15. Se haya realizado una prueba piloto con usuarios reales.

---

# 36. Anexos recomendados

- Matriz de roles y permisos.
- Diccionario de datos.
- Esquemas JSON de FUR.
- Especificación OpenAPI.
- Modelo entidad-relación.
- Mapa de sitio.
- Wireframes.
- Sistema de diseño.
- Matriz de casos de prueba.
- Plan de despliegue.
- Plan de soporte.
- Plan de seguridad.
- Roadmap detallado.
- Inventario documental.

---

# 37. Conclusión

Este PRD define el alcance funcional, operativo y técnico del Marketplace de Cursos y Capacitación Profesional. El producto se concibe como una plataforma multi-tienda, modular y escalable, con catálogo público, experiencia de compra, gestión académica, dashboards por rol, monetización múltiple, gobierno de datos mediante fichas FUR y SEO semántico mediante JSON-LD.

El desarrollo deberá ejecutarse por etapas, priorizando primero el flujo de valor esencial: registrar tiendas, publicar cursos, permitir compras, habilitar acceso y administrar la operación. Las capacidades avanzadas de suscripciones, publicidad, B2B, payouts, analítica e integraciones deberán incorporarse después de validar el MVP.

