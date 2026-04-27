# Personal Dev Stash

Frontend de una app personal que muestra un briefing diario técnico (news de IA/programación, lecturas profundas, y material de Rust) generado automáticamente por una rutina de Claude Code que escribe a Firestore cada mañana.

Este documento es la fuente de verdad para cualquier agente trabajando en el repo. Leelo entero antes de escribir código.

---

## 1. Contexto y responsabilidades

- La app es **solo lectura + marcado de estado**. No genera contenido, solo lo consume.
- El contenido lo genera una rutina externa que escribe a 3 colecciones de Firestore (`briefings`, `rustTasks`, `rustReadings`).
- El usuario es **uno solo** (el dueño). Hay auth con Firebase Auth, email/password.
- La app corre como SPA estática (Vite + React), hosteada en Firebase Hosting.
- **No hay backend propio.** El cliente lee Firestore con el Web SDK y las Security Rules del proyecto controlan permisos.

---

## 2. Stack técnico

**Obligatorio:**

- **Vite** (última estable) como bundler y dev server
- **React 18+** con **TypeScript** (strict mode)
- **React Router v6** para routing client-side
- **Tailwind CSS** para estilos (config con design tokens custom, ver sección 7)
- **Firebase Web SDK v10+** (modular): `firebase/app`, `firebase/auth`, `firebase/firestore`
- **TanStack Query (React Query) v5** para fetching, caching y mutations contra Firestore

**Tipografía (Google Fonts, libres):**

- **Fraunces** — display/headers
- **Inter** — body/UI
- **Source Serif 4** — lectura larga (contenido de rust readings, contenido de tasks)
- **JetBrains Mono** — code, fechas, elementos técnicos

**Iconos:**

- **lucide-react**

**Prohibido sin discutirlo primero:**

- Redux, Zustand, MobX (usar React Query + hooks locales)
- Bibliotecas de UI como shadcn, MUI, Chakra (construir componentes propios)
- SSR/Next.js (esto es SPA pura)
- CSS-in-JS (solo Tailwind)

---

## 3. Estructura de carpetas

```
/
├── CLAUDE.md                    (este archivo)
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.local                   (NO commit — Firebase config)
├── .env.example                 (commit — template)
├── firebase.json
├── .firebaserc
├── firestore.rules              (ya existe, no modificar desde acá)
├── firestore.indexes.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                (Tailwind directives + base styles)
    ├── lib/
    │   ├── firebase.ts          (init app, auth, db)
    │   ├── queries.ts           (React Query hooks)
    │   └── dates.ts             (formateo fechas, zona Santiago)
    ├── types/
    │   └── firestore.ts         (types de las 3 colecciones)
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useTheme.ts          (dark/light)
    │   └── useToggleStatus.ts   (marcar leído/pendiente)
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── Header.tsx
    │   │   └── ThemeToggle.tsx
    │   ├── news/
    │   │   ├── NewsCarousel.tsx
    │   │   └── NewsCard.tsx
    │   ├── rust/
    │   │   ├── RustTasksAside.tsx
    │   │   ├── RustTaskItem.tsx
    │   │   ├── RustReadingsList.tsx
    │   │   └── RustReadingItem.tsx
    │   ├── archive/
    │   │   ├── ArchiveGrid.tsx
    │   │   ├── ArchiveCard.tsx
    │   │   └── ArchiveFilters.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── StatusBadge.tsx
    │       ├── MonoLabel.tsx
    │       └── Link.tsx
    └── pages/
        ├── Home.tsx
        ├── Login.tsx
        ├── NewsArchive.tsx
        ├── RustTasksArchive.tsx
        ├── RustReadingsArchive.tsx
        ├── RustTaskDetail.tsx
        └── RustReadingDetail.tsx
```

---

## 4. Modelo de datos (Firestore)

**IMPORTANTE:** Los documentos ya existen con esta shape exacta porque los escribe la rutina. No modificar los nombres de campos ni estructura.

### Colección `briefings/{YYYY-MM-DD}`

