import { join } from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import withToc from "@stefanprobst/rehype-extract-toc";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineConfig } from "vite";
import viteSolid from "vite-plugin-solid";
// Reuse the canonical `@hope-ui/* -> packages/*/src` alias array (dev only). Sharing the
// one definition keeps CLAUDE.md's "in development, @hope-ui/* always resolves to src"
// invariant in a single place rather than a drifting copy. Vite bundles this relative
// config dependency and injects a per-file `import.meta.dirname`, so the absolute paths
// `hopeUiAlias` bakes in resolve against the repo root, not this config's directory.
import { hopeUiAlias } from "../../vitest-aliases";

const src = fileURLToPath(new URL("./src", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

// `hopeUiAlias` covers `@hope-ui/primitives/*`, `@hope-ui/theming(/conformance)`, and
// `@hope-ui/presets/hope`, but NOT `@hope-ui/components/*` (that alias only exists for the
// components package's own tests, which use relative imports). Add the missing wildcard so a
// dev import like `@hope-ui/components/button` hot-reloads from source too.
const componentsSrcAlias = {
  find: /^@hope-ui\/components\/(.+)$/,
  replacement: join(repoRoot, "packages/components/src/$1/index.ts"),
};

// Consumption model (see apps/docs/README.md):
//  - `vite build` -> `@hope-ui/*` resolves to the published `dist/*.jsx` via the "solid"
//    export condition (what a real consumer installs). No src alias.
//  - `vite dev`   -> `@hope-ui/*` aliases to `packages/*/src` for live hot-reload of the
//    library while iterating on the docs (same idea Storybook uses).
export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
  },
  // @hope-ui/* ships JSX-preserved SOURCE under the "solid" export condition, so
  // the consumer's vite-plugin-solid must compile it. Two consequences:
  //  - SSR/prerender must NOT externalize it (Node can't import raw .jsx) -> inline it.
  //  - the client build must NOT esbuild-prebundle it (that would compile JSX as
  //    React) -> exclude from optimizeDeps so it flows through vite-plugin-solid.
  ssr: {
    noExternal: [/^@hope-ui\//],
  },
  optimizeDeps: {
    exclude: ["@hope-ui/components", "@hope-ui/theming", "@hope-ui/presets", "@hope-ui/primitives"],
  },
  resolve: {
    // Vite 8's native tsconfigPaths only rewrites `~/…` for TS/JS importers,
    // NOT for imports originating inside a .mdx file. This explicit alias is
    // not extension-gated, so `~` works from MDX too.
    tsconfigPaths: true,
    alias: [
      // Dev only: resolve @hope-ui/* to source for hot-reload. In `build`, omit these so
      // resolution falls through to node_modules -> package `exports` -> dist (the real
      // consumer path). `@rollup/plugin-alias` takes the first match, so the @hope-ui
      // entries precede the `~` alias (they never overlap, but order is explicit).
      ...(command === "serve" ? [componentsSrcAlias, ...hopeUiAlias] : []),
      { find: /^~\//, replacement: `${src}/` },
    ],
  },
  plugins: [
    tailwindcss(),
    // MDX must run BEFORE vite-plugin-solid. `jsx: true` makes MDX emit JSX
    // (instead of compiling it away) so the Solid compiler handles it — this
    // is what gets us the real Solid runtime rather than a hyperscript shim.
    {
      enforce: "pre",
      // jsx:true -> emit JSX for vite-plugin-solid to compile with the real
      // Solid compiler. providerImportSource -> supply Solid components for
      // intrinsic tags (see src/mdx-components.tsx) instead of MDX's string
      // defaults, which Solid can't call as components.
      ...mdx({
        jsx: true,
        providerImportSource: "~/mdx-components",
        // MDX defaults element attributes to REACT casing, which rewrites the
        // `class` that rehype-pretty-code / Shiki emit to `className`. Under the
        // Solid compiler `className` becomes a literal attribute, so every Shiki
        // CSS selector silently fails to match and highlighting is invisible with
        // no error. Force HTML casing; keep style keys as valid CSS too. Both only
        // affect markdown-derived HTML, never author-written JSX (<ButtonDemo/>).
        elementAttributeNameCase: "html",
        stylePropertyNameCase: "css",
        // Build-time pipeline (pure SSG — highlighting is baked into the compiled
        // .mdx module, no client-side highlighter). rehype-pretty-code highlights
        // fenced code (order-independent); the slug -> extract -> export chain is
        // strictly ordered: rehype-slug adds heading ids, withToc collects them,
        // withTocExport emits `export const tableOfContents` from the MDX module.
        rehypePlugins: [
          [
            rehypePrettyCode,
            { theme: { light: "github-light", dark: "github-dark" }, keepBackground: true },
          ],
          rehypeSlug,
          withToc,
          withTocExport,
        ],
      }),
    },
    tanstackStart({
      // Pure SSG for docs: full-document SSR of every route into static HTML
      // (NOT spa mode, which prerenders only a client-hydrated shell — prose
      // would be missing from the HTML, killing SEO).
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    // Tell vite-plugin-solid to also compile the JSX that MDX emits.
    viteSolid({ ssr: true, extensions: [".mdx"] }),
  ],
}));
