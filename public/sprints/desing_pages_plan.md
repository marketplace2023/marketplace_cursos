# DESIGN.md — Google Stitch UX/UI Design Brief
## Proyecto: Marketplace de Cursos y Capacitación Profesional

**Versión:** 1.0  
**Tipo de documento:** Guía maestra de UX/UI para Google Stitch  
**Objetivo:** servir como instrucción detallada para que Google Stitch diseñe de forma coherente, consistente y completa todas las vistas públicas y privadas del proyecto **Marketplace de Cursos**.  
**Stack del proyecto:** React.js + NestJS + MySQL + JSON-LD  
**Modelo de datos:** FUR-GBP, FUR-U, FUR-P, FUR-T  
**Mercado inicial:** USA  
**Idiomas iniciales:** Español e inglés  
**Diseño visual de referencia:** look & feel académico-profesional, marketplace SaaS, navegación clara, alto enfoque en conversión, reputación, confianza y gestión multi-tienda.

---

# 1. Instrucción principal para Google Stitch

Diseñar un sistema completo de UX/UI para un **marketplace multi-tienda de cursos y capacitación profesional**.

El resultado debe ser:

- moderno
- profesional
- limpio
- altamente navegable
- consistente entre pantallas públicas y privadas
- optimizado para desktop, tablet y mobile
- preparado para venta de cursos, operación multi-rol, administración de tiendas, reputación, pagos, certificación y gestión del dato con fichas FUR

La experiencia debe sentirse como una mezcla entre:

- marketplace educativo tipo catálogo
- panel SaaS B2B/B2C
- plataforma de capacitación profesional
- sistema de gestión con dashboards por rol

El diseño debe priorizar:

1. confianza
2. claridad de navegación
3. facilidad para descubrir cursos
4. facilidad para comparar opciones
5. conversión a compra
6. eficiencia operativa en dashboards
7. consistencia visual entre módulos
8. jerarquía visual fuerte
9. legibilidad alta
10. experiencia premium pero sobria

---

# 2. Prompt maestro recomendado para Stitch

Usar este documento como guía de sistema y producir pantallas de alta fidelidad para un marketplace multi-tienda de cursos.  
La experiencia debe diferenciar claramente:

- vistas públicas del website
- dashboards privados por rol
- componentes compartidos
- patrones de interacción
- estados vacíos, errores, éxito y carga
- responsive design
- accesibilidad y consistencia

Si existe conflicto entre creatividad y claridad funcional, priorizar claridad funcional.  
Si existe conflicto entre estética y conversión, priorizar conversión.  
Si existe conflicto entre complejidad visual y escalabilidad del sistema, priorizar escalabilidad.

---

# 3. Visión de marca y tono visual

## 3.1 Personalidad visual

La marca debe transmitir:

- formación profesional
- credibilidad
- tecnología
- organización
- crecimiento
- confianza
- escalabilidad
- orientación a resultados

## 3.2 Sensación emocional deseada

### Para visitantes
- “Aquí puedo encontrar capacitación confiable”.
- “Puedo comparar fácilmente”.
- “Parece una plataforma seria”.
- “Es fácil comprar y aprender”.

### Para tiendas / academias
- “Puedo vender y operar mi negocio desde aquí”.
- “La plataforma me ayuda a crecer”.
- “Puedo medir resultados”.
- “Se siente profesional y estructurada”.

### Para administradores y operadores
- “Todo está organizado”.
- “Puedo supervisar con rapidez”.
- “Los paneles son claros”.
- “La operación parece escalable”.

## 3.3 Estilo general

- diseño claro sobre fondo blanco o neutro suave
- tarjetas con bordes suaves
- uso fuerte de azul corporativo como color primario
- verde como color de acción positiva
- acentos secundarios para módulos especiales
- iconografía lineal o duotono limpia
- microinteracciones sutiles
- dashboards con panel lateral izquierdo
- website con navegación superior clara y buscador prominente

---

# 4. Paleta cromática referencial

Tomar como base visual las referencias gráficas compartidas en el proyecto.  
Usar una paleta corporativa académica-tecnológica con predominio de azul, verde y neutros claros.

## 4.1 Colores principales

### Azul primario profundo
- **Hex:** `#0B2E59`
- Uso:
  - títulos principales
  - navegación superior
  - footer
  - botones primarios oscuros
  - iconografía principal
  - headings de dashboards