```typescript
type NewsItem = {
  imageUrl: string;
  title: string;
  summary: string;
  source: string;
  url: string;
};

type DeepRead = {
  title: string;
  author: string;
  url: string;
  readingTime: string;
  summary: string;
};

type Briefing = {
  date: string;                  // "2026-04-22"
  news: NewsItem[];
  deepRead: DeepRead;
  generatedAt: Timestamp;
};
```

### Colección `rustTasks/{autoId}`

```typescript
type RustTaskFormatType =
  | "patron"
  | "teoria"
  | "aplicacion_real"
  | "caso_real"
  | "ecosistema";

type RustTask = {
  date: string;                  // "2026-04-22"
  formatType: RustTaskFormatType;
  title: string;
  content: string;               // markdown
  codeSnippet: string | null;
  sources: string[];
  status: "pending" | "read";
  readAt: Timestamp | null;
  createdAt: Timestamp;
};
```

### Colección `rustReadings/{autoId}`

```typescript
type RustReading = {
  date: string;                  // "2026-04-22"
  title: string;
  content: string;               // markdown
  sources: string[];
  status: "pending" | "read";
  readAt: Timestamp | null;
  createdAt: Timestamp;
};
```

### Permisos (ya configurados en Firestore Rules)

- El user autenticado (único) puede **leer** todo.
- El user solo puede **update** los campos `status` y `readAt` en `rustTasks` y `rustReadings`.
- El user **no puede crear ni borrar** nada (eso es rol del bot).

---

## 5. Rutas y páginas

| Ruta                         | Componente              | Descripción |
| ---------------------------- | ----------------------- | ----------- |
| `/login`                     | `Login`                 | Email + password (Firebase Auth). Si ya autenticado, redirigir a `/`. |
| `/`                          | `Home`                  | Carousel de news del día + aside de rust tasks + sección de rust readings. |
| `/archive/news`              | `NewsArchive`           | Galería histórica de news (agrupadas por mes). |
| `/archive/rust-tasks`        | `RustTasksArchive`      | Galería histórica de rust tasks, filtrable por status y formatType. |
| `/archive/rust-readings`     | `RustReadingsArchive`   | Galería histórica de rust readings, filtrable por status. |
| `/rust-tasks/:id`            | `RustTaskDetail`        | Vista completa de un rust task (markdown renderizado + código). |
| `/rust-readings/:id`         | `RustReadingDetail`     | Vista completa de un rust reading. |

Todas las rutas excepto `/login` requieren autenticación. Implementar un `<RequireAuth>` wrapper.

---

## 6. Pantallas — especificación detallada

### 6.1 Login (`/login`)

- Una sola card centrada en viewport.
- Inputs: email, password.
- Botón "Entrar".
- Errores inline debajo del form.
- Sin "registro" ni "recuperar password" (es app unipersonal).
- Al autenticar exitoso, `navigate('/')`.

### 6.2 Home (`/`)

Layout de 2 columnas en desktop (carousel + aside), stack vertical en mobile.

**Header (toda la app):**
- Izquierda: título "Personal Dev Stash" en Fraunces.
- Derecha: fecha actual en mono (`Mié · 22 Abr 2026`) + `ThemeToggle` + avatar/logout.

**Columna principal — Carousel de news:**
- Muestra las news del briefing del **día más reciente disponible** (no necesariamente hoy).
- Si no hay briefing para hoy (la rutina aún no corrió), mostrar el del día anterior.
- Cada slide tiene:
  - Imagen grande (16:9, `rounded-2xl`, object-cover).
  - Fuente + tiempo estimado en mono pequeño arriba (`Anthropic · 3 min`).
  - Título en Fraunces 28-32px, peso 500.
  - Bajada (`summary`) en body, 2 líneas max con ellipsis.
  - Link "Leer artículo →" que abre `url` en nueva pestaña.
- Paginación: flechas en los laterales (desktop) + indicador `01 / 05` en mono abajo centro.
- Soporte swipe en mobile.
- **Debajo del carousel, a la derecha:** link "→ Ver todas las news" que navega a `/archive/news`.

