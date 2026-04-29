# Plan de extensiones — Agents, Business Ideas, AI Tips

Documento autocontenido para implementar tres secciones nuevas en Personal Dev Stash. Pensado para que un agente lo siga linealmente sin necesidad del contexto de la conversación que lo originó.

> **Audiencia:** agente de Claude Code trabajando en el repo `dev stash`. Antes de tocar nada, leé `CLAUDE.md` del proyecto. Este plan respeta todas sus reglas (stack, convenciones, design tokens, prohibiciones).

---

## 0. Contexto

La app actual tiene:

- **News** (carousel + archivo): array dentro de `briefings/{date}`
- **Rust Tasks** (aside + archivo + detalle): colección `rustTasks`
- **Rust Readings** (sección home + archivo + detalle): colección `rustReadings`

Vamos a sumar **3 secciones nuevas** que siguen patrones similares a Rust Readings (full-width abajo del row principal). El contenido lo va a generar la rutina remota existente (`trig_01Mtsnv2oLR5AXgWwBuQiymF`).

### Resultado final del home

```
┌─────────────────────────┬──────────────────┐
│  News carousel          │  Rust Tasks      │
│                         │  (aside)         │
└─────────────────────────┴──────────────────┘
─────────────────────────────────────────────
  Idea de negocio del día
─────────────────────────────────────────────
  AI Tips
─────────────────────────────────────────────
  Agent Items
─────────────────────────────────────────────
  Rust Readings
─────────────────────────────────────────────
```

### Spec consolidada (decisiones tomadas)

| Decisión | Valor |
|---|---|
| Audiencia AI Tips | Personal (repertorio del usuario, no para compartir) |
| Categorías AI Tips | **Cerradas**: `productividad`, `escritura`, `estudio`, `trabajo`, `vida_diaria`, `investigacion` |
| Tipos AgentItem | `news` / `changelog` / `pattern` |
| Whitelist agentes | Hermes, nano claw, openclaw, Claude Code, Cursor, Aider, Cline, OpenHands |
| Items por día (agents) | 1-2 |
| Items por día (tips) | 1-2 |
| Items por día (business) | 0-1 (puede omitirse) |
| Skip days | Sí, en agents/business/tips si no hay sustancia |
| Status toggle | Sí en agentItems y aiTips. **No** en businessIdeas |
| BusinessIdea content | Campos estructurados (no markdown libre) |

---

## 1. Modelos de datos

Agregar a `src/types/firestore.ts` después de los tipos existentes (no modificar los previos):

```typescript
// ===== AgentItem =====
export type AgentItemType = 'news' | 'changelog' | 'pattern';

export type AgentItem = {
  id: string;
  date: string;              // "YYYY-MM-DD"
  agentName: string;         // "Hermes" | "Cursor" | ... (string libre)
  type: AgentItemType;
  title: string;
  content: string;           // markdown
  codeSnippet: string | null; // típicamente para type='pattern'
  version: string | null;    // típicamente para type='changelog'
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};

// ===== BusinessIdea =====
export type BusinessIdea = {
  id: string;
  date: string;
  title: string;
  worldContext: string;      // la noticia/evento que la dispara (con fuente y fecha)
  problem: string;
  solution: string;
  market: string;
  sources: string[];
  createdAt: Timestamp;
};

// ===== AiTip =====
export type AiTipCategory =
  | 'productividad'
  | 'escritura'
  | 'estudio'
  | 'trabajo'
  | 'vida_diaria'
  | 'investigacion';

export type AiTip = {
  id: string;
  date: string;
  title: string;
  content: string;           // markdown con ejemplo concreto
  toolName: string;          // "ChatGPT" | "Claude" | "Gemini" | "Notion AI" | "general"
  category: AiTipCategory;
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};
```

---

## 2. Reglas de Firestore

Editar `firestore.rules`. Agregar dentro del bloque `match /databases/{database}/documents`:

```diff
+    match /agentItems/{id} {
+      allow read: if isSignedIn();
+      allow update: if isSignedIn() && onlyToggleFields();
+      allow create, delete: if false;
+    }
+
+    match /businessIdeas/{id} {
+      allow read: if isSignedIn();
+      allow write: if false;
+    }
+
+    match /aiTips/{id} {
+      allow read: if isSignedIn();
+      allow update: if isSignedIn() && onlyToggleFields();
+      allow create, delete: if false;
+    }
```

