# Plan CRM — Engagement y Rating de Artículos

Documento operativo para implementar una primera capa de CRM sobre `dev stash`
sin sobrediseñar el sistema. El foco inicial está en capturar señales reales de
lectura, interés e intención dentro del flujo editorial existente.

La regla del proyecto es simple:

- primero instrumentar,
- después observar,
- después automatizar.

No implementar lógica de CRM pesada antes de contar con señales confiables.

---

## 0. Objetivo

Construir una primera capa de CRM que permita responder preguntas como:

- qué artículos se abren más,
- cuáles se leen durante más tiempo,
- cuáles generan mayor valoración explícita,
- cuáles mueven más intención hacia un CTA,
- y qué lectores muestran señales de interés más fuertes.

La primera entrega debe ser útil, pequeña y acumulativa.

---

## 1. Alcance de la primera entrega

### Señales incluidas

- `visitorId` persistente
- `sessionId`
- `article_view`
- `activeSeconds`
- `rating` de `1` a `5`
- UX de rating sin fricción
- persistencia por `visitorId + articleSlug`

### Señales que quedan para la fase siguiente

- `scrollDepth` avanzado
- `article_card_click` avanzado
- `cta_click` avanzado
- agregados de dashboard CRM
- segmentación de leads

---

## 2. Principios UX

- No pedir login para medir ni para votar.
- No usar modales para ratear.
- No usar botón `Enviar` para la calificación.
- No interrumpir la lectura.
- El rating debe ser instantáneo, editable y reversible sin fricción.
- Toda la complejidad analítica debe quedar fuera de la vista del lector.

### UX del rating

El bloque de rating debe vivir dentro de la vista del artículo, no como popup.

Comportamiento esperado:

- hover progresivo sobre `1..5` estrellas,
- click directo guarda el valor,
- feedback sutil tipo `Guardado`,
- si el usuario vuelve a clicar otra estrella, actualiza la nota,
- si el usuario regresa al artículo, ve su rating previo.

Texto sugerido:

`¿Qué tan útil te resultó este artículo?`

---

## 3. Modelo de datos

Colección nueva:

`articleEngagement`

### Documento

ID sugerido:

`{visitorId}__{articleSlug}`

### Campos de la primera entrega

