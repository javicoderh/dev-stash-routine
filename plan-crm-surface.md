# Plan CRM Surface — Implementación Detallada

Documento operativo para construir la **capa real de CRM** de `dev stash`.
Está pensado para implementarse por etapas con `GPT-5.4`, con checkpoints
claros y alcance controlado por fase.

Este plan asume que ya existe una base de señales editoriales:

- `visitorId`
- `sessionId`
- `articleEngagement`
- `activeSeconds`
- `rating`
- `cardClicks`
- `ctaClicks`
- `maxScrollDepth`
- primera vista CRM dentro de `Editorial`

La meta ahora es separar:

- **Editorial Intelligence**
- **CRM real orientado a personas, flujos y decisiones**

---

## 0. Resultado esperado

Al terminar este plan, el admin debería tener una **surface CRM** separada y
navegable, capaz de responder:

- quiénes son los lectores más valiosos,
- qué temas concentran más afinidad,
- qué recorridos llevan a intención comercial,
- qué artículos empujan o frenan conversión,
- qué decisiones de UI o contenido conviene tomar.

---

## 1. Principios de diseño

- El CRM debe ser visualmente claro, no parecer una tabla cruda.
- La lectura principal debe poder hacerse en menos de 30 segundos.
- La vista debe servir tanto para estrategia de contenido como para decisiones
  de UX y funnels.
- Los labels deben hablar el lenguaje del producto, no el de analytics genérico.
- Primero mostrar señales confiables; después automatizar interpretación.

---

## 2. Arquitectura funcional del CRM

La nueva surface `CRM` se divide en 6 módulos:

1. `Overview`
2. `Content Intelligence`
3. `Leads`
4. `Journeys`
5. `Segments`
6. `Experiments`

---

## 3. Modelo de navegación

### Ubicación

Dentro del admin, `CRM` debe convertirse en una nueva surface al mismo nivel que:

- `Editorial`
- `DevOps`

### Comportamiento

- `Editorial` sigue centrado en contenido y operación editorial.
- `CRM` se enfoca en personas, señales, flujos e intención.
- `DevOps` queda separado como capa técnica.

### Checkpoints

- [x] agregar `CRM` como surface seleccionable en el header del admin
- [x] mantener `Editorial` y `DevOps` visualmente consistentes
- [x] asegurar que la surface activa tenga foco visual claro
- [x] mantener placeholder funcional en `DevOps`

---

## 4. Estructura de datos objetivo

### 4.1 Reutilizar `articleEngagement`

Se mantiene como base de señales por `visitorId + articleSlug`.

Campos ya existentes:

- `visitorId`
- `articleSlug`
- `sessionId`
- `viewCount`
- `activeSeconds`
- `rating`
- `ratedAt`
- `firstViewedAt`
- `lastViewedAt`
- `maxScrollDepth`
- `ctaClicks`
- `cardClicks`
- `lastCardClickSource`
- `lastCtaServiceId`

### 4.2 Nueva colección `crmEvents`

Sirve para eventos crudos y análisis de flujos.

```ts
type CrmEvent = {
  eventId: string;
  eventType:
    | 'article_view'
    | 'article_card_click'
    | 'article_rating'
    | 'article_active_time_flush'
    | 'article_scroll_depth_update'
    | 'cta_click'
    | 'page_view'
    | 'email_capture_submit';
  visitorId: string;
  sessionId: string;
  articleSlug?: string | null;
  pagePath: string;
  pageType: 'home' | 'blog_archive' | 'blog_post' | 'services' | 'other';
  source?: string | null;
  componentId?: string | null;
  relatedServiceId?: string | null;
  value?: number | null;
  occurredAt: Timestamp;
};
```

### 4.3 Nueva colección `leadProfiles`

Agregado por persona.