La función `onlyToggleFields()` ya existe en el archivo y se reutiliza tal cual.

**Deploy de reglas** (después de editar):

```bash
firebase deploy --only firestore:rules
```

El usuario ya está autenticado en Firebase CLI (`firebase login` corrido) y el proyecto activo es `dev-stash-f308c`. Podés correr el deploy directamente sin pasos previos.

---

## 3. Frontend — implementación paso a paso

> **Convención general:** seguir patrones existentes. Antes de crear cada archivo, leer el equivalente de Rust Readings para copiar estructura, naming, clases Tailwind, idiomas, etc.

### 3.1 Extender `src/lib/queries.ts`

Agregar a `queryKeys`:

```typescript
recentAgentItems: (limit: number) => ['agentItems', 'recent', limit] as const,
agentItem: (id: string) => ['agentItems', 'byId', id] as const,
allAgentItems: ['agentItems', 'all'] as const,

recentBusinessIdeas: (limit: number) => ['businessIdeas', 'recent', limit] as const,
businessIdea: (id: string) => ['businessIdeas', 'byId', id] as const,
allBusinessIdeas: ['businessIdeas', 'all'] as const,

recentAiTips: (limit: number) => ['aiTips', 'recent', limit] as const,
aiTip: (id: string) => ['aiTips', 'byId', id] as const,
allAiTips: ['aiTips', 'all'] as const,
```

Agregar hooks **siguiendo el patrón exacto** de `useRecentRustReadings` / `useRustReading` / `useAllRustReadings`:

- `useRecentAgentItems(limit = 7)`
- `useAgentItem(id: string | undefined)`
- `useAllAgentItems()`
- `useRecentBusinessIdeas(limit = 7)`
- `useBusinessIdea(id: string | undefined)`
- `useAllBusinessIdeas()`
- `useRecentAiTips(limit = 7)`
- `useAiTip(id: string | undefined)`
- `useAllAiTips()`

Agregar mutations toggle (mismo patrón que `useToggleReadingStatus`):

```typescript
export function useToggleAgentItemStatus() {
  return useToggleMutation(
    'agentItems',
    [queryKeys.allAgentItems, queryKeys.recentAgentItems(7)],
    queryKeys.agentItem,
  );
}

export function useToggleAiTipStatus() {
  return useToggleMutation(
    'aiTips',
    [queryKeys.allAiTips, queryKeys.recentAiTips(7)],
    queryKeys.aiTip,
  );
}
```

Y extender el tipo `collectionName` en `buildToggle` y `useToggleMutation` para aceptar `'agentItems'` y `'aiTips'`:

```typescript
function buildToggle(collectionName: 'rustTasks' | 'rustReadings' | 'agentItems' | 'aiTips') {
  // ...
}

function useToggleMutation(
  collectionName: 'rustTasks' | 'rustReadings' | 'agentItems' | 'aiTips',
  // ...
)
```

**BusinessIdea no tiene mutation** (no hay status toggle).

### 3.2 Extender `src/hooks/useToggleStatus.ts`

Agregar dos kinds nuevos:

```typescript
type Kind = 'task' | 'reading' | 'agent' | 'tip';

export function useToggleStatus(kind: Kind) {
  const taskMutation = useToggleTaskStatus();
  const readingMutation = useToggleReadingStatus();
  const agentMutation = useToggleAgentItemStatus();
  const tipMutation = useToggleAiTipStatus();
  // ...
  const mutation =
    kind === 'task' ? taskMutation
    : kind === 'reading' ? readingMutation
    : kind === 'agent' ? agentMutation
    : tipMutation;
  // ...
}
```

### 3.3 Badges nuevos en `src/components/ui/StatusBadge.tsx`

Agregar `AgentTypeBadge` y `AiTipCategoryBadge` siguiendo el patrón de `FormatBadge`.

```typescript
const agentTypeLabels: Record<AgentItemType, string> = {
  news: 'News',
  changelog: 'Changelog',
  pattern: 'Patrón',
};

const agentTypeColors: Record<AgentItemType, string> = {
  news: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  changelog: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  pattern: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

export function AgentTypeBadge({ type }: { type: AgentItemType }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5',
        'font-mono text-[10px] uppercase tracking-wider',
        agentTypeColors[type],
      )}
    >
      {agentTypeLabels[type]}
    </span>
  );
}
```