### Azul secundario
- **Hex:** `#1E5AA8`
- Uso:
  - tabs activas
  - iconos secundarios
  - enlaces destacados
  - acentos visuales
  - etiquetas de navegación

### Azul claro funcional
- **Hex:** `#4F8FD9`
- Uso:
  - fondos informativos
  - chips
  - estados hover suaves
  - iconografía auxiliar
  - tarjetas destacadas

### Verde de acción
- **Hex:** `#1FA55B`
- Uso:
  - CTA de éxito
  - estados aprobados
  - badges de verificado
  - métricas positivas
  - botones secundarios de alta conversión

### Verde oscuro
- **Hex:** `#168A4A`
- Uso:
  - confirmaciones
  - progreso completado
  - acciones operativas de tienda
  - módulos de negocio

## 4.2 Colores de apoyo

### Morado/acento premium
- **Hex:** `#6E49C7`
- Uso:
  - suscripciones
  - planes premium
  - certificados
  - badges especiales
  - componentes educativos distintivos

### Naranja/acento comercial
- **Hex:** `#F39C12`
- Uso:
  - promociones
  - descuentos
  - alerts comerciales
  - ratings o badges de oportunidad

### Rojo controlado
- **Hex:** `#D64545`
- Uso:
  - errores
  - acciones destructivas
  - rechazo
  - alertas críticas
  - fallos de pago

## 4.3 Neutros

### Neutro 900
- **Hex:** `#1E293B`
- Uso: texto fuerte

### Neutro 700
- **Hex:** `#475569`
- Uso: texto secundario

### Neutro 500
- **Hex:** `#94A3B8`
- Uso: ayudas, placeholders, bordes suaves

### Neutro 300
- **Hex:** `#CBD5E1`
- Uso: líneas, divisores, tablas

### Neutro 100
- **Hex:** `#F1F5F9`
- Uso: fondos suaves

### Blanco
- **Hex:** `#FFFFFF`
- Uso: superficie principal

## 4.4 Reglas de uso cromático

- El azul primario debe dominar el sistema.
- El verde debe reservarse para acciones positivas o de valor.
- El morado debe representar beneficios premium, certificados o diferenciadores.
- El naranja debe utilizarse con moderación en promociones o señales comerciales.
- Los fondos de tarjetas deben mantenerse claros.
- El contraste debe cumplir accesibilidad AA.
- Evitar saturación excesiva o combinación de demasiados acentos en una misma pantalla.

---

# 5. Tipografía referencial

No se recibió una fuente técnica explícita editable; por lo tanto, usar una combinación coherente con la referencia visual del proyecto.

## 5.1 Tipografía principal recomendada

### Headings y navegación
- **Principal:** Montserrat
- **Fallback:** Poppins, Inter, Arial, sans-serif

### Texto de interfaz y cuerpo
- **Principal:** Inter
- **Fallback:** Source Sans 3, Open Sans, Arial, sans-serif

### Números KPI / métricas
- **Principal:** Inter SemiBold
- **Fallback:** Roboto, Arial, sans-serif

## 5.2 Jerarquía tipográfica

### H1
- 44–56 px desktop
- 36–40 px tablet
- 28–32 px mobile
- peso 700/800
- tracking ajustado
- uso: hero y títulos máximos

### H2
- 32–40 px desktop
- 28–32 px tablet
- 24–28 px mobile
- peso 700
- uso: títulos de secciones

### H3
- 24–28 px desktop
- 22–24 px tablet
- 20–22 px mobile
- peso 600/700
- uso: títulos de bloques y cards principales

### H4
- 18–22 px
- peso 600
- uso: subtítulos, títulos de widgets

### Body L
- 16–18 px
- peso 400/500
- uso: descripciones importantes

### Body
- 14–16 px
- peso 400
- uso: contenido normal

### Small
- 12–13 px
- peso 400/500
- uso: ayudas, labels, metadata

### Button text
- 14–16 px
- peso 600
- uso: botones y CTA

## 5.3 Reglas tipográficas

- alta legibilidad
- espaciado generoso
- evitar bloques de texto muy largos
- headings consistentes entre website y dashboards
- no usar más de dos familias tipográficas
- usar escalas claras y repetibles
- evitar mayúsculas sostenidas excesivas salvo para micro labels

---

# 6. Reglas de layout y sistema visual

## 6.1 Grid

### Website público
- Desktop: grid de 12 columnas
- Tablet: 8 columnas
- Mobile: 4 columnas

