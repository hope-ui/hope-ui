import { playwright } from "@vitest/browser-playwright";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import { solidPluginOptions } from "./solid-babel-options";
// The `@hope-ui/*` → src and server-build aliases live in their own module so the
// hydration-fixture bridge below is a fourth consumer of the *same* arrays, not a duplicated copy
// that could drift out of sync (CLAUDE.md's "always resolve to src" invariant).
import { hopeUiAlias, serverBuildAlias } from "./vitest-aliases";
import { hydrationFixtureBridge } from "./vitest-hydration-bridge";

// Three projects, one job each. Keep them that way — the previous two-project layout put
// pure-logic tests and SSR tests in the same "unit" project, which forced a module-resolution
// compromise that silently made every SSR test render against half the wrong build. See
// `__internal__/testing.md`.
//
//   unit     node, no DOM.      Pure logic. Client builds (real effects, deferred writes).
//   ssr      node, no DOM.      Server output. Server builds of solid-js *and* @solidjs/web.
//   browser  real Chromium.     DOM/focus/pointer/axe, and hydration. Client builds.

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
        // Client DOM compile, no hydration keys — pure logic, no DOM rendered here anyway.
        plugins: [solid(solidPluginOptions())],
        resolve: { alias: hopeUiAlias },
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
        // The SSR project: compile JSX to **server** templates (`generate: "ssr"`) and run against
        // the **server** builds of solid — the only faithful way to test what a server sends.
        // Without this it compiled DOM templates (a hoisted `_$template()`) that throw at import
        // under the server runtime, which is what forced components to route every host element
        // through `<Dynamic>`. `hydratable: true` emits the `_hk` keys the browser project claims.
        plugins: [solid(solidPluginOptions({ generate: "ssr", hydratable: true }))],
        // The only project that resolves the server builds. Both of them — aliasing
        // `@solidjs/web` alone leaves `solid-js` on its browser build, and the two disagree
        // about `createUniqueId`, which allocates the hydration child ids. That hybrid is why
        // Dialog's hydration round-trip appeared impossible for months.
        resolve: { alias: [...hopeUiAlias, ...serverBuildAlias] },
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
          //
          // `/^@solid-primitives\//` is the *same trap, one level out*, for any adopted
          // pre-compiled dependency. Externalized, an adopted primitive's own
          // `import { createSignal } from "solid-js"` bypasses the server-build alias and
          // Node resolves a second `solid-js` copy — so a render-body compute-form signal
          // (`createSignal(fn)` / `createMemo`) fails to consume its hydration id on the
          // server, the root drops from `_hk=1` to `_hk=0`, and every subsequent `_hk` shifts
          // down one versus the client. That silent asymmetry is what mis-flagged
          // `@solid-primitives/controlled-signal` as "breaks hydration" (__internal__/solid-primitives-eval.md);
          // it disappears the moment the dep is inlined here. See __internal__/solid-primitives-eval.md.
          // Non-anchored: Vitest tests this against the dep's *resolved absolute path*
          // (`…/node_modules/@solid-primitives/controlled-signal/…`), so an anchored `^` never
          // matches. The slash keeps it scoped to the org.
          server: { deps: { inline: ["@solidjs/web", "solid-js", /@solid-primitives\//] } },
        },
      },
      {
        // Client DOM compile, but `hydratable: true` so `hydrate()` can claim the server-rendered
        // nodes (the SSR project emits matching `_hk` keys) instead of re-creating them.
        //
        // `hydrationFixtureBridge` serves `virtual:hydration-fixture?id=<subject>` — genuine server
        // HTML rendered fresh in-process by a nested SSR Vite server, so hydration tests need no
        // committed `.html` fixture. See `vitest-hydration-bridge.ts`.
        plugins: [solid(solidPluginOptions({ hydratable: true })), hydrationFixtureBridge()],
        resolve: { alias: hopeUiAlias },
        // Pre-bundle the virtualizer core up front. Without this, its first import mid-run triggers
        // a Vite dependency re-optimization that reloads the page — "Vite unexpectedly reloaded a
        // test" — which is flaky on a cold CI cache. It's `createVirtualCollection`'s only external
        // dep, so listing it here is enough.
        optimizeDeps: { include: ["@tanstack/virtual-core"] },
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