Mismo patrón para `AiTipCategoryBadge`:

```typescript
const aiTipCategoryLabels: Record<AiTipCategory, string> = {
  productividad: 'Productividad',
  escritura: 'Escritura',
  estudio: 'Estudio',
  trabajo: 'Trabajo',
  vida_diaria: 'Vida diaria',
  investigacion: 'Investigación',
};

const aiTipCategoryColors: Record<AiTipCategory, string> = {
  productividad: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  escritura: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  estudio: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  trabajo: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  vida_diaria: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  investigacion: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
};
```

Importar tipos `AgentItemType`, `AiTipCategory` en el archivo.

### 3.4 Componentes del home

**Carpetas nuevas:**

```
src/components/agents/
src/components/business/
src/components/tips/
```

#### 3.4.1 `src/components/agents/AgentItemsList.tsx`

Mirror exacto de `src/components/rust/RustReadingsList.tsx`. Cambios:

- Hook: `useRecentAgentItems(7)`
- Título: `"Agent Items"`
- Item component: `AgentItemRow`
- Empty: `"Sin items recientes."`
- Link: `to="/archive/agents"` con texto `"Histórico completo"`

#### 3.4.2 `src/components/agents/AgentItemRow.tsx`

Mirror de `RustReadingItem.tsx`. Cambios:

- Mostrar `agentName` y `type` (badges) además del título
- `useToggleStatus('agent')`
- Link: `/agent-items/:id`

Layout sugerido:

```tsx
<li className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
  <StatusToggle ... />
  <span className="font-mono text-xs text-text-muted w-16 tabular-nums">
    {formatDateShort(item.date)}
  </span>
  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
    {item.agentName}
  </span>
  <AgentTypeBadge type={item.type} />
  <RouterLink
    to={`/agent-items/${item.id}`}
    className="flex-1 text-text-primary hover:text-accent-primary transition-colors"
  >
    {item.title}
  </RouterLink>
</li>
```

#### 3.4.3 `src/components/tips/AiTipsList.tsx`

Mirror de `RustReadingsList.tsx`. Cambios:

- Hook: `useRecentAiTips(7)`
- Título: `"AI Tips"`
- Item: `AiTipRow`
- Link: `/archive/ai-tips`, texto `"Histórico completo"`

#### 3.4.4 `src/components/tips/AiTipRow.tsx`

Mirror de `RustReadingItem.tsx`. Cambios:

- Mostrar `category` (badge) + `toolName` (mono small)
- `useToggleStatus('tip')`
- Link: `/ai-tips/:id`

Layout:

```tsx
<li className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
  <StatusToggle ... />
  <span className="font-mono text-xs text-text-muted w-16 tabular-nums">
    {formatDateShort(tip.date)}
  </span>
  <AiTipCategoryBadge category={tip.category} />
  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
    {tip.toolName}
  </span>
  <RouterLink
    to={`/ai-tips/${tip.id}`}
    className="flex-1 text-text-primary hover:text-accent-primary transition-colors"
  >
    {tip.title}
  </RouterLink>
</li>
```

#### 3.4.5 `src/components/business/BusinessIdeasList.tsx`

Mirror de `RustReadingsList.tsx`. Cambios:

- Hook: `useRecentBusinessIdeas(7)`
- Título: `"Idea de negocio"`
- Item: `BusinessIdeaRow`
- Link: `/archive/business-ideas`

#### 3.4.6 `src/components/business/BusinessIdeaRow.tsx`

**Diseño distinto** de los demás rows porque BusinessIdea no tiene status toggle y vale la pena mostrar más contexto. Layout:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import type { BusinessIdea } from '@/types/firestore';
import { formatDateShort } from '@/lib/dates';

type Props = { idea: BusinessIdea };

