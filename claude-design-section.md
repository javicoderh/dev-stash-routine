# Sección Claude Design — borrador conversacional

> Doc en estado **propuesta**, no listo para implementar. Pendiente cerrar 4 decisiones antes de pasar al plan formal.

---

## Contexto

[Claude Design](https://claude.ai/design) es un producto de Anthropic Labs lanzado el 17 abril 2026. Genera diseños, prototipos, slides y one-pagers desde prompts. Integra con design systems leyendo codebases y archivos de diseño, y hace handoff directo a Claude Code para implementación.

- Powered by Claude Opus 4.7
- Acceso vía ícono de paleta en sidebar de claude.ai o `claude.ai/design` directo
- Disponible en Pro, Max, Team, Enterprise (research preview)
- Inputs: texto, imágenes, DOCX/PPTX/XLSX, URLs scrapeables, codebase
- Exports: Canva, PDF, PPTX, HTML standalone
- Sharing: privado / org view / org edit + chat grupal con Claude

---

## Decisión arquitectónica tomada

**Ruta estática hardcodeada**, sin Firestore, sin rutina, sin queries.

A diferencia de las otras secciones del plan-extensiones (que son time-anchored y se generan diarias), esta es un catálogo/tutorial fijo. El contenido vive en TypeScript en el repo.

```
src/pages/ClaudeDesign.tsx
src/data/claude-design-sections.ts
src/components/claude-design/
  ├── SectionBlock.tsx
  └── SidebarNav.tsx     ← scroll-spy
```

**Ruta**: `/claude-design`

---

## Estructura de contenido propuesta

Layout: sidebar sticky + 9 secciones scrolleables con scroll-spy.

| # | Sección | Tono / contenido |
|---|---|---|
| 1 | Qué es Claude Design | Intro: para qué sirve, qué la diferencia (Opus 4.7 + integración codebase) |
| 2 | Cómo entrar | Ícono paleta en sidebar de claude.ai, `claude.ai/design`, requiere Pro/Max/Team/Enterprise |
| 3 | Tu primer diseño | Walkthrough: prompt → primera versión → iterar |
| 4 | Inputs aceptados | Lista con ejemplo: texto, imágenes, DOCX/PPTX/XLSX, URL, codebase |
| 5 | Refinar el diseño | Comentarios inline, edición directa de texto, adjustment knobs (spacing/color/layout) |
| 6 | Aplicar cambios al diseño completo | Patrón: cambio puntual → propagar al diseño entero |
| 7 | Design System | Aprovechar lectura de codebase + design files |
| 8 | Compartir y colaborar | 3 niveles de sharing + chat grupal |
| 9 | Exportar y handoff a Claude Code | Canva/PDF/PPTX/HTML + handoff bundle |

Estructura interna por sección:

```
Título
├── Intro (1-2 párrafos)
├── Cuándo usarlo
├── Cómo hacerlo (steps numerados)
└── Ejemplo concreto / tip
```

---

## Modelo de datos (hardcoded TS)

```typescript
type ClaudeDesignSection = {
  slug: string;             // "que-es", "como-entrar", ...
  title: string;
  intro: string;            // 1-2 párrafos
  whenToUse?: string;
  steps: { title: string; body: string }[];
  example?: string;
  docsUrl?: string;
};
```

---

## Decisiones pendientes (responder antes de armar plan formal)

1. **Contenido extra**: ¿agregar limitaciones conocidas, comparativa con Figma/Canva, mejores prácticas de prompting para diseño? ¿Algo más?
2. **Tono**: muy didáctico (cero conocimiento) o intermedio (asume que ya usás Claude.ai)?
3. **Idioma**: español como el resto de la app, o inglés porque los nombres de features son en inglés?
4. **Acceso desde el menú**: link permanente en el header, card destacada en el home, o solo por URL?

---

## Próximos pasos

1. Responder las 4 decisiones de arriba
2. Una vez cerradas, **escribir el plan formal** dentro de `plan-extensiones.md` (sección nueva al final) o como archivo aparte
3. Sonnet implementa esta sección junto con las demás extensiones en una sola corrida

---

## Referencias

- [Anthropic launches Claude Design — TechCrunch](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/)
- [Anthropic just launched Claude Design — VentureBeat](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)
- [Introducing Claude Design — Anthropic news](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [Get started with Claude Design — Claude Help Center](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)
- [Claude Design: Complete Guide for Non-Designers — BuildFastWithAI](https://www.buildfastwithai.com/blogs/claude-design-anthropic-guide-2026)
- [Claude Design: The Complete 2026 Guide — Agence Scroll](https://agence-scroll.com/en/blog/claude-design-anthropic-2026-guide)
- [Claude Design Beats Every AI Design Tool — Medium](https://medium.com/design-bootcamp/claude-design-beats-every-ai-design-tool-c8d43275bebd)
- [Anthropic Labs Launches Claude Design Tool — CMSWire](https://www.cmswire.com/digital-marketing/anthropic-labs-launches-claude-design-tool-for-visual-prototyping/)
- [Claude Design: Starter Guide and Examples — Substack](https://claudiaplusai.substack.com/p/claude-design-starter-guide-and-examples)