### Dashboards privados
- Desktop: sidebar fija + área principal con grid de 12 columnas
- Tablet: sidebar colapsable
- Mobile: navegación inferior o drawer

## 6.2 Espaciado

Usar un sistema 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 px.

- padding card estándar: 24 px
- gap entre cards: 16–24 px
- margen sección desktop: 64 px vertical
- margen sección mobile: 32 px vertical

## 6.3 Bordes y radios

- radio pequeño: 8 px
- radio estándar: 12 px
- radio premium/cards destacadas: 16 px
- botones principales: 12 px
- inputs: 10–12 px

## 6.4 Sombras

- usar sombras suaves y modernas
- evitar sombras pesadas
- cards principales con sombra sutil
- modales con sombra media
- hover con elevación ligera

## 6.5 Iconografía

- estilo lineal o duotono suave
- grosor consistente
- iconos redondeados y amigables
- alto contraste con fondos
- uso repetible en navegación, métricas y estados

## 6.6 Ilustración y fotografía

- combinar UI mockups, iconografía y fotografía real solo cuando aporte confianza
- fotos de cursos e instructores con estética profesional
- evitar stock genérico poco creíble
- priorizar thumbs de cursos legibles
- usar ilustraciones limpias en onboarding, estados vacíos o ayudas

---

# 7. Principios UX del proyecto

1. **Descubrimiento rápido**
   - el usuario debe poder encontrar un curso o tienda en pocos pasos

2. **Comparación clara**
   - precios, modalidad, duración, rating y certificación deben verse rápido

3. **Conversión simple**
   - carrito y checkout con el menor número de fricciones posibles

4. **Confianza**
   - reviews verificadas, tiendas verificadas, certificados y badges visibles

5. **Escalabilidad**
   - el sistema visual debe soportar muchos módulos sin perder orden

6. **Coherencia entre roles**
   - todos los dashboards deben compartir patrones visuales comunes

7. **Prioridad a la información**
   - jerarquía clara, tablas limpias, cards legibles y componentes reutilizables

8. **Operabilidad**
   - los paneles privados deben privilegiar velocidad de gestión y lectura de KPI

9. **Accesibilidad**
   - color, tamaño, contraste, teclado y estados perceptibles

10. **Responsive-first**
    - ninguna pantalla debe romperse entre mobile, tablet y desktop

---

# 8. Componentes globales compartidos

## 8.1 Navegación pública

- logo
- menú superior
- categorías
- buscador global
- notificaciones
- favoritos
- carrito
- login / registro
- menú de cuenta

## 8.2 Navegación privada

- sidebar izquierda
- topbar con breadcrumbs
- buscador interno
- selector de tienda/rol cuando aplique
- alertas/notificaciones
- perfil de usuario
- shortcuts

## 8.3 Componentes base

- botón primario
- botón secundario
- botón ghost
- botón destructivo
- input text
- input search
- select
- date picker
- file uploader
- tabs
- accordion
- modal
- drawer
- tooltip
- toast
- badge
- chip
- breadcrumb
- table
- stat card
- progress bar
- chart card
- KPI tile
- empty state
- skeleton loader
- pagination
- filtros laterales
- cards de curso
- cards de tienda
- cards de instructor
- cards de orden
- cards de review
- cards de certificado

## 8.4 Estados globales

- loading
- empty
- success
- warning
- error
- no results
- pending approval
- draft
- archived
- blocked
- verified

---

# 9. Estructura de vistas públicas del website

---

# 9.1 Home público

**Objetivo:** presentar la propuesta de valor, facilitar descubrimiento y maximizar conversión.

## Secciones
1. Header principal
2. Hero con buscador
3. Categorías destacadas
4. Cursos destacados
5. Tiendas destacadas
6. Cursos mejor valorados
7. Cursos nuevos
8. Promociones y ofertas
9. Suscripciones o planes
10. Instructores destacados
11. Certificados / beneficios
12. Testimonios
13. CTA para compradores
14. CTA para vender cursos
15. Footer con enlaces importantes

## Componentes clave
- buscador dominante
- tabs por categoría
- carruseles o grids de cards
- banners promocionales
- badges de verificado
- reviews visibles
- CTA claros

## Variantes responsive
- Desktop: múltiples grids y bloques horizontales
- Tablet: reducción de columnas
- Mobile: secciones apiladas, buscador prominente, chips de categoría scrollables

---

# 9.2 Página de categorías

**Objetivo:** explorar la taxonomía del marketplace.

