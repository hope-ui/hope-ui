import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// The `@hope-ui/*` → src and `solid-js`/`@solidjs/web` → server-build aliases, extracted so both
// `vitest.config.ts` and the hydration-fixture bridge (`vitest-hydration-bridge.ts`) share one
// definition. CLAUDE.md's "always resolve to src, never a sibling's dist" invariant lives here;
// the bridge is a fourth consumer of the *same* arrays rather than a duplicated fifth copy.

const requireFromPrimitives = createRequire(
  join(import.meta.dirname, "packages/primitives/package.json"),
);

/**
 * `solid-js` and `@solidjs/web` each ship two builds: a server one (string-producing SSR ops,
 * `isServer: true`, `createUniqueId` consuming a hydration child id) and a browser one (real
 * DOM ops). `package.json#exports` picks between them with the `node` / `browser` conditions.
 *
 * Vite's default `resolve.conditions` includes `browser` **regardless of Vitest's
 * `test.environment`** — that setting only swaps JS globals like `document`, never package
 * `#exports` resolution. Confirmed empirically: setting `resolve.conditions` /
 * `ssr.resolve.conditions` to `["node"]` on a node project did *not* change which build was
 * resolved. An explicit alias to the server entry is what actually works.
 *
 * `createRequire().resolve()` applies Node's `node` + `require` conditions, so it lands on the
 * CommonJS server entry; its ESM sibling sits beside it and is what a real SSR bundler picks.
 */
export function resolveServerEntry(packageName: string): string {
  const cjsServerEntry = requireFromPrimitives.resolve(packageName);
  const esmServerEntry = cjsServerEntry.replace(/\.cjs$/, ".js");

  if (esmServerEntry === cjsServerEntry || !existsSync(esmServerEntry)) {
    throw new Error(
      `Could not locate the ESM server build for "${packageName}". Resolved ${cjsServerEntry}, ` +
        `expected an ESM sibling at ${esmServerEntry}. Check the package's #exports map — the ` +
        `"ssr" Vitest project silently renders against the browser build without this.`,
    );
  }
  return esmServerEntry;
}

// `@hope-ui/components` depends on `@hope-ui/primitives` as a real workspace package,
// which package-resolves to its *built* `dist/index.js` — meaning editing
// `packages/primitives/src/**` has no effect on `@hope-ui/components`' tests until
// `@hope-ui/primitives` is rebuilt. Hit this directly: a primitive fix was edited,
// standalone primitive tests (which import it via a relative path within the same package)
// went green, but Dialog's tests kept failing identically, because they were still exercising
// the stale pre-fix `dist` build. Aliasing straight to source removes the rebuild step.
const primitivesSrcDir = join(import.meta.dirname, "packages/primitives/src");
const themingSrcDir = join(import.meta.dirname, "packages/theming/src");
const presetsSrcDir = join(import.meta.dirname, "packages/presets/src");

// `@hope-ui/primitives` publishes one subpath export per primitive folder (no root barrel),
// so the alias is a wildcard: `@hope-ui/primitives/render` -> `.../src/render/index.ts`. The
// `find` is a regex with a capture group and the `$1` in `replacement` is substituted by
// `String.replace` (what `@rollup/plugin-alias` runs under the hood). Anchored `^…/(.+)$` so it
// stays an exact per-subpath match: a bare-prefix string `find` would also capture unrelated
// specifiers, the trap the `solid-js` / `@solidjs/web` aliases below avoid.
//
// `@hope-ui/theming` has a root barrel (it's one cohesive contract package, not a bag of
// unrelated components), so its aliases are two exact-anchored matches — the `/conformance`
// subpath and the root — rather than a wildcard.
export const hopeUiAlias = [
  {
    find: /^@hope-ui\/primitives\/(.+)$/,
    replacement: join(primitivesSrcDir, "$1/index.ts"),
  },
  {
    find: /^@hope-ui\/theming\/conformance$/,
    replacement: join(themingSrcDir, "conformance/conformance.ts"),
  },
  {
    find: /^@hope-ui\/theming$/,
    replacement: join(themingSrcDir, "index.ts"),
  },
  // The hope preset's runtime recipe map (the JS half of the preset, passed to `<ThemeProvider>`).
  // Exact match, like theming's — one subpath, not a wildcard.
  {
    find: /^@hope-ui\/presets\/hope$/,
    replacement: join(presetsSrcDir, "hope/index.ts"),
  },
];

export const serverBuildAlias = [
  { find: /^solid-js$/, replacement: resolveServerEntry("solid-js") },
  { find: /^@solidjs\/web$/, replacement: resolveServerEntry("@solidjs/web") },
];
