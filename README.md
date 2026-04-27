# Personal Dev Stash

Frontend de la app personal de briefing diario. Ver `CLAUDE.md` para la especificación completa.

## Setup

```bash
npm install
cp .env.example .env.local   # completar con credenciales reales de Firebase
npm run dev
```

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción a `dist/`
- `npm run preview` — preview del build
- `npm run deploy` — build + `firebase deploy --only hosting`
- `npm run lint` — type check

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind + Firebase Web SDK + TanStack Query + React Router v6.