## Elementos
- header
- título de categoría
- subcategorías
- filtros rápidos
- cursos por categoría
- tiendas relacionadas
- FAQ / ayuda contextual
- breadcrumbs

## UX
- permitir cambiar de categoría sin perder contexto
- mostrar conteo de cursos por categoría
- permitir vista grid y lista

---

# 9.3 Resultados de búsqueda

**Objetivo:** devolver resultados relevantes para cursos, tiendas e instructores.

## Elementos
- barra de búsqueda persistente
- filtros laterales
- sort
- tabs de tipo de resultado
- resultados principales
- sugerencias
- historial reciente
- estados vacíos

## Filtros sugeridos
- precio
- rating
- nivel
- modalidad
- duración
- idioma
- certificado
- tienda
- instructor
- promociones
- fecha de publicación

---

# 9.4 Catálogo de cursos

**Objetivo:** navegar el inventario completo de cursos.

## Elementos
- título
- contador de resultados
- filtros
- sort
- cards de curso
- paginación o infinite scroll controlado

## Card de curso debe mostrar
- portada
- título
- tienda/academia
- instructor
- rating
- número de reviews
- precio
- descuento
- modalidad
- duración
- badge de certificado
- badge de bestseller o nuevo si aplica

---

# 9.5 Ficha pública de curso

**Objetivo:** convertir interés en compra.

## Bloques
1. Hero del curso
2. Título y subtítulo
3. Precio y CTA
4. Rating y reviews
5. Datos rápidos
6. Qué aprenderás
7. Requisitos
8. Público objetivo
9. Temario / módulos
10. Instructor
11. Tienda / academia
12. Certificación
13. Recursos incluidos
14. Reviews
15. Cursos relacionados
16. FAQ
17. CTA sticky en mobile

## Acciones
- comprar
- agregar a carrito
- guardar en favoritos
- compartir
- solicitar cotización
- comparar

## UX crítica
- CTA visible above the fold
- información esencial sin scroll excesivo
- reviews legibles
- módulos expandibles
- confianza y credibilidad altas

---

# 9.6 Catálogo de tiendas / academias

**Objetivo:** permitir descubrir vendedores formativos.

## Card de tienda
- logo
- nombre
- categoría principal
- rating
- total de cursos
- total de estudiantes
- badge verificada
- CTA ver tienda

## Filtros
- categoría
- verificación
- rating
- modalidad
- idioma
- ubicación

---

# 9.7 Ficha pública de tienda

**Objetivo:** exponer la identidad comercial y la oferta de la academia.

## Bloques
- hero con branding
- nombre y descripción
- badges
- métricas
- tabs: cursos / about / reviews / contacto
- cursos destacados
- instructores
- políticas
- certificados ofrecidos
- reviews de tienda
- CTA seguir tienda / ver cursos / solicitar cotización

---

# 9.8 Catálogo de instructores

**Objetivo:** descubrir docentes o autores.

## Card de instructor
- foto
- nombre
- especialidad
- rating
- cursos publicados
- tienda asociada
- CTA ver perfil

---

# 9.9 Perfil público de instructor

## Bloques
- hero del instructor
- biografía
- credenciales
- cursos publicados
- reviews
- métricas
- CTA ver cursos

---

# 9.10 Página de promociones

- banners
- campañas activas
- cursos con descuento
- bundles
- suscripciones destacadas
- countdowns moderados
- CTA a compra inmediata

---

# 9.11 Página de planes / suscripciones

## Objetivo
explicar modelos de membresía para usuarios o tiendas

## Bloques
- comparación de planes
- pricing cards
- beneficios
- preguntas frecuentes
- CTA contratar

---

# 9.12 Carrito

## Elementos
- lista de cursos
- agrupación por tienda cuando aplique
- precio unitario
- subtotal
- descuento
- cupón
- total
- CTA checkout
- recomendaciones

## UX
- modificar sin fricción
- evitar sorpresa de costos
- mostrar política de reembolso resumida

---

# 9.13 Checkout

## Pasos
1. identificación o login
2. datos de facturación
3. resumen del pedido
4. método de pago
5. confirmación

## Reglas
- máximo enfoque
- mínimo ruido
- barra de progreso
- validaciones inline
- confianza visual
- resumen sticky en desktop

---

# 9.14 Confirmación de compra

## Elementos
- éxito de pago
- resumen de orden
- cursos habilitados
- CTA ir a mis cursos
- factura
- soporte
- sugerencias complementarias