```ts
type LeadProfile = {
  id: string; // visitorId o leadId
  visitorId: string;
  email: string | null;
  firstSeenAt: Timestamp;
  lastSeenAt: Timestamp;
  visitCount: number;
  sessionCount: number;
  totalActiveSeconds: number;
  articlesReadCount: number;
  ctaClicks: number;
  avgRatingGiven: number | null;
  strongestTopicAffinity: string | null;
  strongestCommercialIntent: string | null;
  leadScore: number;
  lifecycleStage: 'cold' | 'aware' | 'engaged' | 'warm' | 'hot';
};
```

### 4.4 Nueva colección `journeySummaries`

Resumen por sesión.

```ts
type JourneySummary = {
  id: string; // sessionId
  visitorId: string;
  sessionId: string;
  landingPath: string;
  articleSlugs: string[];
  pagesVisited: string[];
  ctaClicks: number;
  servicesTouched: string[];
  startedAt: Timestamp;
  endedAt: Timestamp;
};
```

### Checkpoints

- [x] definir `CrmEvent` en `src/types/firestore.ts`
- [x] definir `LeadProfile` en `src/types/firestore.ts`
- [x] definir `JourneySummary` en `src/types/firestore.ts`
- [x] extender `ArticleEngagement` sólo si hace falta, no por anticipación vaga

---

## 5. Firestore y reglas

### Objetivo

Habilitar CRM sin abrir demasiado los permisos.

### Reglas recomendadas

#### `crmEvents`
- lectura: admin/bot
- create: signed-in user
- update: false
- delete: admin

#### `leadProfiles`
- lectura: admin/bot
- write: admin/bot o rutinas internas

#### `journeySummaries`
- lectura: admin/bot
- write: admin/bot o proceso agregado

### Checkpoints

- [x] agregar `match /crmEvents/{id}`
- [x] agregar `match /leadProfiles/{id}`
- [x] agregar `match /journeySummaries/{id}`
- [x] mantener las writes del cliente acotadas sólo a eventos permitidos

---

## 6. Fases de implementación

## Fase 1 — Surface CRM premium

Objetivo: habilitar la nueva surface `CRM` en el admin con layout premium,
aunque algunos módulos todavía muestren placeholders funcionales.

### UI objetivo

Dentro de `CRM`:

- header propio
- tabs internas o secciones visibles
- overview usable
- placeholders premium para módulos todavía no conectados

### Archivos

- [src/pages/Admin.tsx](/home/javier/Documents/dev%20stash/src/pages/Admin.tsx:1)

### Checkpoints

- [x] agregar `CRM` como surface real
- [x] mover la vista analítica actual fuera de `Editorial` y llevarla a `CRM`
- [x] dejar `Editorial` limpio y centrado en gestión de contenido
- [x] diseñar `CRM` con layout de 6 módulos
- [x] usar placeholders premium donde falte data real

---

## Fase 2 — Overview CRM

Objetivo: hacer una portada que lea el sistema completo.

### Qué debe mostrar

- lectores únicos
- sesiones
- tiempo activo total
- tiempo medio por sesión
- artículos leídos
- CTR global a servicios
- rating global
- leads más calientes
- temas con mejor afinidad

### Componentes sugeridos

- KPI cards
- timeline o barra de actividad
- ranking de artículos
- ranking de lectores
- bloque de “insights”

### Archivos

- [src/lib/adminQueries.ts](/home/javier/Documents/dev%20stash/src/lib/adminQueries.ts:1)
- nuevo [src/components/admin/crm/CrmOverview.tsx](/home/javier/Documents/dev%20stash/src/components/admin/crm/CrmOverview.tsx)

### Checkpoints

- [x] extraer el overview actual a un componente dedicado
- [x] enriquecer el overview con señales centradas en lectores
- [x] agregar bloque de insights automáticos simples
- [x] mantener filtros temporales `7d / 30d / all`

---

## Fase 3 — Content Intelligence

Objetivo: dejar separada la inteligencia de contenido del CRM general.