export function BusinessIdeaRow({ idea }: Props) {
  return (
    <li className="py-4 border-b border-border last:border-b-0">
      <RouterLink
        to={`/business-ideas/${idea.id}`}
        className="block group"
      >
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {formatDateShort(idea.date)}
          </span>
          <h3 className="font-display text-lg font-medium text-text-primary
                         group-hover:text-accent-primary transition-colors">
            {idea.title}
          </h3>
        </div>
        <p className="text-sm text-text-secondary line-clamp-2 font-serif">
          {idea.worldContext}
        </p>
      </RouterLink>
    </li>
  );
}
```

### 3.5 Cards de archivo

Extender `src/components/archive/ArchiveCard.tsx` con tres cards nuevos.

#### 3.5.1 `AgentItemArchiveCard`

Mirror de `RustReadingArchiveCard`. Cambios:

- Header de la card: fecha + `agentName` (mono uppercase) + `AgentTypeBadge`, `StatusBadge` a la derecha
- Body: title (Fraunces) + preview del content vía `firstLines(item.content, 200)`
- Footer: `StatusToggle` con `useToggleStatus('agent')`
- Link: `/agent-items/:id`

#### 3.5.2 `AiTipArchiveCard`

Mirror de `RustReadingArchiveCard`. Cambios:

- Header: fecha + `AiTipCategoryBadge` + `toolName` (mono), `StatusBadge` a la derecha
- Body: title + preview del content
- Footer: toggle con `useToggleStatus('tip')`
- Link: `/ai-tips/:id`

#### 3.5.3 `BusinessIdeaArchiveCard`

Sin status toggle ni footer. Layout:

```tsx
export function BusinessIdeaArchiveCard({ idea }: { idea: BusinessIdea }) {
  return (
    <CardShell>
      <RouterLink
        to={`/business-ideas/${idea.id}`}
        className="flex flex-col flex-1 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-text-muted">
            {formatDateShort(idea.date)}
          </span>
        </div>
        <h3 className="font-display text-lg font-medium leading-snug text-text-primary
                       group-hover:text-accent-primary transition-colors">
          {idea.title}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-wider font-mono text-text-muted">
          Mercado
        </p>
        <p className="text-sm text-text-secondary line-clamp-2 font-serif">
          {idea.market}
        </p>
        <p className="mt-3 text-xs uppercase tracking-wider font-mono text-text-muted">
          Problema
        </p>
        <p className="text-sm text-text-secondary line-clamp-3 font-serif flex-1">
          {idea.problem}
        </p>
      </RouterLink>
    </CardShell>
  );
}
```

### 3.6 Páginas de archivo

Tres archivos nuevos en `src/pages/`:

#### 3.6.1 `src/pages/AgentItemsArchive.tsx`

Mirror de `RustReadingsArchive.tsx`. Cambios:

- `useAllAgentItems()`
- Card: `AgentItemArchiveCard`
- **Tres filtros**: status (Todos/Pendientes/Leídos), type (Todos/News/Changelog/Pattern), agentName (Todos/{cada agente}). Combinación AND.
- Para `agentName` filter, derivar las opciones desde `data` (extraer agentes únicos):
  ```typescript
  const agentNames = useMemo(() =>
    Array.from(new Set(data?.map(i => i.agentName) ?? [])).sort(),
    [data]
  );
  ```
- Breadcrumb: `Inicio / Archivo / Agent Items`
- H1: `"Agent Items"`

#### 3.6.2 `src/pages/AiTipsArchive.tsx`

Mirror de `RustReadingsArchive.tsx`. Cambios:

- `useAllAiTips()`
- Card: `AiTipArchiveCard`
- **Tres filtros**: status, category (cerrada con los 6 valores), toolName (derivada de data como en agents)
- Breadcrumb: `Inicio / Archivo / AI Tips`
- H1: `"AI Tips"`

#### 3.6.3 `src/pages/BusinessIdeasArchive.tsx`

Mirror de `RustReadingsArchive.tsx` pero **sin filtros de status** (no hay status). Solo orden asc/desc.

- `useAllBusinessIdeas()`
- Card: `BusinessIdeaArchiveCard`
- Sin componente `ArchiveFilters` o solo con orden
- Breadcrumb: `Inicio / Archivo / Ideas de negocio`
- H1: `"Ideas de negocio"`

### 3.7 Páginas de detalle

Tres archivos nuevos en `src/pages/`:

#### 3.7.1 `src/pages/AgentItemDetail.tsx`

Mirror de `RustTaskDetail.tsx` (no `RustReadingDetail`, porque también muestra codeSnippet). Cambios:

- `useAgentItem(id)`
- `useToggleStatus('agent')`
- Header: fecha + `agentName` + `AgentTypeBadge` + (si type='changelog' y `version`) `version` en mono
- Body: `<Markdown>{item.content}</Markdown>`
- Si `codeSnippet`: bloque aparte abajo del content (mismo patrón que rustTask)
- Sources al final
- Breadcrumb: `Inicio / Agent Items / {title}` con link a `/archive/agents`

#### 3.7.2 `src/pages/AiTipDetail.tsx`

Mirror de `RustReadingDetail.tsx`. Cambios:

- `useAiTip(id)`
- `useToggleStatus('tip')`
- Header: fecha + `AiTipCategoryBadge` + `toolName` (mono)
- Body markdown + sources
- Breadcrumb: `Inicio / AI Tips / {title}` con link a `/archive/ai-tips`

#### 3.7.3 `src/pages/BusinessIdeaDetail.tsx`

Diseño distinto — campos estructurados, no markdown libre, sin status toggle. Estructura:

```tsx
import { useParams } from 'react-router-dom';
import { useBusinessIdea } from '@/lib/queries';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateLong } from '@/lib/dates';
import { NotFoundInline } from '@/pages/NotFound';