---

# 9.15 Login

- formulario simple
- social login opcional
- recuperar contraseña
- CTA a registro
- beneficios de tener cuenta

---

# 9.16 Registro

## Variantes
- comprador
- tienda / academia
- instructor
- corporativo B2B

## UX
- pasos claros
- campos mínimos iniciales
- progresivo
- validación en tiempo real

---

# 9.17 Recuperar contraseña

- email
- confirmación de envío
- estado de expiración
- retorno fácil a login

---

# 9.18 Solicitud de cotización B2B

## Bloques
- empresa
- número de participantes
- cursos de interés
- necesidades
- presupuesto
- plazo
- CTA enviar

---

# 9.19 Ayuda y soporte público

- centro de ayuda
- FAQ
- contacto
- tickets para usuarios registrados
- recursos guiados

---

# 9.20 Páginas legales

- términos
- privacidad
- cookies
- reembolsos
- políticas de tienda
- condiciones corporativas

---

# 9.21 Blog / recursos

- artículos
- guías
- casos de éxito
- categorías editoriales
- CTA a cursos y tiendas

---

# 10. Dashboards privados por rol

Todas las vistas privadas deben usar patrón común:

- sidebar izquierda
- topbar superior
- breadcrumbs
- layout de contenido modular
- cards KPI
- tablas limpias
- filtros
- acciones primarias arriba a la derecha
- estados vacíos y ayudas contextuales

---

# 10.1 Dashboard comprador final

## Objetivo UX
Ayudar al usuario a comprar, aprender, monitorear progreso y gestionar su cuenta.

## Menú lateral
- Resumen
- Mi perfil
- Mis cursos
- Mis compras
- Certificados
- Favoritos
- Reviews
- Notificaciones
- Mensajes
- Facturación
- Soporte
- Configuración
- Seguridad

## Pantallas privadas del comprador

### BUY-001 Resumen
- cursos en progreso
- progreso agregado
- compras recientes
- certificados
- recomendaciones
- alertas

### BUY-002 Mi perfil
- foto
- datos
- idioma
- zona horaria
- intereses

### BUY-003 Seguridad
- contraseña
- 2FA
- sesiones activas
- dispositivos

### BUY-004 Mis cursos
- tabs: activos / completados / guardados
- filtros
- progreso por tarjeta

### BUY-005 Reproductor del curso
- video o contenido
- navegación del temario
- progreso
- notas
- recursos
- CTA siguiente lección

### BUY-006 Evaluaciones
- quizzes
- puntaje
- intentos
- feedback

### BUY-007 Certificados
- tarjetas descargables
- estado
- verificación

### BUY-008 Compras
- órdenes
- detalle de orden
- facturas
- reembolsos

### BUY-009 Favoritos
- cursos guardados
- tiendas seguidas
- CTA a carrito

### BUY-010 Reviews
- pendientes de reseñar
- reseñas publicadas
- editar review

### BUY-011 Notificaciones
- filtros
- leídas/no leídas
- agrupación por evento

### BUY-012 Mensajes
- lista de conversaciones
- detalle
- adjuntos

### BUY-013 Soporte
- tickets
- estado
- prioridad
- historial

### BUY-014 Configuración
- preferencias
- privacidad
- notificaciones

---

# 10.2 Dashboard tienda / academia

## Objetivo UX
Permitir gestionar la operación comercial y académica de una tienda.

## Menú lateral
- Dashboard
- Mi tienda
- FUR-T
- FUR-GBP
- Usuarios
- Instructores
- Cursos
- FUR-P
- Contenido
- Estudiantes
- Ventas
- Promociones
- Publicidad
- Reviews
- Finanzas
- Reportes
- Notificaciones
- Mensajes
- Soporte
- SEO / JSON-LD
- Configuración
- Seguridad

## Pantallas privadas de tienda

### STO-001 Dashboard general
- ventas
- cursos activos
- estudiantes
- reviews
- alertas
- tareas pendientes

### STO-002 Mi tienda
- branding
- descripción
- contacto
- banner
- logo

### STO-003 FUR-T
- ficha maestra
- validación
- estado
- observaciones

### STO-004 FUR-GBP
- perfil empresarial
- dirección
- horarios
- links
- verificación

### STO-005 Usuarios de tienda
- staff
- roles
- permisos
- invitaciones

### STO-006 Instructores
- listado
- asignación
- desempeño
- estado

### STO-007 Cursos
- listado
- filtros
- draft / publicado / observado / archivado
- acciones rápidas