### Qué debe mostrar

- performance por artículo
- badges de salud editorial
- tiempo, depth, rating, CTA rate
- top performers
- underperformers
- diferencia entre tracción y conversión

### Vista

- grid de cards
- tabla con ordenamiento
- drilldown individual por artículo

### Archivos

- nuevo [src/components/admin/crm/ContentIntelligence.tsx](/home/javier/Documents/dev%20stash/src/components/admin/crm/ContentIntelligence.tsx)

### Checkpoints

- [x] mover la lógica editorial actual a `Content Intelligence`
- [x] mantener tabs `Atención / Valoración / Intención`
- [x] consolidar el drilldown por artículo
- [x] preservar `synthetic seed`

---

## Fase 4 — Leads

Objetivo: reorganizar señales alrededor de personas.

### Qué debe mostrar

- lista de leads / visitantes activos
- lead score
- lifecycle stage
- artículos leídos
- tiempo total
- rating medio dado
- clicks a CTA
- tema dominante
- última actividad

### UI sugerida

- tabla principal
- panel lateral o drilldown
- badges por stage
- filtros por `hot / warm / engaged / cold`

### Lógica

Crear agregación de `articleEngagement -> leadProfiles`.

### Archivos

- [src/lib/adminQueries.ts](/home/javier/Documents/dev%20stash/src/lib/adminQueries.ts:1)
- nuevo [src/components/admin/crm/CrmLeads.tsx](/home/javier/Documents/dev%20stash/src/components/admin/crm/CrmLeads.tsx)

### Checkpoints

- [x] crear query de `leadProfiles`
- [x] calcular `leadScore`
- [x] calcular `lifecycleStage`
- [x] renderizar tabla de leads
- [x] renderizar drilldown por lead

---

## Fase 5 — Journeys

Objetivo: entender secuencias, no sólo eventos sueltos.

### Qué debe mostrar

- rutas más frecuentes
- rutas con CTA
- rutas que terminan en servicios
- secuencias de artículos
- sesiones cortas vs profundas

### UI sugerida

- cards de journeys
- tabla de sesiones
- “path strings” visuales
- badges de resultado (`solo lectura`, `exploración`, `intención`, `salto a servicios`)

### Archivos

- nuevo [src/components/admin/crm/CrmJourneys.tsx](/home/javier/Documents/dev%20stash/src/components/admin/crm/CrmJourneys.tsx)

### Checkpoints

- [x] crear `crmEvents`
- [x] registrar eventos crudos mínimos
- [x] agregar resúmenes por `sessionId`
- [x] renderizar lista de journeys
- [x] renderizar clasificación de journey

---

## Fase 6 — Segments

Objetivo: convertir el CRM en herramienta de decisión.

### Segmentos recomendados

- `Scanner`
- `Reader`
- `Engaged Reader`
- `High-Intent Reader`
- `Topic-Clustered`
- `Returning Evaluator`
- `Warm Lead`
- `Hot Lead`

### Qué debe mostrar

- tamaño del segmento
- señales promedio
- artículos dominantes
- servicios más tocados

### UI sugerida

- grid de segment cards
- badges de intensidad
- click para abrir detalle

### Checkpoints

- [x] definir segmentación base
- [x] crear función de clasificación
- [x] renderizar segments overview
- [x] renderizar detalle por segmento

---

## Fase 7 — Experiments

Objetivo: usar CRM para mejorar contenido y UI.

### Qué debe mostrar

- hipótesis activas
- artículos con baja profundidad
- artículos con buena lectura y baja intención
- títulos con alta apertura y baja retención
- bloques de UI con mejor o peor respuesta

### UI sugerida

- lista de hipótesis
- estado `observando / probar / iterar / descartar`
- panel con evidencia

### Checkpoints

- [x] crear vista `Experiments`
- [x] traducir señales en hipótesis simples
- [x] mostrar recomendaciones accionables

---

