# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Type-check + production build (runs in parallel)
pnpm build-only   # Build without type checking
pnpm type-check   # Incremental type check via vue-tsc
pnpm lint         # Run oxlint then eslint (both with --fix)
pnpm format       # Format with Prettier
pnpm preview      # Preview production build locally
```

Requires Node `^20.19.0 || >=22.12.0` and `pnpm` as the package manager.

## Architecture

Vue 3 + TypeScript retailers frontend. Currently in early development — routing and state scaffolding are in place but most business logic is yet to be built.

**Key tech:**
- **Vue 3** with Composition API (`<script setup>` SFCs)
- **Vite 8** with `@vitejs/plugin-vue`
- **Vue Router 5** — HTML5 history mode, `BASE_URL` from `import.meta.env`
- **Pinia 3** — Composition API store style (see `src/stores/counter.ts` as reference)
- **Tailwind CSS v4** — imported via `@import 'tailwindcss'` in `src/assets/main.css`; configured via the Vite plugin (not a `tailwind.config.js`)
- **Zod 4** — available for schema validation
- **@heroicons/vue** — available for icons

**Path alias:** `@/*` → `src/*`

**TypeScript:** Strict mode with `noUncheckedIndexedAccess: true`. Incremental build artifacts go to `.tmp/`.

## Linting

Two linters run sequentially in `pnpm lint`:
1. **oxlint** — fast, handles correctness rules (eslint, typescript, unicorn, oxc, vue plugins)
2. **eslint** — flat config (`eslint.config.ts`), handles Vue TS rules; Prettier integration via `eslint-config-prettier` (Prettier runs separately)

`.prettierrc.json` settings: no semicolons, single quotes, 100-char line width.

## Conventions

- All stores live in `src/stores/` and use the Composition API `defineStore` signature
- Lazy-load route components for non-home views (see `/about` route as example)
- No backend integration exists yet — add HTTP calls in a `src/services/` layer when needed