### STO-008 Crear curso
- wizard o formulario por pasos
- portada
- datos comerciales
- contenido
- precio
- certificado
- SEO
- preview

### STO-009 Editar curso
- mismo patrón que crear
- historial de cambios
- comentarios de moderación

### STO-010 Contenido académico
- módulos
- lecciones
- recursos
- evaluaciones
- ordenamiento drag and drop

### STO-011 Estudiantes
- por curso
- progreso
- finalización
- métricas

### STO-012 Ventas
- pedidos
- ingresos
- detalle de orden
- filtrado por fecha y curso

### STO-013 Promociones
- cupones
- descuentos
- campañas
- condiciones

### STO-014 Publicidad
- banners
- campañas internas
- métricas

### STO-015 Reviews
- reviews de curso
- reviews de tienda
- responder
- denunciar

### STO-016 Finanzas
- ingresos
- comisiones
- retiros
- facturas

### STO-017 Reportes
- ventas
- cursos
- estudiantes
- reputación
- embudo

### STO-018 Notificaciones
- eventos operativos
- ventas
- cambios de estado
- soporte

### STO-019 Mensajes
- conversaciones con compradores, soporte o admin

### STO-020 Soporte
- tickets con plataforma

### STO-021 SEO / JSON-LD
- metadatos
- slug
- schema preview
- validación

### STO-022 Configuración
- políticas
- idioma
- moneda
- preferencias

### STO-023 Seguridad
- accesos
- sesiones
- actividad
- IPs recientes si aplica

---

# 10.3 Dashboard instructor

## Objetivo UX
Permitir al instructor producir contenido y seguir estudiantes.

## Menú lateral
- Dashboard
- Perfil profesional
- Mis cursos
- Contenido
- Evaluaciones
- Estudiantes
- Preguntas
- Mensajes
- Calendario
- Reviews
- Ingresos
- Reportes
- Notificaciones
- Soporte
- Configuración

## Pantallas

### INS-001 Dashboard
- cursos activos
- estudiantes
- lecciones pendientes
- evaluaciones
- alertas

### INS-002 Perfil profesional
- biografía
- especialidades
- foto
- credenciales

### INS-003 Mis cursos
- listado de cursos asignados

### INS-004 Contenido
- módulos
- lecciones
- recursos
- orden

### INS-005 Evaluaciones
- creación de pruebas
- resultados
- métricas

### INS-006 Estudiantes
- lista
- progreso
- finalización

### INS-007 Preguntas
- Q&A de estudiantes
- moderación de respuestas

### INS-008 Mensajes
- comunicación

### INS-009 Calendario
- fechas de sesiones
- recordatorios
- agenda

### INS-010 Reviews
- reputación
- comentarios

### INS-011 Ingresos
- rendimiento por curso
- liquidaciones

### INS-012 Reportes
- desempeño docente

### INS-013 Soporte
- tickets

---

# 10.4 Dashboard administrador

## Objetivo UX
Operar el marketplace completo con control, visibilidad y capacidad de decisión.

## Menú lateral
- Dashboard
- Usuarios
- Tiendas
- Instructores
- Cursos
- FUR-U
- FUR-T
- FUR-P
- FUR-GBP
- Categorías
- Pedidos
- Pagos
- Reembolsos
- Comisiones
- Suscripciones
- Publicidad
- Home Manager
- Reviews
- Notificaciones
- Soporte
- Reportes
- Auditoría
- SEO / JSON-LD
- Configuración
- Seguridad

## Pantallas

### ADM-001 Dashboard ejecutivo
- GMV
- ventas
- comisiones
- usuarios activos
- tiendas activas
- cursos publicados
- conversiones
- tickets abiertos

### ADM-002 Usuarios
- búsqueda
- filtros
- estados
- acciones masivas

### ADM-003 Tiendas
- onboarding
- verificación
- aprobación
- suspensión

### ADM-004 Instructores
- estados
- reputación
- asociaciones

### ADM-005 Cursos
- cola global
- moderación
- destacados
- archivado

### ADM-006 FUR-U
- revisión
- observaciones
- cambios de estado

### ADM-007 FUR-T
- verificación documental
- scoring
- aprobación

### ADM-008 FUR-P
- revisión técnica y editorial

### ADM-009 FUR-GBP
- validación de perfil empresarial

### ADM-010 Categorías
- árbol
- jerarquías
- SEO category pages

