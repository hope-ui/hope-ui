import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { playwright } from "@vitest/browser-playwright";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import { solidPluginOptions } from "./solid-babel-options";

// Three projects, one job each. Keep them that way — the previous two-project layout put
// pure-logic tests and SSR tests in the same "unit" project, which forced a module-resolution
// compromise that silently made every SSR test render against half the wrong build. See
// `docs/testing.md`.
//
//   unit     node, no DOM.      Pure logic. Client builds (real effects, deferred writes).
//   ssr      node, no DOM.      Server output. Server builds of solid-js *and* @solidjs/web.
//   browser  real Chromium.     DOM/focus/pointer/axe, and hydration. Client builds.

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
function resolveServerEntry(packageName: string): string {
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

// `@enara-ui/components` depends on `@enara-ui/primitives` as a real workspace package,
// which package-resolves to its *built* `dist/index.js` — meaning editing
// `packages/primitives/src/**` has no effect on `@enara-ui/components`' tests until
// `@enara-ui/primitives` is rebuilt. Hit this directly: a primitive fix was edited,
// standalone primitive tests (which import it via a relative path within the same package)
// went green, but Dialog's tests kept failing identically, because they were still exercising
// the stale pre-fix `dist` build. Aliasing straight to source removes the rebuild step.
const primitivesSrcDir = join(import.meta.dirname, "packages/primitives/src");

// `@enara-ui/primitives` publishes one subpath export per primitive folder (no root barrel),
// so the alias is a wildcard: `@enara-ui/primitives/render` -> `.../src/render/index.ts`. The
// `find` is a regex with a capture group and the `$1` in `replacement` is substituted by
// `String.replace` (what `@rollup/plugin-alias` runs under the hood). Anchored `^…/(.+)$` so it
// stays an exact per-subpath match: a bare-prefix string `find` would also capture unrelated
// specifiers, the trap the `solid-js` / `@solidjs/web` aliases below avoid.
const enaraUiAlias = [
  {
    find: /^@enara-ui\/primitives\/(.+)$/,
    replacement: join(primitivesSrcDir, "$1/index.ts"),
  },
];
const serverBuildAlias = [
  { find: /^solid-js$/, replacement: resolveServerEntry("solid-js") },
  { find: /^@solidjs\/web$/, replacement: resolveServerEntry("@solidjs/web") },
];

// Opts a node project out of `vite-plugin-solid`'s automatic jest-dom injection, which
// otherwise breaks the project the moment any devDependency drags `@testing-library/jest-dom`
// into the graph. The file's *name* is what does the opting out — see the comment inside it.
// The browser project needs no such guard: the plugin already skips it.
const jestDomOptOut = ["./vitest.setup.jest-dom-optout.ts"];
const nodeExclude = ["**/*.browser.test.*", "**/*.ssr.test.*", "**/node_modules/**", "**/dist/**"];

export default defineConfig({
  test: {
    // No `passWithNoTests`. It was a Phase 0 concession from when no pure-logic primitive had
    // a node-environment test; leaving it on meant deleting every unit test kept CI green.
    projects: [
      {
        plugins: [solid(solidPluginOptions())],
        resolve: { alias: enaraUiAlias },
        test: {
          name: "unit",
          // `node`, not `jsdom`, and deliberately: jsdom cannot be trusted for focus, keyboard
          // or pointer behavior (see CLAUDE.md), so those tests belong in `browser`. With no
          // `document` at all it is *impossible* to write one here by accident, rather than
          // merely discouraged.
          environment: "node",
          include: ["packages/*/src/**/*.test.{ts,tsx}"],
          exclude: nodeExclude,
          setupFiles: jestDomOptOut,
        },
      },
      {
        plugins: [solid(solidPluginOptions())],
        // The only project that resolves the server builds. Both of them — aliasing
        // `@solidjs/web` alone leaves `solid-js` on its browser build, and the two disagree
        // about `createUniqueId`, which allocates the hydration child ids. That hybrid is why
        // Dialog's hydration round-trip appeared impossible for months.
        resolve: { alias: [...enaraUiAlias, ...serverBuildAlias] },
        test: {
          name: "ssr",
          environment: "node",
          include: ["packages/*/src/**/*.ssr.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/dist/**"],
          setupFiles: jestDomOptOut,
          // Without this, `@solidjs/web` is externalized and loaded by Node directly, so its
          // own `import { createRoot, getOwner } from "solid-js"` never sees the alias above —
          // Node resolves it to the *browser* build. The result is two `solid-js` instances
          // with two separate `currentOwner`s, and every `createUniqueId()` throws
          // "cannot be used outside of a reactive context" because the owner was set on the
          // other copy. Inlining routes those imports back through Vite's resolver.
          server: { deps: { inline: ["@solidjs/web", "solid-js"] } },
        },
      },
      {
        plugins: [solid(solidPluginOptions())],
        resolve: { alias: enaraUiAlias },
        test: {
          name: "browser",
          include: ["packages/*/src/**/*.browser.test.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/dist/**"],
          browser: {
            enabled: true,
            // Headless everywhere (locally and in CI): CI installs only the
            // "chromium-headless-shell" build (`playwright install --with-deps
            // --only-shell`), which Playwright only picks up when headless is on.
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
