import { createRequire } from "node:module";
import { join } from "node:path";
import { playwright } from "@vitest/browser-playwright";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import { solidPluginOptions } from "./solid-babel-options";

// `@solidjs/web`'s package.json #exports resolve differently per environment (a
// "node" condition -> `dist/server.js`, string-based SSR ops incl. `isServer: true`
// and a real `renderToStringAsync`; a "browser" condition -> `dist/web.js`/`dev.js`,
// real DOM ops incl. `isServer: false`). Vite's default `resolve.conditions` includes
// "browser" regardless of Vitest's `test.environment` setting (that only swaps JS
// globals like `document`, not package #exports resolution) — confirmed empirically:
// setting `resolve.conditions`/`ssr.resolve.conditions` to `["node"]` on the "unit"
// project alone did *not* change which build got resolved. Forcing an explicit alias
// to the "node"-condition entry is what actually works, needed so the "unit" project
// can test the real SSR code path (e.g. that `Portal` throws server-side) rather than
// the client build pretending to be SSR.
const requireFromPrimitives = createRequire(
  join(import.meta.dirname, "packages/primitives/package.json"),
);
const solidWebServerEntry = requireFromPrimitives.resolve("@solidjs/web");

// `@solid-zero/components` depends on `@solid-zero/primitives` as a real workspace
// package, which package-resolves to its *built* `dist/index.js` — meaning editing
// `packages/primitives/src/**` has no effect on `@solid-zero/components`' tests until
// `@solid-zero/primitives` is rebuilt. Hit this directly: a primitive fix was edited,
// standalone primitive tests (which import it via a relative path within the same
// package) went green, but Dialog's tests kept failing identically, because they were
// still exercising the stale pre-fix `dist` build. Aliasing straight to source removes
// the rebuild step from the dev loop entirely.
const primitivesSrcEntry = join(import.meta.dirname, "packages/primitives/src/index.ts");

export default defineConfig({
  test: {
    // No `passWithNoTests`. It was a Phase 0 concession, when no pure-logic primitive had a
    // node-environment test yet; there are now 42 across 7 files, and leaving it on meant
    // deleting every unit test kept CI green.
    projects: [
      {
        plugins: [solid(solidPluginOptions())],
        resolve: {
          alias: {
            "@solidjs/web": solidWebServerEntry,
            "@solid-zero/primitives": primitivesSrcEntry,
          },
        },
        test: {
          name: "unit",
          environment: "node",
          include: ["packages/*/src/**/*.test.{ts,tsx}"],
          exclude: ["**/*.browser.test.*", "**/node_modules/**", "**/dist/**"],
          // Opts this project out of `vite-plugin-solid`'s automatic jest-dom injection,
          // which otherwise breaks the whole project the moment any devDependency drags
          // `@testing-library/jest-dom` into the graph. The file's *name* is what does the
          // opting out — see the comment inside it. The browser project needs no such
          // guard: the plugin already skips it.
          setupFiles: ["./vitest.setup.jest-dom-optout.ts"],
        },
      },
      {
        plugins: [solid(solidPluginOptions())],
        resolve: {
          alias: { "@solid-zero/primitives": primitivesSrcEntry },
        },
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