**Aside derecho — Rust Tasks:**
- Título: "Rust Tasks" en Fraunces medium.
- Lista vertical de los últimos 7 días (incluyendo hoy).
- Cada item:
  - Círculo `○` (pending) o `●` (read) a la izquierda — clickeable.
  - Fecha corta (`22 abr`) en mono.
  - Título truncado.
  - Al click en el texto del item, navega a `/rust-tasks/:id`.
  - Al click en el círculo, toggle de status (optimistic update con React Query).
- Al final: link "→ Ver todas" que navega a `/archive/rust-tasks`.

**Sección inferior — Lecturas de Rust:**
- Separador sutil + título "Lecturas de Rust" en Fraunces.
- Lista de los últimos 7 días.
- Cada item similar a rust tasks pero full-width (no aside).
- Al final: link "→ Histórico completo" que navega a `/archive/rust-readings`.

### 6.3 Galerías de archivo

Las 3 galerías (`/archive/news`, `/archive/rust-tasks`, `/archive/rust-readings`) comparten patrón visual pero cada una tiene particularidades.

**Patrón común:**
- Header con breadcrumb: `Inicio / Archivo / [News | Rust Tasks | Rust Readings]`
- Título grande en Fraunces.
- Barra de filtros sticky debajo del header.
- Grid responsive: 3 cols desktop, 2 tablet, 1 mobile. Gap de 24px.
- Agrupación por mes con header (`Abril 2026`) antes de cada grupo.
- Orden default: más reciente primero. Toggle para invertir.
- Estado vacío: mensaje amable cuando no hay resultados (ej: "No hay tasks leídas aún").

**`/archive/news` — particularidades:**
- Cada card muestra imagen, fuente, título, bajada, fecha.
- No hay filtro de status (las news no tienen estado).
- Al click en la card, abre `url` externo en nueva pestaña.
- Las news vienen como array dentro de cada `briefing`. Para la galería, hay que **flatten** todos los briefings en una lista plana de news, cada una asociada a su fecha del briefing.

**`/archive/rust-tasks` — particularidades:**
- Filtro por **status**: Todas / Pendientes / Leídas.
- Filtro por **formatType**: Todas / Patrón / Teoría / Aplicación real / Caso real / Ecosistema.
- Los filtros se combinan (AND).
- Cada card muestra: fecha, badge de formatType (color sutil según tipo), título, preview del content (primeras líneas del markdown), badge de status.
- Click en card → navega a `/rust-tasks/:id`.
- Click en el círculo de status → toggle optimista.

**`/archive/rust-readings` — particularidades:**
- Filtro por **status**: Todas / Pendientes / Leídas.
- Cards similares a rust-tasks pero sin badge de formatType.
- Click en card → `/rust-readings/:id`.

### 6.4 Páginas de detalle

**`/rust-tasks/:id` y `/rust-readings/:id`:**
- Layout centrado, max-width 720px (óptimo de lectura).
- Breadcrumb arriba.
- Header del artículo: fecha, formatType (si aplica), título en Fraunces grande, botón de toggle status prominente.
- Content renderizado como markdown:
  - Usar `react-markdown` + `remark-gfm` para soporte de GFM.
  - Para `codeSnippet` en rust tasks, mostrar en un bloque aparte debajo del content con syntax highlighting (`react-syntax-highlighter` con Prism, tema que matchee dark/light).
- Al final, sección "Fuentes" con lista de URLs clickeables.
- Body del artículo en **Source Serif 4** (lectura larga), no Inter.

---

## 7. Design tokens

Configurar Tailwind con tokens custom que soporten dark/light mode vía `dark:` variants.

### 7.1 Paleta