## 7. Tracking adicional necesario

Para construir CRM real, la capa de señales debe ampliarse.

### Eventos a implementar

- [x] `page_view`
- [x] `article_view`
- [x] `article_card_click`
- [x] `article_rating`
- [x] `article_scroll_depth_update`
- [x] `article_active_time_flush`
- [x] `cta_click`
- [x] `email_capture_submit`
- [x] `services_page_view`

### Metadata útil

- [x] `pageType`
- [x] `pagePath`
- [x] `componentId`
- [x] `source`
- [x] `relatedServiceId`
- [x] `occurredAt`

---

## 8. Lead scoring

### Fórmula v1

- `+1` por vista de artículo
- `+2` por lectura > 45s
- `+3` por lectura > 90s
- `+2` por scroll > 60%
- `+3` por rating 4-5
- `+5` por CTA click
- `+4` por visita recurrente
- `+5` por 3+ artículos del mismo tema
- `+8` por email capturado
- `+10` por visita a servicios después de contenido

### Lifecycle stage

- `0-4` → `cold`
- `5-11` → `aware`
- `12-19` → `engaged`
- `20-29` → `warm`
- `30+` → `hot`

### Checkpoints

- [x] implementar función `computeLeadScore`
- [x] implementar función `computeLifecycleStage`
- [x] mostrar score y stage en UI

---

## 9. Synthetic seed

La demo del CRM debe poder poblarse con datos creíbles.

### Requisitos

- generar `articleEngagement`
- generar `crmEvents`
- opcionalmente generar `leadProfiles` sintéticos
- cubrir varias ventanas temporales
- cubrir varios segmentos

### Checkpoints

- [x] agregar seed sintético para `articleEngagement`
- [x] extender seed a `crmEvents`
- [x] extender seed a `leadProfiles`
- [x] agregar botón `Reset synthetic data`

---

## 10. Reset / hygiene

No alcanza con sembrar; también hay que poder limpiar.

### Requisitos

- borrar engagement sintético
- borrar eventos sintéticos
- borrar leads sintéticos
- no tocar data real

### Checkpoints

- [x] marcar data sintética con `source: synthetic-seed`
- [x] crear action `Reset demo data`
- [x] asegurar borrado seguro por `source`

---

## 11. Orden recomendado de ejecución con GPT-5.4

### Sprint 1

- [x] Surface `CRM` real en `Admin`
- [x] mover overview actual a `CRM`
- [x] placeholders premium para módulos restantes

### Sprint 2

- [x] `Content Intelligence` como módulo dedicado
- [x] drilldown sólido por artículo
- [x] filtros temporales refinados

### Sprint 3

- [x] `crmEvents`
- [x] `Journeys`
- [x] tracking adicional crudo

### Sprint 4

- [x] `leadProfiles`
- [x] lead scoring
- [x] tabla de leads

### Sprint 5

- [x] `Segments`
- [x] `Experiments`
- [x] reset de data demo

---

## 12. Criterios de aceptación

### Surface CRM

- [x] existe `CRM` como surface separada de `Editorial`
- [x] la navegación entre surfaces es clara
- [x] el diseño se siente premium y no genérico

### Data

- [x] la capa de señales persiste correctamente
- [x] la semilla sintética permite demo realista
- [x] se puede distinguir data real de sintética

### Uso

- [x] el overview responde preguntas de negocio rápido
- [x] se puede abrir drilldown de artículo
- [x] se puede leer drilldown de lead
- [x] se pueden ver journeys
- [x] se pueden identificar segmentos

---

## 13. Nota final para implementación

Cada checkpoint debe cerrarse con estas validaciones:

- [x] implementación visual
- [x] wiring de datos
- [x] `npm run lint`
- [x] chequeo de estados vacíos
- [x] chequeo de loading states
- [x] chequeo de synthetic seed

No avanzar a la siguiente fase sin dejar estable la anterior.