```ts
type ArticleRating = 1 | 2 | 3 | 4 | 5;

type ArticleEngagement = {
  visitorId: string;
  articleSlug: string;
  sessionId: string;
  viewCount: number;
  activeSeconds: number;
  rating: ArticleRating | null;
  ratedAt: Timestamp | null;
  firstViewedAt: Timestamp;
  lastViewedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### Campos reservados para la siguiente fase

```ts
type ArticleEngagementFutureFields = {
  maxScrollDepth?: number;
  ctaClicks?: number;
  cardClicks?: number;
  lastCardClickSource?: string | null;
  lastCardClickedAt?: Timestamp | null;
  lastCtaServiceId?: ArticleRelatedService;
  lastCtaClickedAt?: Timestamp | null;
  source?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  email?: string | null;
};
```

---

## 4. Decisiones de identidad

### `visitorId`

- persistido en `localStorage`
- estable entre visitas
- generado en cliente

### `sessionId`

- generado por sesión/visita
- útil para agrupar lecturas cercanas
- no reemplaza al `visitorId`

### Nota de diseño

No atar esta primera capa al email. Si después el visitante deja su email, se
podrá vincular retrospectivamente el comportamiento.

---

## 5. Reglas de medición

### Tiempo activo

Contar sólo tiempo real de lectura:

- sumar segundos únicamente cuando la pestaña está visible,
- pausar al perder visibilidad,
- reanudar al volver,
- hacer flush periódico sin escribir cada segundo.

### Vistas

Al abrir un artículo:

- incrementar `viewCount`
- setear o actualizar `firstViewedAt` y `lastViewedAt`

### Rating

- una nota por `visitorId + articleSlug`
- se puede sobreescribir
- guardar `ratedAt` al cambiarla

---

## 6. Archivos a tocar

### 6.1 [src/types/firestore.ts](/home/javier/Documents/dev%20stash/src/types/firestore.ts:1)

Agregar:

- `ArticleRating`
- `ArticleEngagement`

### Checklist

- [x] definir `ArticleRating = 1 | 2 | 3 | 4 | 5`
- [x] definir `ArticleEngagement`
- [x] dejar el tipo preparado para futuras métricas

---

### 6.2 [firestore.rules](/home/javier/Documents/dev%20stash/firestore.rules:1)

Agregar reglas para `articleEngagement`.

### Recomendación

- lectura: sólo admin/bot
- escritura: usuarios autenticados y visitantes anónimos autenticados
- create/update acotado al shape esperado
- delete sólo admin

### Checklist

- [x] crear `match /articleEngagement/{id}`
- [x] permitir `create`
- [x] permitir `update`
- [x] bloquear `delete` salvo admin
- [x] validar campos mínimos

---

### 6.3 Nuevo archivo [src/lib/crm.ts](/home/javier/Documents/dev%20stash/src/lib/crm.ts)

Responsabilidades:

- `visitorId`
- `sessionId`
- helper para construir IDs
- helper para visibilidad de página
- utilidades de tracking

### Funciones sugeridas

- `getOrCreateVisitorId()`
- `getOrCreateSessionId()`
- `buildArticleEngagementId(visitorId, articleSlug)`
- `isDocumentVisible()`

### Checklist

- [x] crear helper de `visitorId`
- [x] crear helper de `sessionId`
- [x] crear helper de ID compuesto
- [x] crear helper de visibilidad

---

### 6.4 Nuevo hook [src/hooks/useVisitorSession.ts](/home/javier/Documents/dev%20stash/src/hooks/useVisitorSession.ts)

Responsabilidades:

- exponer `visitorId`
- exponer `sessionId`
- asegurar inicialización estable en cliente

### Checklist

- [x] crear hook
- [x] devolver `visitorId`
- [x] devolver `sessionId`
- [x] evitar diferencias SSR/client aunque hoy sea SPA

---

### 6.5 [src/lib/queries.ts](/home/javier/Documents/dev%20stash/src/lib/queries.ts:1)

Agregar queries/mutations para engagement.

### API sugerida

- `queryKeys.articleEngagement(slug, visitorId)`
- `useArticleEngagement(articleSlug, visitorId)`
- `useUpsertArticleEngagement()`
- `useRateArticle()`
- `useTrackArticleView()`
- `useTrackArticleActiveTime()`

### Checklist

- [x] extender `queryKeys`
- [x] agregar lectura de `articleEngagement`
- [x] agregar mutation de upsert
- [x] agregar mutation de rating
- [x] preparar mutations para tiempo activo

---

### 6.6 Nuevo hook [src/hooks/useArticleEngagement.ts](/home/javier/Documents/dev%20stash/src/hooks/useArticleEngagement.ts)

Este hook debería orquestar la lógica de lectura.

Responsabilidades:

- registrar `article_view`
- iniciar contador activo
- pausar/reanudar con `visibilitychange`
- hacer flush al desmontar
- exponer estado del rating

### Checklist

- [x] montar tracking de vista
- [x] iniciar timer activo
- [x] pausar con `visibilitychange`
- [x] flush periódico
- [x] flush al desmontar
- [x] exponer `rating`
- [x] exponer `setRating`

---

### 6.7 Nuevo componente [src/components/blog/ArticleRating.tsx](/home/javier/Documents/dev%20stash/src/components/blog/ArticleRating.tsx)

Responsabilidades:

- UI de 5 estrellas
- hover progresivo
- click instantáneo
- estado seleccionado
- feedback de guardado
- accesibilidad básica

### Checklist

- [x] crear componente
- [x] renderizar 5 estrellas
- [x] hover progresivo
- [x] click instantáneo
- [x] feedback `Guardado`
- [x] soportar cambio de nota
- [x] soportar teclado/focus

---

### 6.8 [src/pages/BlogPost.tsx](/home/javier/Documents/dev%20stash/src/pages/BlogPost.tsx:1)

Integración principal del CRM V1.

### Cambios

- usar `useVisitorSession`
- usar `useArticleEngagement`
- renderizar `ArticleRating`

### Ubicación recomendada del rating

- al final del artículo
- antes del banner de email o antes del footer de keywords

### Checklist

- [x] inicializar sesión de visitante
- [x] conectar tracking del artículo
- [x] insertar bloque de rating
- [x] conservar la UX limpia

---

### 6.9 [src/pages/Home.tsx](/home/javier/Documents/dev%20stash/src/pages/Home.tsx:1)

Fase siguiente inmediata, pero no bloqueante para la primera entrega.

### Objetivo

Trackear `article_card_click` desde home.

### Checklist

- [x] detectar click en cards del bloque de artículos
- [x] registrar origen `home`
- [x] no bloquear navegación

---

### 6.10 [src/pages/Blog.tsx](/home/javier/Documents/dev%20stash/src/pages/Blog.tsx:1)

Fase siguiente inmediata, pero no bloqueante para la primera entrega.

### Objetivo

Trackear `article_card_click` desde archivo/blog.

### Checklist

- [x] detectar click en cards
- [x] registrar origen `blog_archive`
- [x] no bloquear navegación

---

### 6.11 [src/components/blog/ServiceCTA.tsx](/home/javier/Documents/dev%20stash/src/components/blog/ServiceCTA.tsx:1)

Fase posterior del mismo sistema.

### Objetivo

Trackear `cta_click`.

### Checklist

- [x] registrar click al CTA
- [x] incluir `articleSlug`
- [x] incluir `relatedServiceId`
- [x] incluir timestamp

---

## 6.12 [src/hooks/useArticleEngagement.ts](/home/javier/Documents/dev%20stash/src/hooks/useArticleEngagement.ts:1) — Scroll depth

Extensión de la capa de lectura para guardar la profundidad máxima recorrida.

### Checklist

- [x] medir `maxScrollDepth`
- [x] persistir el mayor valor alcanzado
- [x] flush al salir de la página
- [x] evitar writes por cada evento de scroll

---

## 7. Orden de implementación

### Fase 1

- [x] `src/types/firestore.ts`
- [x] `firestore.rules`
- [x] `src/lib/crm.ts`
- [x] `src/hooks/useVisitorSession.ts`
- [x] `src/lib/queries.ts`
- [x] `src/hooks/useArticleEngagement.ts`
- [x] `src/components/blog/ArticleRating.tsx`
- [x] `src/pages/BlogPost.tsx`

### Fase 2

- [x] `src/pages/Home.tsx`
- [x] `src/pages/Blog.tsx`
- [x] `src/components/blog/ServiceCTA.tsx`

### Fase 3

- [x] agregados CRM por artículo
- [x] sección CRM en admin
- [ ] filtros y ranking de engagement

---

## 8. Riesgos a cuidar

- demasiados writes por el timer
- medir tiempo con la pestaña en background
- doble escritura accidental al montar/desmontar
- rating con UI lenta o inconsistente
- reglas de Firestore demasiado abiertas
- acoplar demasiado pronto el CRM a email o auth

---

## 9. Criterios de aceptación de la primera entrega

- existe `visitorId` persistente
- existe `sessionId`
- abrir un artículo crea o actualiza un doc de engagement
- `viewCount` sube correctamente
- `activeSeconds` refleja tiempo visible y no tiempo muerto
- el usuario puede calificar con estrellas sin submit
- el rating se guarda y se recupera al volver al artículo
- la experiencia de lectura no se siente más pesada

---

## 10. Recomendación final

La primera implementación real debe salir con este paquete mínimo:

- identidad base,
- vista de artículo,
- tiempo activo,
- rating de 5 estrellas sin fricción.

Eso ya convierte al blog en una superficie legible para CRM sin sobrecargar la
arquitectura ni dañar la UX.