```js
// tailwind.config.ts — extend.colors
{
  bg: {
    base:    'rgb(var(--bg-base) / <alpha-value>)',
    surface: 'rgb(var(--bg-surface) / <alpha-value>)',
    alt:     'rgb(var(--bg-alt) / <alpha-value>)',
  },
  border: {
    DEFAULT: 'rgb(var(--border) / <alpha-value>)',
    strong:  'rgb(var(--border-strong) / <alpha-value>)',
  },
  text: {
    primary:   'rgb(var(--text-primary) / <alpha-value>)',
    secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
    muted:     'rgb(var(--text-muted) / <alpha-value>)',
  },
  accent: {
    primary: 'rgb(var(--accent-primary) / <alpha-value>)', // Claude orange
    rust:    'rgb(var(--accent-rust) / <alpha-value>)',    // Rust orange
    link:    'rgb(var(--accent-link) / <alpha-value>)',
  },
  status: {
    read:    'rgb(var(--status-read) / <alpha-value>)',
    pending: 'rgb(var(--status-pending) / <alpha-value>)',
  },
}
```

### 7.2 Variables CSS (en `index.css`)

```css
:root {
  /* Light mode — default */
  --bg-base: 245 244 238;          /* #F5F4EE warm off-white */
  --bg-surface: 255 255 255;
  --bg-alt: 239 237 228;
  --border: 227 223 206;
  --border-strong: 210 205 188;
  --text-primary: 31 30 27;
  --text-secondary: 92 90 82;
  --text-muted: 139 136 120;
  --accent-primary: 204 120 92;    /* Claude orange */
  --accent-rust: 160 82 45;
  --accent-link: 62 95 138;
  --status-read: 107 142 90;
  --status-pending: 139 136 120;
}

.dark {
  --bg-base: 20 19 17;             /* dark warm neutral */
  --bg-surface: 28 27 25;
  --bg-alt: 37 35 32;
  --border: 52 49 44;
  --border-strong: 74 70 63;
  --text-primary: 232 228 218;
  --text-secondary: 170 165 152;
  --text-muted: 118 113 102;
  --accent-primary: 217 136 105;   /* un poco más claro en dark */
  --accent-rust: 184 107 68;
  --accent-link: 122 162 215;
  --status-read: 131 163 112;
  --status-pending: 139 136 120;
}
```

### 7.3 Tipografías

