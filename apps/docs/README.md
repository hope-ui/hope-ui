# @hope-ui/docs

The hope-ui documentation site: **TanStack Start (Solid) + Solid 2.0 + file-based routing + MDX**,
prerendered to **pure static HTML** (SSG) and served from static hosting. It is a first-class
monorepo app under `apps/docs/` (a pnpm workspace member), not a `packages/*` library.

## Commands

```bash
pnpm dev:docs                         # dev server on :3000 (consumes @hope-ui/* from source)
pnpm --filter @hope-ui/docs build     # prerender to apps/docs/dist/client + tsc --noEmit
pnpm --filter @hope-ui/docs preview   # preview the production build

# From the repo root, build the library first (via ^build), then the docs:
pnpm build --filter=@hope-ui/docs...
```

## How `@hope-ui/*` is consumed

- **`build`** resolves `@hope-ui/*` to the published `dist/*.jsx` via the `"solid"` export
  condition — exactly what a real consumer installs.
- **`dev`** aliases `@hope-ui/*` to `packages/*/src` (the shared `hopeUiAlias` from the repo-root
  `vitest-aliases.ts`, plus a `@hope-ui/components/*` wildcard), so the library hot-reloads from
  source while you iterate. Applied only when `command === "serve"`.

## Config notes

1. **MDX before vite-plugin-solid, with a Solid provider.** `mdx({ jsx: true, providerImportSource:
   "~/mdx-components" })` runs `enforce: "pre"`, emitting JSX for `vite-plugin-solid` to compile with
   the real Solid compiler. `src/mdx-components.tsx` supplies real Solid components for intrinsic
   tags via `<Dynamic>`, since MDX's string defaults (`h1: "h1"`) render empty under Solid.
2. **Full prerender, no `spa` block.** `tanstackStart({ prerender: { … } })` SSRs every route into
   static HTML so the prose is present in the markup (SEO-complete), rather than a client-only shell.
3. **The library ships JSX source**, so `ssr.noExternal: [/^@hope-ui\//]` (Node can't import raw
   `.jsx`) and `optimizeDeps.exclude` the `@hope-ui/*` packages (esbuild would otherwise prebundle
   the JSX as React) — both let the source flow through `vite-plugin-solid`.
4. **`ThemeProvider` directly wraps `<Outlet/>`** in `RootComponent` (`src/routes/__root.tsx`).
   Solid context follows the owner graph, not the DOM tree; placing the provider in a layout that
   receives `Outlet` as `children` would leave routed components unable to see the theme.
5. **Explicit `~` alias.** Vite's native `tsconfigPaths` rewrites `~/…` only for TS/JS importers,
   not for imports originating inside a `.mdx` file, so `resolve.alias` carries an explicit entry.

## Deploy (static hosting)

Pure SSG → static hosting (no Worker/server).

- **Build command:** `pnpm install && pnpm build --filter=@hope-ui/docs...`
- **Build output directory:** `apps/docs/dist/client`
- Clean URLs (`/docs` → `docs/index.html`) require every route to be prerendered (`crawlLinks`
  follows the nav; add an explicit `pages` list for any unlinked route) — there is no server
  fallback, so an un-prerendered route 404s.
