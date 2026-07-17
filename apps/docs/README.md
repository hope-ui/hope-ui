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

## Adding & organizing content

Docs pages are **content-driven**: one MDX file under `src/content/` is one page. `src/lib/content.ts`
globs `content/**/*.mdx` and derives every route's `$slug`, its sidebar entry, and its table of
contents — so you rarely touch a route file.

### Add a page

Drop a file at `src/content/<section>/<slug>.mdx`. It appears at `/<section>/<slug>`, in the section
sidebar, and (if it has `##`/`###` headings) in the "On this page" ToC. The page **title** is its H1.

- **Order:** prefix the filename with `NN-` (`01-installation.mdx`) to order it; the prefix is
  stripped from the slug/URL. Unprefixed pages sort after, by title.
- **Slugs** must be unique within a section.

### Group the sidebar by category

Put pages in a `NN-<category>/` **subfolder**: `content/components/20-overlays/dialog.mdx` renders
under an **Overlays** header (label humanized from the folder — `data-display` → "Data display"),
groups ordered by the `NN-` prefix. URLs stay flat (`/components/dialog`) — the folder is
sidebar-only. Sections without subfolders (e.g. `get-started`) render a flat, header-less list.

### Changelog is special

Changelog **auto-groups by the major version** parsed from the slug — keep files flat
(`content/changelog/2.0.0.mdx`) and they land under `v2` / `v1` / … headers, newest major first and
newest release within. No folders. A non-version slug (e.g. `unreleased.mdx`) renders ungrouped and
pinned on top. (See `resolveGroup` in `src/lib/content.ts`.)

### MDX authoring

- Fenced code is highlighted at build time (Shiki via `rehype-pretty-code`); a copy button is added
  automatically. Use the meta string for extras:
  ` ```tsx title="App.tsx" showLineNumbers {8-10} `.
- Heading ids (`rehype-slug`) and the `tableOfContents` export (`@stefanprobst/rehype-extract-toc`)
  are added by the MDX pipeline in `vite.config.ts` — the ToC is generated, not hand-written.
- Import live demo components from `~/components/…` and render them inline (see
  `content/components/10-forms/button.mdx`).

### Add a whole section

1. Create `src/content/<section>/`.
2. Add three route files mirroring an existing section — copy `components.tsx`, `components.index.tsx`,
   and `components.$slug.tsx`, swapping the `kind` / section string and the overview title.
3. Add a link in the top nav (`src/routes/__root.tsx`).

Shared UI lives in `src/components/`: `DocsSection` (grouped sidebar + `<Outlet/>`), `SectionOverview`
(index page), `MdxDoc` (article + ToC), `TableOfContents`, `CodeBlock`, and `PathLink` (a thin retype
of TanStack's `Link` for the content-driven concrete paths).

## Deploy (static hosting)

Pure SSG → static hosting (no Worker/server).

- **Build command:** `pnpm install && pnpm build --filter=@hope-ui/docs...`
- **Build output directory:** `apps/docs/dist/client`
- Clean URLs (`/components/button` → `components/button/index.html`) require every route to be
  prerendered. `crawlLinks` follows the sidebar — which links every content page — so pages are
  discovered automatically; add an explicit `pages` list only for an unlinked route. There is no
  server fallback, so an un-prerendered route 404s.