### ADM-011 Pedidos
- estados
- líneas
- tiendas
- incidencias

### ADM-012 Pagos
- transacciones
- fallos
- conciliación

### ADM-013 Reembolsos
- cola
- decisión
- trazabilidad

### ADM-014 Comisiones
- reglas
- porcentajes
- historia

### ADM-015 Suscripciones
- planes
- activas
- vencidas
- churn

### ADM-016 Publicidad
- campañas
- posiciones
- materiales
- resultados

### ADM-017 Home Manager
- secciones del home
- orden
- destacados
- banners
- previews

### ADM-018 Reviews
- moderación
- denuncias
- ocultamiento

### ADM-019 Notificaciones
- envíos masivos
- segmentación
- plantillas

### ADM-020 Soporte
- tickets globales
- SLA
- agentes

### ADM-021 Reportes
- ventas
- usuarios
- cursos
- tiendas
- publicidad
- soporte
- finanzas

### ADM-022 Auditoría
- logs
- filtros
- exportación

### ADM-023 SEO / JSON-LD
- validación estructurada
- cobertura SEO

### ADM-024 Configuración
- parámetros globales
- moneda
- idioma
- impuestos
- branding

### ADM-025 Seguridad
- roles
- permisos
- políticas
- sesiones críticas

---

# 10.5 Dashboard soporte operativo

## Menú lateral
- Dashboard
- Tickets
- Incidencias
- Usuarios
- Tiendas
- Cursos
- Pagos
- Reembolsos
- Base de conocimiento
- Plantillas
- SLA
- Reportes

## Pantallas
- cola de tickets
- detalle de ticket
- tablero por prioridad
- historial de atención
- consulta de órdenes y pagos
- base de conocimiento
- plantillas rápidas
- métricas de atención

---

# 10.6 Dashboard marketing

## Menú lateral
- Dashboard
- Banners
- Campañas
- Espacios del home
- Cupones
- Promociones
- Email marketing
- Segmentación
- Landing pages
- Tiendas destacadas
- Cursos patrocinados
- A/B testing
- Reportes

## Pantallas
- panel de campañas
- gestor de banners
- constructor de promociones
- métricas de clic y conversión
- configuración de placements

---

# 10.7 Dashboard finanzas

## Menú lateral
- Dashboard
- Cobros
- Pagos a tiendas
- Comisiones
- Retiros
- Reembolsos
- Facturación
- Conciliación
- Impuestos
- Reportes

## Pantallas
- resumen financiero
- transacciones
- liquidaciones
- reembolsos
- conciliación
- reportes financieros

---

# 10.8 Dashboard compliance / moderación

## Menú lateral
- Dashboard
- Casos
- FUR-U
- FUR-T
- FUR-P
- FUR-GBP
- Cursos
- Tiendas
- Reviews
- Documentos
- Sanciones
- Auditoría
- Reportes

## Pantallas
- cola de revisión
- vista comparativa de fichas
- checklist de cumplimiento
- decisión con observaciones
- historial de sanciones

---

# 10.9 Dashboard corporativo B2B

## Menú lateral
- Dashboard
- Perfil corporativo
- Usuarios del equipo
- Catálogo corporativo
- Solicitudes de cotización
- Propuestas
- Órdenes
- Inscripciones
- Progreso del equipo
- Certificados
- Facturación
- Reportes

## Pantallas
- resumen corporativo
- formularios de cotización
- comparador de propuestas
- gestión de empleados
- reportes de aprendizaje organizacional

---

# 11. Patrones UI por tipo de pantalla

## 11.1 Pantallas de catálogo
- filtros laterales
- grid responsivo
- cards homogéneas
- sort superior
- paginación o scroll controlado

## 11.2 Pantallas de detalle
- hero superior
- resumen rápido
- CTA fijo o sticky
- contenido segmentado en tabs o bloques

## 11.3 Formularios complejos
- dividir por pasos o secciones
- guardado de borrador
- validación inline
- ayudas contextuales
- resumen lateral cuando aplique

## 11.4 Tablas operativas
- encabezado fijo
- búsqueda interna
- filtros
- acciones por fila
- bulk actions
- exportar

## 11.5 Dashboards analíticos
- KPI top row
- charts
- tablas resumidas
- alertas
- listas de tareas
- quick actions

---

# 12. Responsive design

## 12.1 Desktop
- máxima densidad informativa
- múltiples columnas
- sidebar visible
- mayor uso de tablas