```js
// tailwind.config.ts — extend.fontFamily
{
  display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
  sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  serif:   ['"Source Serif 4"', 'ui-serif', 'Georgia', 'serif'],
  mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

Cargar en `index.html` con `<link>` desde Google Fonts (preconnect + display=swap).

### 7.4 Radios, espaciado, sombras

- **Radios:** usar por default `rounded-2xl` (16px) para cards y media, `rounded-xl` (12px) para botones e inputs, `rounded-full` para badges circulares de status.
- **Espaciado:** generoso. Padding de cards: 24-32px. Gap entre secciones: 48-64px.
- **Sombras:** casi inexistentes. Usar bordes sutiles en lugar de shadows. Solo en hover de cards: `shadow-sm` con transición suave.
- **Transiciones:** `transition-colors duration-200 ease-out` como default.

### 7.5 Colores por formatType de Rust Tasks

Badges con colores sutiles (bg pastel + texto oscuro en light, inverso en dark):

- `patron` → azul suave
- `teoria` → púrpura suave
- `aplicacion_real` → verde oliva
- `caso_real` → ámbar
- `ecosistema` → cian

---

## 8. Dark / Light mode

**Requisito crítico: mínima fricción.**

- Por default: **light mode**.
- El toggle está **visible en el header del home**, siempre accesible (no escondido en un menú).
- Implementación: ícono sol/luna (lucide `Sun` / `Moon`), un solo click alterna.
- Persistir preferencia en `localStorage` con key `dev-stash-theme`.
- Al cargar la app, leer localStorage → aplicar clase `dark` al `<html>` antes del primer paint (script inline en `index.html` para evitar flash).
- No hay opción "system" para simplificar. Si el usuario quiere system, puede cambiar el OS y hacer toggle manual. Mantenelo simple.

**Snippet del script inline en `index.html` (antes de cargar el bundle):**

```html
<script>
  (function() {
    const stored = localStorage.getItem('dev-stash-theme');
    if (stored === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
```

**Hook `useTheme`:**

```typescript
// retorna { theme: 'light' | 'dark', toggle: () => void }
// usa useState inicializado desde DOM actual (documentElement.classList)
// toggle: agrega/quita clase, actualiza state, guarda en localStorage
```

---

## 9. Auth

- Página `/login` con email + password.
- Wrapper `<RequireAuth>` que redirige a `/login` si no hay user.
- Hook `useAuth` que expone `{ user, loading, signIn, signOut }`.
- `onAuthStateChanged` manejado en un provider en la raíz (`AuthProvider`).
- Mientras `loading`, mostrar un loader minimal (no el contenido real).
- Botón de logout en el header, dropdown del avatar.

---

## 10. Fetching — React Query patterns

Toda lectura y escritura a Firestore pasa por React Query. Nunca llamar Firestore desde un componente directamente.

**Archivo `lib/queries.ts`** centraliza todos los hooks:

```typescript
// Briefing del día (el más reciente disponible)
useLatestBriefing()

// Briefing específico por fecha
useBriefing(date: string)

// Todos los briefings (para galería de news)
useAllBriefings()

// Últimos N rust tasks (para aside del home)
useRecentRustTasks(limit: number = 7)

// Rust task por id
useRustTask(id: string)

// Todos los rust tasks (para galería)
useAllRustTasks()

// Análogos para rust readings
useRecentRustReadings(limit: number = 7)
useRustReading(id: string)
useAllRustReadings()

// Mutations
useToggleTaskStatus()       // toma { id, newStatus } → update Firestore
useToggleReadingStatus()    // idem
```

**Reglas:**

- `staleTime: 1000 * 60 * 5` (5 min) para queries de listas.
- `staleTime: Infinity` para queries de detalle (no cambian una vez leídas).
- En mutations de toggle status, hacer **optimistic update** — el círculo cambia instantáneamente, rollback si falla.
- Después de mutation exitosa, invalidar las queries relevantes (lista del aside, galería).

---

## 11. Formateo de fechas

Todas las fechas se guardan como string ISO (`YYYY-MM-DD`) o Timestamp. Formateo para UI:

**Archivo `lib/dates.ts`:**

```typescript
// Usa Intl.DateTimeFormat, no date-fns ni moment.
// Zona horaria: America/Santiago.
// Locale: 'es-CL'.

formatDateShort(d)    // "22 abr"
formatDateLong(d)     // "Miércoles 22 de abril de 2026"
formatDateHeader(d)   // "Mié · 22 Abr 2026"
formatDateMono(d)     // "22.04.2026"  ← usar en elementos mono
formatMonthHeader(d)  // "Abril 2026"   ← headers de agrupación
```

Primera letra de mes en minúscula en short (`22 abr`), mayúscula en long y mono.

---

## 12. Comportamientos e interacciones

### Toggle status (pendiente → leído y vice versa)

- Click en el círculo `○` / `●`.
- Optimistic: el círculo cambia inmediatamente.
- Si pasa de pending → read: set `status: 'read'`, `readAt: serverTimestamp()`.
- Si pasa de read → pending: set `status: 'pending'`, `readAt: null`.
- Animación: scale 0.9 en mousedown, 1.1 bounce al cambiar, 200ms.
- Si falla la mutation: rollback + toast de error (sin toast lib pesada, algo custom simple).

### Carousel

- Auto-play **desactivado** (el usuario navega a su ritmo).
- Flechas izq/der en los laterales del slide (aparecen en hover desktop, siempre visibles mobile).
- Swipe horizontal en mobile.
- Keyboard: ←/→ cambia slides cuando el carousel tiene focus.
- Loop: al llegar al último, el "siguiente" vuelve al primero.

### Breadcrumbs

Siempre visibles en galerías y detalle. En mono, con separador ` / ` entre segmentos. Cada segmento es un link excepto el último (actual).

### Estados vacíos

- Home sin briefing aún: mensaje "El briefing de hoy se está preparando" con ícono discreto.
- Archive sin resultados: "No hay items que coincidan con estos filtros."
- Detalle no encontrado: 404 amable con link al home.

### Loading

- Queries en vuelo: skeletons con mismo layout que el contenido final, pulse sutil.
- Auth en vuelo al cargar: pantalla completa con logo centrado (sin texto "loading").

---

## 13. Accesibilidad (mínimos no negociables)

- Todos los elementos interactivos con `aria-label` cuando el label no es texto.
- Focus visible en todos los clickeables (`focus-visible:ring-2`).
- Contraste mínimo AA en ambos modos.
- `<button>` para acciones, `<a>` para navegación (nunca al revés).
- Carousel con controles accesibles por teclado y `aria-live` para anunciar cambio de slide.
- Toggle de status con `role="checkbox"` y `aria-checked`.

---

## 14. Firebase — configuración

### 14.1 Variables de entorno (`.env.local`)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=dev-stash-f308c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dev-stash-f308c
VITE_FIREBASE_STORAGE_BUCKET=dev-stash-f308c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=525201249954
VITE_FIREBASE_APP_ID=1:525201249954:web:9ae7995fbf0565225669fb
```

Committear `.env.example` con placeholders. `.env.local` al `.gitignore`.

### 14.2 Init en `lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 14.3 Hosting

`firebase.json` ya configurado con `web/dist` como public dir y rewrites SPA. El build va ahí con `vite build`.

---

## 15. Build & deploy

**Scripts de `package.json`:**

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "deploy": "npm run build && firebase deploy --only hosting"
}
```

**Deploy solo de hosting** (las rules se manejan aparte):

```bash
npm run deploy
```

---

## 16. Convenciones de código

- **TypeScript strict.** Sin `any` excepto casos justificados con comentario.
- **Imports absolutos** vía alias `@/` configurado en `tsconfig.json` y `vite.config.ts`.
- **Componentes** en PascalCase, un componente por archivo, export default.
- **Hooks** con prefijo `use`, camelCase.
- **Archivos** en kebab-case para no-componentes (`firestore-queries.ts`), PascalCase para componentes (`NewsCarousel.tsx`).
- **Tailwind**: evitar `@apply` salvo en casos muy repetidos, preferir clases inline. Orden de clases: layout → spacing → typography → colors → borders → misc. Usar `clsx` para clases condicionales.
- **No comentarios obvios.** Comentar solo el "por qué", no el "qué".
- **Idioma:** UI en español (el usuario es hispanohablante), código y comentarios en inglés.

---

## 17. Orden de implementación sugerido

Si vas a construir desde cero, seguí este orden:

1. Setup: Vite + React + TS + Tailwind + Firebase + React Query + Router.
2. Design tokens + tipografías + variables CSS dark/light.
3. `lib/firebase.ts`, tipos de Firestore, `lib/dates.ts`.
4. `AuthProvider`, `useAuth`, página `/login`, `<RequireAuth>`.
5. `useTheme` + `ThemeToggle` + layout `AppShell` con Header.
6. Todos los hooks de React Query en `lib/queries.ts`.
7. Componentes base en `components/ui/`.
8. Home: carousel, aside de tasks, sección de readings.
9. Toggle de status con mutations optimistas.
10. Páginas de archivo (las 3) con filtros.
11. Páginas de detalle con markdown rendering.
12. Estados vacíos y loading skeletons.
13. Accesibilidad pass.
14. Deploy a Firebase Hosting.

---

## 18. Qué NO hacer

- No agregar tracking/analytics (Google Analytics, PostHog, etc.) sin discutirlo.
- No agregar features fuera de lo listado (comentarios, compartir, export, etc.) sin discutirlo.
- No cambiar el modelo de datos de Firestore — la rutina lo escribe con esa shape.
- No generar contenido desde el frontend — es solo lectura + toggle de status.
- No acoplar componentes a rutas específicas — hacerlos reutilizables.
- No optimizar prematuramente — esta app tiene 1 usuario, performance no es el cuello.