export default function BusinessIdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: idea, isLoading } = useBusinessIdea(id);

  if (isLoading) return <DetailSkeleton />;
  if (!idea) return <NotFoundInline kind="businessIdea" />;

  return (
    <div className="max-w-[720px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Ideas de negocio', to: '/archive/business-ideas' },
          { label: idea.title },
        ]}
      />

      <header className="mt-6 mb-10">
        <span className="font-mono text-xs text-text-muted">
          {formatDateLong(idea.date)}
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight text-text-primary">
          {idea.title}
        </h1>
      </header>

      <Section label="Contexto del mundo" body={idea.worldContext} />
      <Section label="Problema" body={idea.problem} />
      <Section label="Solución" body={idea.solution} />
      <Section label="Mercado" body={idea.market} />

      {idea.sources?.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-display text-lg font-medium text-text-primary mb-3">
            Fuentes
          </h2>
          <ul className="space-y-1.5">
            {idea.sources.map((src) => (
              <li key={src}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-link hover:text-accent-primary
                             underline underline-offset-4 decoration-accent-link/40 break-all"
                >
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-accent-rust mb-2">
        {label}
      </h2>
      <p className="font-serif text-text-primary leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-[720px] mx-auto">
      <Skeleton className="h-4 w-1/2 mb-6" />
      <Skeleton className="h-10 w-3/4 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

Si `NotFoundInline` no soporta `kind="businessIdea"`, extender el componente para que acepte ese valor (revisar `src/pages/NotFound.tsx`).

### 3.8 Actualizar `src/pages/Home.tsx`

Reordenar las secciones full-width según el orden confirmado:

```tsx
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLatestBriefing } from '@/lib/queries';
import { NewsCarousel } from '@/components/news/NewsCarousel';
import { RustTasksAside } from '@/components/rust/RustTasksAside';
import { RustReadingsList } from '@/components/rust/RustReadingsList';
import { AgentItemsList } from '@/components/agents/AgentItemsList';
import { BusinessIdeasList } from '@/components/business/BusinessIdeasList';
import { AiTipsList } from '@/components/tips/AiTipsList';
import { Skeleton } from '@/components/ui/Skeleton';
import { MonoLabel } from '@/components/ui/MonoLabel';
import { formatDateLong, todayISO } from '@/lib/dates';

export default function Home() {
  const { data: briefing, isLoading } = useLatestBriefing();
  const isStale = briefing && briefing.date !== todayISO();

  return (
    <div className="space-y-16">
      {/* Row superior: news + rust tasks aside (sin cambios) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
        {/* ... mantener exactamente lo que ya está ... */}
      </section>

      <hr className="border-border" />
      <BusinessIdeasList />

      <hr className="border-border" />
      <AiTipsList />

      <hr className="border-border" />
      <AgentItemsList />

      <hr className="border-border" />
      <RustReadingsList />
    </div>
  );
}
```

### 3.9 Rutas en `src/App.tsx`

Sumar los lazy imports y `<Route>` siguiendo el patrón existente:

```tsx
const AgentItemsArchive = lazy(() => import('@/pages/AgentItemsArchive'));
const AgentItemDetail = lazy(() => import('@/pages/AgentItemDetail'));
const BusinessIdeasArchive = lazy(() => import('@/pages/BusinessIdeasArchive'));
const BusinessIdeaDetail = lazy(() => import('@/pages/BusinessIdeaDetail'));
const AiTipsArchive = lazy(() => import('@/pages/AiTipsArchive'));
const AiTipDetail = lazy(() => import('@/pages/AiTipDetail'));
```

Y agregar 6 `<Route>` antes del `path="*"`:

```tsx
<Route path="/archive/agents" element={<RequireAuth><AppShell><AgentItemsArchive /></AppShell></RequireAuth>} />
<Route path="/agent-items/:id" element={<RequireAuth><AppShell><AgentItemDetail /></AppShell></RequireAuth>} />
<Route path="/archive/business-ideas" element={<RequireAuth><AppShell><BusinessIdeasArchive /></AppShell></RequireAuth>} />
<Route path="/business-ideas/:id" element={<RequireAuth><AppShell><BusinessIdeaDetail /></AppShell></RequireAuth>} />
<Route path="/archive/ai-tips" element={<RequireAuth><AppShell><AiTipsArchive /></AppShell></RequireAuth>} />
<Route path="/ai-tips/:id" element={<RequireAuth><AppShell><AiTipDetail /></AppShell></RequireAuth>} />
```

---

## 4. Update del prompt de la rutina remota

La rutina existente tiene `trigger_id: trig_01Mtsnv2oLR5AXgWwBuQiymF` y vive en claude.ai. Hay que actualizar su prompt completo con el siguiente texto.

### Prompt completo nuevo (reemplaza el actual entero)

```
Sos un editor técnico personal. Tu tarea es generar un
briefing diario y escribirlo en Firestore vía REST API.

===========================================
PARTE 1 — GENERAR CONTENIDO
===========================================

IMPORTANTE sobre búsqueda:
- Priorizá WebSearch sobre WebFetch. WebFetch de sitios
  como arxiv.org, huggingface.co, simonwillison.net
  suele devolver 403 por bloqueos anti-bot.
- Usá WebSearch primero para descubrir artículos
  recientes de las fuentes permitidas.
- Solo usá WebFetch en URLs concretas devueltas por
  WebSearch.
- Si una fuente falla repetidamente, seguí con otras.
- Fuentes alternativas: arxiv → alphaxiv.org o
  paperswithcode.com; HuggingFace → RSS feed;
  Hacker News → hn.algolia.com.

Generá el siguiente contenido en español, tono directo
y estructurado, sin preámbulos ni cierres motivacionales.

## News del día (3-5 items)
[mantener idéntico al prompt actual]

## Lectura profunda (1 item)
[mantener idéntico al prompt actual]

## Rust task del día (1 item)
[mantener idéntico al prompt actual]

## Rust reading del día (1 item)
[mantener idéntico al prompt actual]

## Agent items del día (1-2 items)

Whitelist de agentes a seguir (NO salir de esta lista
salvo que pase algo realmente grande con otro):
- Hermes
- nano claw
- openclaw
- Claude Code
- Cursor
- Aider
- Cline
- OpenHands

Tipos posibles:
- news: lanzamiento, benchmark, integración nueva
  (últimas 48h)
- changelog: resumen FUNCIONAL de versión nueva (qué
  cambió + qué significa para alguien usándolo).
  Incluí campo version (ej "v2.1.0").
- pattern: técnica idiomática de uso del agente o su
  tooling. Incluí codeSnippet con código comentado.

Cada item con: agentName (de la whitelist), type, title,
content (markdown), codeSnippet (string o null), version
(string o null), sources (array de URLs).

REGLA: si no hay nada con sustancia en las últimas 48h,
escribí solo 1 pattern educativo. NUNCA fuerces contenido
vacío. Si ni eso aplica, OMITÍ la sección entera y avisalo
en el reporte final.

## Idea de negocio del día (0-1 item)

Una idea de aplicación web ANCLADA en una noticia o evento
real de las últimas 48h (regulación nueva, lanzamiento de
gigante, crisis sectorial, shift cultural). Plausible,
no fantástica.

Devolvé: title (nombre tentativo), worldContext (qué pasó
+ fuente + fecha), problem (a quién le duele y cómo),
solution (qué hace la app concretamente), market (a quién
apuntás y por qué pagaría), sources.

REGLA: si no hay un evento que justifique una idea fuerte,
OMITÍ este día. Mejor saltar que generar ruido. Avisalo
en el reporte.

## Tips de IA del día (1-2 items)

Tips PRÁCTICOS para personas no técnicas sobre cómo usar
herramientas de IA en su vida diaria o trabajo.

Audiencia: alguien que usa ChatGPT/Claude/Gemini para
tareas cotidianas — no programador, no power user.

Categorías permitidas (cerrada, una por tip):
- productividad
- escritura
- estudio
- trabajo
- vida_diaria
- investigacion

Cada tip debe ser:
- ACCIONABLE (algo que se aplica hoy mismo)
- Específico (no "usá IA para X" — sí "cuando le pidas
  X, agregá Y para conseguir Z")
- Demostrable (incluí UN ejemplo concreto de prompt o
  flujo dentro del content en markdown)

NO escribas tips genéricos. Tampoco tips de programación
(eso va en agents/rust).

Devolvé: title, content (markdown con ejemplo), toolName
("ChatGPT" / "Claude" / "Gemini" / "Notion AI" / "general"),
category (uno de la lista cerrada), sources.

REGLA: si no hay un tip realmente útil hoy, escribí solo 1.
Si ni eso, OMITÍ la sección y avisalo en el reporte.

===========================================
PARTE 2 — ESCRIBIR A FIRESTORE
===========================================

Variables disponibles en el environment:
- FIREBASE_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_BOT_EMAIL
- FIREBASE_BOT_PASSWORD

### Paso 1: Autenticarse
[mantener idéntico al prompt actual]

### Paso 2: Calcular fecha
[mantener idéntico al prompt actual]

### Paso 3: Crear documento briefing
[mantener idéntico al prompt actual]

### Paso 4: Crear documento rustTask
[mantener idéntico al prompt actual]

### Paso 5: Crear documento rustReading
[mantener idéntico al prompt actual]

### Paso 6: Crear documentos agentItems (si aplica)

Por cada agent item generado, POST a:
https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/agentItems

Body:
{
  "fields": {
    "date": { "stringValue": "DATE_TODAY" },
    "agentName": { "stringValue": "..." },
    "type": { "stringValue": "news" | "changelog" | "pattern" },
    "title": { "stringValue": "..." },
    "content": { "stringValue": "..." },
    "codeSnippet": { "stringValue": "..." } | { "nullValue": null },
    "version": { "stringValue": "..." } | { "nullValue": null },
    "sources": {
      "arrayValue": { "values": [{ "stringValue": "..." }] }
    },
    "status": { "stringValue": "pending" },
    "readAt": { "nullValue": null },
    "createdAt": { "timestampValue": "ISO8601_NOW" }
  }
}

Si la sección se omitió, saltá este paso.

### Paso 7: Crear documento businessIdea (si aplica)

Si generaste una idea de negocio, POST a:
https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/businessIdeas

Body:
{
  "fields": {
    "date": { "stringValue": "DATE_TODAY" },
    "title": { "stringValue": "..." },
    "worldContext": { "stringValue": "..." },
    "problem": { "stringValue": "..." },
    "solution": { "stringValue": "..." },
    "market": { "stringValue": "..." },
    "sources": {
      "arrayValue": { "values": [{ "stringValue": "..." }] }
    },
    "createdAt": { "timestampValue": "ISO8601_NOW" }
  }
}

Si se omitió, saltá este paso.

### Paso 8: Crear documentos aiTips (si aplica)

Por cada AI tip generado, POST a:
https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/aiTips

Body:
{
  "fields": {
    "date": { "stringValue": "DATE_TODAY" },
    "title": { "stringValue": "..." },
    "content": { "stringValue": "..." },
    "toolName": { "stringValue": "..." },
    "category": { "stringValue": "productividad" | "escritura" | "estudio" | "trabajo" | "vida_diaria" | "investigacion" },
    "sources": {
      "arrayValue": { "values": [{ "stringValue": "..." }] }
    },
    "status": { "stringValue": "pending" },
    "readAt": { "nullValue": null },
    "createdAt": { "timestampValue": "ISO8601_NOW" }
  }
}

Si la sección se omitió, saltá este paso.

### Paso 9: Reportar
Al terminar, imprimí un resumen con:
- Fecha procesada
- Cantidad de news escritas
- Título del task de Rust
- Título del reading de Rust
- Agent items: cantidad escrita o "omitido (motivo)"
- Business idea: título o "omitida (motivo)"
- AI tips: cantidad escrita o "omitido (motivo)"
- Status de cada request (OK / error)
```

> El texto entre corchetes `[mantener idéntico al prompt actual]` significa que esa sub-sección no cambia respecto del prompt vigente. Sonnet, antes de hacer el update, leé el prompt completo via `RemoteTrigger get` con `trigger_id: trig_01Mtsnv2oLR5AXgWwBuQiymF`, copiá las secciones marcadas como "idéntico" tal cual, y reemplazá las nuevas/modificadas.

### Cómo aplicar el update

```
Tool: RemoteTrigger
Action: update
trigger_id: trig_01Mtsnv2oLR5AXgWwBuQiymF
Body:
{
  "job_config": {
    "ccr": {
      "events": [{
        "data": {
          "uuid": "<generar UUID v4 nuevo en lowercase>",
          "session_id": "",
          "type": "user",
          "parent_tool_use_id": null,
          "message": {
            "content": "<PROMPT COMPLETO NUEVO>",
            "role": "user"
          }
        }
      }]
    }
  }
}
```

> Cargar primero el schema con `ToolSearch select:RemoteTrigger`. Generar UUID v4 vía `python3 -c "import uuid; print(uuid.uuid4())"`.

---

## 5. Validación final

Después de implementar todo, verificar:

- [ ] `tsc -b` sin errores
- [ ] `vite build` sin errores
- [ ] `npm run dev`, navegar a `/`:
  - [ ] Las 4 secciones full-width aparecen en el orden: BusinessIdeas → AiTips → Agents → Rust Readings
  - [ ] Si no hay datos en una colección, muestra el empty state correcto
- [ ] Navegar a cada archivo:
  - [ ] `/archive/agents` con 3 filtros funcionando
  - [ ] `/archive/ai-tips` con 3 filtros funcionando
  - [ ] `/archive/business-ideas` solo con orden
- [ ] Detalles funcionan con un id real (cuando haya datos)
- [ ] Toggle status optimista en agentItems y aiTips, sin toggle en business
- [ ] Reglas Firestore deployadas (`firebase deploy --only firestore:rules`)
- [ ] Prompt de la rutina actualizado en claude.ai
- [ ] Run manual de la rutina (`RemoteTrigger run`) y verificar que escribe a las 6 colecciones

---

## 6. Notas / gotchas

- **No tocar `briefings/`, `rustTasks/`, `rustReadings/`** ni sus tipos: son colecciones existentes.
- El `agentName` es **string libre** en el modelo; la whitelist está en el prompt de la rutina (no se valida en frontend).
- El `category` de AiTip **sí es enum cerrado** (`AiTipCategory`). Validar en el filtro del archive y en el badge.
- `codeSnippet` y `version` en AgentItem son nullable. Cuando son `null`, no renderizar el bloque.
- BusinessIdea **NO tiene** `status` ni `readAt`. Las reglas Firestore deniegan write completo, no solo create/delete.
- `whitespace-pre-line` en el detalle de BusinessIdea para preservar saltos de línea simples sin parser de markdown.
- Mantener consistencia de capitalización en breadcrumbs y títulos: "Agent Items", "AI Tips", "Ideas de negocio".
- No agregar tracking, analytics ni features fuera de las listadas (regla de CLAUDE.md sección 18).
- Comentarios en código solo si explican el "por qué" no obvio.
- Verificar que todos los nuevos `<Link>` y `<RouterLink>` tengan `transition-colors` y estados hover consistentes con el resto de la app.

---

## 7. Estimado de tiempo

- Tipos + queries + hooks + badges: 30 min
- Componentes home (3 nuevos × 2 archivos = 6): 30 min
- Cards de archivo (3 nuevos): 15 min
- Páginas de archivo (3 nuevas): 30 min
- Páginas de detalle (3 nuevas): 30 min
- Update Home + App.tsx: 10 min
- Reglas Firestore + deploy: 5 min
- Update prompt rutina: 10 min

**Total: ~2.5h** de implementación.