## 12.2 Tablet
- reducción de columnas
- sidebar colapsable
- componentes apilados en 2 columnas
- charts simplificados

## 12.3 Mobile
- navegación simplificada
- priorizar acciones clave
- cards apiladas
- tablas convertidas a listas
- CTA sticky en páginas de conversión
- filtros en drawer
- sidebar transformada en menú drawer o tabs

## 12.4 Reglas críticas responsive
- no cortar CTAs
- no ocultar información comercial esencial
- no saturar mobile con más de una acción primaria por bloque
- usar jerarquía vertical fuerte
- hacer visible progreso y navegación del curso

---

# 13. Estados, feedback e interacción

## 13.1 Estados visuales obligatorios
- hover
- active
- focus
- disabled
- loading
- empty
- success
- warning
- error

## 13.2 Feedback
- toast para éxito rápido
- inline message para validaciones
- modal para acciones críticas
- confirmación doble en acciones destructivas
- banners suaves para estados de cuenta o moderación

## 13.3 Microinteracciones
- elevación de card al hover
- animación breve en botones
- skeletons elegantes
- tabs fluidas
- loaders no intrusivos
- transiciones entre secciones del dashboard suaves

---

# 14. Accesibilidad

## Requisitos
- contraste AA mínimo
- foco visible
- labels en formularios
- iconos con texto cuando sea necesario
- navegación por teclado
- jerarquía semántica correcta
- áreas táctiles cómodas
- mensajes de error claros
- no depender solo del color para indicar estado

---

# 15. Reglas específicas para Stitch

## 15.1 Qué debe generar Stitch

- vistas de alta fidelidad
- desktop primero
- variantes tablet y mobile
- componentes reutilizables
- layout público y privado
- sistema de tarjetas
- sistema de tablas
- sistema de formularios
- sistema de notificaciones
- navegación lateral
- navegación superior
- estados de cada módulo

## 15.2 Prioridades de generación

1. Home público
2. Catálogo de cursos
3. Ficha de curso
4. Catálogo de tiendas
5. Ficha de tienda
6. Carrito
7. Checkout
8. Dashboard comprador
9. Dashboard tienda
10. Dashboard administrador
11. Dashboard instructor
12. Dashboards operativos
13. Sistema de componentes

## 15.3 Reglas de consistencia

- reutilizar mismos patrones de cards
- reutilizar mismas escalas tipográficas
- mantener mismo lenguaje de iconos
- mantener sidebar coherente entre dashboards
- mantener color primario consistente
- usar badges y chips con misma lógica de estados
- no inventar estilos visuales ajenos a esta guía

---

# 16. Entregables esperados de diseño

## 16.1 Website público
- home
- categorías
- búsqueda
- catálogo de cursos
- ficha de curso
- catálogo de tiendas
- ficha de tienda
- catálogo de instructores
- perfil instructor
- promociones
- planes
- carrito
- checkout
- confirmación
- login
- registro
- recuperación
- ayuda
- FAQ
- contacto
- legales
- blog
- landing B2B
- cotización

## 16.2 Vistas privadas
- comprador
- tienda / academia
- instructor
- administrador
- soporte
- marketing
- finanzas
- compliance
- corporativo B2B

## 16.3 Sistema base
- design tokens
- componentes
- variantes
- estados
- grids
- interacción
- responsive

---

# 17. Criterios de aprobación del UX/UI

El diseño se considerará alineado si:

1. todas las vistas públicas están cubiertas
2. todos los dashboards por rol están cubiertos
3. la paleta mantiene coherencia con la referencia visual
4. la tipografía se siente profesional y legible
5. el home comunica claramente propuesta de valor
6. la ficha de curso está optimizada para compra
7. la ficha de tienda transmite confianza
8. los paneles privados son operables y escalables
9. el sistema funciona bien en desktop, tablet y mobile
10. los componentes son reutilizables y consistentes
11. los estados y feedback son claros
12. el diseño es apto para desarrollo posterior en React.js

---

# 18. Nota final para Stitch

Diseñar este proyecto como un **producto real listo para pasar a desarrollo**, no como un mockup aislado.  
La meta no es solo “hacer pantallas bonitas”, sino construir una **experiencia integral de marketplace educativo** que funcione de manera coherente para:

- compradores
- academias
- instructores
- administradores
- soporte
- marketing
- finanzas
- compliance
- clientes corporativos

Priorizar claridad, consistencia, conversión, escalabilidad y usabilidad avanzada.

