# solid-zero: architecture plan and roadmap

## Status (as of Phase 1 in progress — Dialog's shared primitives complete)

**Phase 0 is complete and merged to `develop`.** In place: pnpm + Turborepo workspace,
`@solid-zero/core` (behavior kernel — currently just `renderElement`), `@solid-zero/button`
(first real component), `@solid-zero/internal-test-utils` (shared `mount` +
`expectNoA11yViolations` harness), GitHub Actions CI (lint → build → typecheck → Vitest
unit + Playwright browser tests → coverage/doc parity check), Changesets. Full pipeline
verified green locally, including the coverage-parity script's fail/pass behavior.

**Phase 1, step 2 (Dialog) is in progress.** `@solid-zero/core` gained
`createComponentContext`, `createFocusTrap`, `createDismissable`, `createScrollLock`, and
`createPresence` — all built fresh (Base UI/React Aria as behavior reference, per the
reference policy below), all with tests + docs. Building these forced a significant,
unplanned but necessary detour: the build pipeline moved from `tsup`/`esbuild-plugin-solid`
to Vite library mode/`vite-plugin-solid@3.0.0-next.5`, because the old pipeline could not
compile a JSX `ref` attribute at all under solid-js 2.0 (see "SolidJS 2.0 (beta) — API
differences" in `CLAUDE.md` for the full root-cause writeup). Dialog itself (the
component) is next.

**Key implementation findings from Phase 0** (verified against the actual installed
`2.0.0-beta.16` packages, not from docs/memory — see `CLAUDE.md` for the concise
version):
- DOM rendering (`render`, `Dynamic`, `Portal`, `JSX` types) moved out of `solid-js`
  into a separate **`@solidjs/web`** package; `jsxImportSource` and the
  `solid.moduleName` option (for `esbuild-plugin-solid`/`vite-plugin-solid`, which both
  still default to `"solid-js/web"`) must point there.
- `mergeProps`/`splitProps` are gone; the 2.0 idiom is `merge`/`omit` from `solid-js`.
- Hit a real bug: Vite's `solid-refresh` HMR wrapper silently broke prop forwarding
  (`children` vanished) for components imported from another module, but not for the
  same component defined inline in a test file. Fixed with `hot: false` in the Solid
  Vite plugin config (`vitest.config.ts`) — tests don't need HMR.
- Confirmed a genuine, unavoidable type-system limit for the render-prop/`as` pattern:
  a component's `render` callback can't be soundly typed for an arbitrary target
  element without full generics (the `Polymorphic<T>` cost this project is explicitly
  trying to avoid). Documented in `packages/core/src/render.md` rather than papered
  over — an explicit type-assertion escape hatch is used at the one call site that
  needs cross-element rendering.

## Reference policy (important, corrects an earlier misstep in this plan's own history)

- **Kobalte and Corvu: anti-pattern references only.** Never copy their code or
  "keep the shape of" anything from either, even in spirit. The user is Kobalte's
  original author and a Corvu contributor, and has explicitly called out both as bad
  references to design from — cite them only as pitfall case studies (backed by direct
  source inspection, not recollection).
- **Base UI and React Aria: active, legitimate references.** Use their code and
  reasoning freely when designing solid-zero's public API and accessibility behavior
  (e.g. the `render`/`useRender` pattern, ARIA keyboard-interaction logic). Don't do a
  byte-per-byte copy when a from-scratch Solid idiom is straightforward — but if a
  literal port from either is genuinely unavoidable, add an attribution comment at the
  top of the file, the same way Kobalte itself credits react-spectrum ("Portions of
  this file are based on code from react-spectrum").

## Context

`solid-zero` is a Base UI / React Aria–inspired headless, accessible component library
for SolidJS — copying their **API surface** (prop patterns, composition idioms) but not
their React internals — explicitly avoiding the structural problems Kobalte and Corvu
run into (see Reference policy above).

**SSR and SolidStart support are required, not optional.** Every primitive and
component must render correctly under server-side rendering and hydrate cleanly on the
client — this is a cross-cutting, non-negotiable requirement like the Definition of
Done, not a follow-up phase. See "SSR & hydration requirements" below for what that
means concretely and a caveat about SolidStart's current version alignment.

**Target runtime: SolidJS 2.0 (beta, first public build `v2.0.0-beta.0`, March 2026) —
not 1.x.** This is a meaningful architectural input, not a version bump: 2.0 reworks
reactivity (`@solidjs/signals` as a standalone reactive core decoupled from the UI/JSX
layer, deterministic microtask batching), stores (draft-first mutable setters,
`createProjection` for read-only derived stores, `storePath()` as an opt-in path-style
helper), effects (`createEffect` split into separate compute/apply), lifecycle
(`onMount` → `onSettled`), context (`createContext` returns the Provider component
directly, `useContext` throws by default when no provider is found), refs (native ref
arrays, no `mergeRefs` needed), and async (native Promise support in `createMemo`,
`<Loading>`, `isPending`, `action`/`createOptimisticStore`). It's beta and
`@solidjs/signals` is explicitly still "stabilizing but may have breaking changes
before final release" — the exact beta version is pinned via the `pnpm-workspace.yaml`
catalog, and any future churn should be contained behind the Layer A kernel boundary
(see architecture section) rather than letting every component touch raw signals/store
APIs directly.

To ground the pitfall analysis in fact rather than recollection, the following repos
were cloned and inspected directly during planning (read-only, then deleted):
- `kobaltedev/kobalte` — single `@kobalte/core` package
- `corvudev/corvu` — many independent per-primitive packages
- `mui/base-ui` — single `@base-ui/react` package (the actual "Base UI";
  `github.com/base/ui` is Coinbase's unrelated app repo — ruled out during research)
- `adobe/react-spectrum` (`packages/react-aria`, `packages/@react-stately/*`)

## Confirmed pitfalls to avoid (Kobalte/Corvu — anti-patterns only, per policy above)

**Kobalte (`@kobalte/core`, ~59 components, one package):**
- 53 separate hand-rolled `createContext` calls — one bespoke `XContext` +
  `XContextValue` type + `useXContext` per component family, no shared context-factory
  kernel. Boilerplate multiplication and consistency drift (not all components
  integrate `FormControlContext` the same way).
- One giant package = no independent release/versioning blast-radius control.
- Test coverage is real but inconsistent: **24 of ~59 component dirs have no colocated
  test file**, clustered exactly in the highest a11y-risk, keyboard/floating categories
  — `popover`, `tooltip`, `menu`, `dropdown-menu`, `navigation-menu`, `hover-card`,
  `slider`, `dismissable-layer`.
- The `Polymorphic`/`PolymorphicProps<T>` generic `as`-prop machinery is the known
  type-DX pain point when consumers wrap components in their own polymorphic layer —
  solid-zero hit a version of this exact tension in Phase 0 (see Status above).

**Corvu (per-primitive packages: dialog, popover, tooltip, drawer, accordion,
disclosure, otp-field, resizable, calendar + shared `solid-dismissible`/
`solid-focus-trap`/`solid-presence`/`solid-prevent-scroll`/`solid-transition-size`/
`@corvu/utils`):**
- **Zero automated tests anywhere in the repo.** No regression safety net at all.
- Higher-level primitives depend on *sibling component packages* rather than a shared
  kernel: `@corvu/popover` depends on `@corvu/dialog`, `@corvu/drawer` depends on
  `@corvu/dialog`. Popover/Drawer aren't semantically "a kind of Dialog" — this couples
  their behavior to Dialog's internals and forces every non-modal floating consumer to
  pull in Dialog's full machinery (scroll-lock, pinch-zoom prevention, focus-restore)
  even when unused.
- Each primitive hand-rolls its own dual public/internal context pair plus a bespoke
  `createKeyedContext`/`useKeyedContext` string-registry — the same
  boilerplate-multiplication disease as Kobalte, relocated from per-component to
  per-package.

**Validating evidence for going Solid-native, from Base UI (active reference, best-funded
of the four):** Base UI's own React team built a hand-rolled external `Store` class
(`packages/utils/src/store/Store.ts`) — `subscribe`/`getSnapshot`/`setState`/
selector-based `use()` — plus a custom `useSyncExternalStore` wrapper and a "fastHooks"
instance registry, specifically to get fine-grained, selector-scoped updates and dodge
context/re-render cost. That is, structurally, a hand-built signal system. Solid's
`createStore`/`createSignal`/`createMemo` give you this for free — building an
equivalent indirection layer in Solid would be pure waste. Base UI also has real test
density (273 test files / ~44 components) and a clean single `useRender` hook for the
render-prop/`asChild` composition pattern — solid-zero's `renderElement` is modeled on
this idea (not the React implementation, which needs `forwardRef`/dependency arrays
that Solid doesn't).

React Aria/React Stately's two-layer split — platform-agnostic **state** hooks
(`@react-stately/*`) consumed by DOM/ARIA **behavior** hooks (`@react-aria/*`) — is
genuinely sound. Collapse it into one Solid idiom (a primitive that returns state + the
DOM props/handlers together) rather than two hook families, since there's no React
Native–style second renderer to justify the split, unless Solid Native/non-DOM output
becomes an actual goal.

## Recommended architecture

**Three layers, composition over inheritance:**

1. **Behavior kernel** (`@solid-zero/core`, internal, never duplicated) — Solid 2.0
   primitives, not hooks, built directly on `@solidjs/signals`/stores:
   `createListState`/`createSelectionState`/`createCollection` (port react-stately's
   *algorithms* directly from react-stately, not from Kobalte's port of them) as
   **stores** using 2.0's draft-first setters and `createProjection` for derived views,
   `createFocusTrap`, `createDismissable`, `createRovingFocus`/`createTypeahead` (one
   shared arrow-key/typeahead primitive, a true singleton across every list-like
   component, not per-component-family logic), `createFloating` (wraps
   `@floating-ui/dom`), `createScrollLock`, `createPresence`. Side-effectful wiring
   should use 2.0's split `createEffect(depsFn, computeFn)` form and `onSettled` (not
   `onMount`, which no longer exists in 2.0).
   **Rule:** Popover composes `createFloating` + `createDismissable` + `createPresence`.
   Dialog composes `createFocusTrap` + `createDismissable` + `createScrollLock` +
   `createPresence`. Popover must never depend on Dialog — this directly avoids the
   Corvu coupling smell above.

2. **Component wiring kernel** — thinner than under 1.x, because 2.0's `createContext`
   already returns the Provider component directly and `useContext` already throws by
   default when no provider is found. Only needs a thin `createComponentContext(name)`
   wrapper for consistent naming/typing, plus optional multi-instance keying where
   genuinely needed (Menu, Select, Accordion, Tabs). Prefer prop/closure passing over
   context entirely for shallow compound components.

3. **Public component API** — compound components (`Dialog.Root`, `Dialog.Trigger`, …)
   built on `solid-js`'s `merge`/`omit` (2.0's replacements for `mergeProps`/
   `splitProps`), plus `renderElement` (in `@solid-zero/core`) for the render-prop/`as`
   pattern. Ref merging needs no custom utility — `ref` natively accepts an array of
   ref functions (`ref={[internalRef, props.ref]}`).

**Async-loaded components** (Combobox with remote options, Toast queues, any
"loading…" state): lean on 2.0's native async support (`createMemo` accepting
Promises, `<Loading>`, `isPending`) instead of hand-rolling resource/loading-state
plumbing.

## SSR & hydration requirements (cross-cutting, non-negotiable)

`@solidjs/web`'s package exports already resolve to different runtime implementations
per environment (`browser` condition → `dist/web.js`/`dist/dev.js` with real DOM ops;
`node`/`worker` condition → `dist/server.js` with string-based SSR ops) behind the
*same* exported function names (`render`/`Dynamic`/`insert`/`spread`/etc.), plus
`renderToString`/`renderToStringAsync`/`renderToStream`/`hydrate`/`isServer`. This means
**solid-zero's packages do not need a separate SSR build** — compiling once with the
default `generate: 'dom'` mode and importing runtime helpers from `@solidjs/web` (never
hardcoding a specific dist file) should let the same compiled component code run
correctly in both SSR and client/hydration contexts, resolved automatically by whatever
bundler the consuming app (e.g. SolidStart) uses. This must be verified with an actual
round-trip test per component, not assumed — see the DoD addition below.

Concrete rules every primitive/component must follow:
- **No unconditional DOM/`window`/`document` access outside effects.** `createEffect`/
  `onSettled` bodies only run client-side already (Solid guarantees this), so
  client-only concerns (focus management, scroll lock, floating-position calculation,
  outside-click dismissal) should live there naturally rather than needing manual
  `isServer` guards sprinkled everywhere. Reach for `isServer` (from `@solidjs/web`)
  only for the rarer case of code that isn't naturally effect-gated.
- **IDs used for ARIA linking (`aria-labelledby`, `aria-describedby`, `aria-controls`,
  etc.) must be generated with `createUniqueId`** (deterministic, SSR-stable) — never
  `Math.random()`/a module-level counter/anything that can produce different values on
  server vs client and cause a hydration mismatch.
- **Portals do NOT degrade gracefully server-side in this `@solidjs/web` beta —
  confirmed by direct inspection, not assumed.** `@solidjs/web`'s server build
  (`dist/server.js`) implements `Portal` as `function Portal() { throw new Error("Portal
  is not supported on the server"); }` — calling it during SSR crashes the whole render,
  it does not silently no-op. Every component that portals content (Dialog's
  Backdrop/Popup) must gate its own `<Portal>` usage with `isServer` (from
  `@solidjs/web`) as a plain `if (isServer) return null;` at the top of a small wrapper
  component — not a reactive `<Show when={!isServer}>`, since `isServer` is a fixed
  per-environment constant, not a runtime toggle, and a plain `if` avoids relying on
  `Show`'s hydration-key bookkeeping for something that never actually changes within a
  given build. This means portaled content is simply absent from the SSR HTML and mounts
  fresh on the client after hydration — verify this doesn't produce a hydration-mismatch
  warning with an actual `renderToStringAsync` + `hydrate` round-trip test, per the DoD
  below, rather than assuming it's fine.
- **Focus-trap/scroll-lock/dismissable/floating-position primitives are inherently
  client-only** and should be structured so they simply don't run their DOM-touching
  logic during SSR (again, via effects) rather than crashing or needing to be manually
  disabled.

**SolidStart version caveat (checked directly against the npm registry, not assumed):**
as of this writing, `@solidjs/start`'s most Solid-2.0-aligned release
(`2.0.0-alpha.3`) still depends on `solid-js@^1.9.11`, not 2.0 — SolidStart itself has
not yet migrated. This means **real end-to-end SolidStart integration testing is
currently blocked** on their migration, not on anything in this project. Don't treat
"no SolidStart example app yet" as a solid-zero gap; re-check `@solidjs/start`'s
registry versions periodically and add a real SolidStart example once it supports 2.0.
In the meantime, SSR/hydration correctness is fully testable and required *now* using
`@solidjs/web`'s own framework-agnostic `renderToStringAsync`/`hydrate` directly (see
DoD below) — this doesn't depend on SolidStart at all.

## How to build, in order

**Phase 0 (done):**
1. ~~Repo scaffolding~~ ✅
2. ~~pnpm workspace + Turborepo, `solid-js`/`@solidjs/signals`/`@solidjs/web` pinned via
   catalog~~ ✅
3. ~~`packages/core` (behavior kernel, `renderElement`) + `packages/button`~~ ✅
4. ~~Vitest: `unit` (node) + `browser` (Playwright, headless-shell) projects~~ ✅
5. ~~GitHub Actions CI~~ ✅
6. ~~Changesets~~ ✅
7. ~~`check:coverage-parity` script, verified fail/pass~~ ✅

**Phase 1 — build in this order (each step forces the next shared primitive into
existence before scaling to 50+ components):**
1. ~~`Button`~~ ✅ — established the `as`/render composition pattern.
2. **`Dialog` (in progress)** — forces focus-trap, dismissable, scroll-lock, presence,
   portal, id-linking (`aria-labelledby`/`describedby`), and the context kernel.
   ~~`createComponentContext`, `createFocusTrap`, `createDismissable`,
   `createScrollLock`, `createPresence`~~ ✅ — all in `@solid-zero/core`, tested, documented.
   The Dialog component itself is next. Also the first real stress-test of the SSR
   requirements above: portal-on-the-server (now known to throw, not degrade —
   see above), effect-gated focus-trap/scroll-lock, and `createUniqueId`-based
   id-linking all need to hold up in an actual `renderToStringAsync` + `hydrate` round
   trip, not just in the browser.
3. `Popover` + `Tooltip` — forces `createFloating` as independent of Dialog, proving
   the "compose, don't inherit" rule in practice (Popover's source must have no import
   from Dialog's package/module).
4. `Listbox`/`Select` (or `Menu`) — forces collection/selection state + keyboard
   navigation/typeahead.

Each of these must ship meeting the full Definition of Done (tests in both Vitest
projects as applicable, `.md` doc, `check:coverage-parity` passing) before moving to
the next — don't let "we'll add tests/docs later" creep in, since that's exactly the
drift that produced Kobalte's and Corvu's gaps.

## Publishing strategy

- **Package granularity:** hybrid, not Kobalte's one-giant-package nor Corvu's
  15+-micro-packages-with-sibling-deps. `@solid-zero/core` for the behavior kernel
  (never duplicated), then component packages grouped by **shared-primitive family**
  once there are enough components to group — e.g. eventually `@solid-zero/overlays`
  (dialog, popover, tooltip, alert-dialog, context-menu — share dismiss/floating/
  presence), `@solid-zero/collections` (listbox, select, combobox, menu, tabs — share
  list/selection/keyboard-nav), `@solid-zero/forms` (checkbox, radio, switch, slider,
  number-field), `@solid-zero/disclosure` (accordion, collapsible). Every component
  package depends only on `@solid-zero/core` — never on a sibling component package.
  (`@solid-zero/button` is currently its own package as a Phase 0 pipeline proof; it
  may move into `@solid-zero/forms` once that family exists.)
- **Entry points:** subpath exports via `package.json#exports` per component rather
  than one barrel re-exporting everything, plus `"sideEffects": false`.
- **Monorepo tooling:** pnpm workspaces + Turborepo. Skip Nx — even Base UI itself runs
  Nx *and* Lerna together, more tooling than a greenfield library needs.

## Distribution

- **ESM-only** (no CJS) — Solid is ESM-first; reversible decision if real CJS demand
  appears later.
- **`tsup`** for builds (esbuild-based, multi-entry, per-subpath `.d.ts` bundling).
- **Changesets** for versioning — fits pnpm workspaces natively, per-package-family
  changelogs.

## Testing/a11y strategy + Definition of Done (locked-in, non-negotiable)

Stack: **GitHub Actions**, **Vitest**, **Vitest browser mode with Playwright**
(headless-shell in CI: `playwright install --with-deps --only-shell`) for
real-browser testing — all from day one.

**Definition of Done for every component and every primitive:**
1. Full test coverage (unit-level via Vitest's `unit` project for pure state
   primitives; real-browser via the `browser` project for anything involving actual
   focus, keyboard events, or pointer interaction — jsdom cannot be trusted for
   focus/selection/IME behavior).
2. A matching `.md` doc file (API, keyboard interaction table, ARIA pattern reference),
   colocated in `src/`.
3. **An SSR/hydration smoke test** for every component (not needed for pure internal
   primitives with no DOM output): call `renderToStringAsync` (from `@solidjs/web`,
   runs fine in the `unit`/node project — no browser needed for this half) and confirm
   it resolves without throwing; then, in the `browser` project, inject that server
   HTML into a container and call `hydrate()` against it, asserting no hydration
   mismatch warnings are logged and that basic interactivity (e.g. a click handler)
   still works post-hydrate. This is what actually catches SSR-only crashes (portal
   access to `document.body`, non-deterministic IDs) instead of assuming the "one
   build, `@solidjs/web` resolves the environment" theory holds.

Items 1 and 2 are already CI-enforced via `pnpm check:coverage-parity`
(`scripts/check-coverage-parity.mjs`), which fails the pipeline if any
primitive/component under `packages/*/src/*` lacks a matching test file or `.md` doc.
Item 3 (the SSR/hydration smoke test) is **not yet mechanically enforced** — it's a
new requirement being added at Dialog, and `check:coverage-parity` should be extended
alongside Dialog's work to also fail if a component's test file has no SSR-round-trip
test (e.g. checking for a `renderToStringAsync`/`hydrate` reference), the same way it
already enforces test/doc presence. Until that script update lands, treat item 3 as a
manual review requirement, not a false sense of "CI already covers this."

`expectNoA11yViolations` (axe-core, in `@solid-zero/internal-test-utils`) should run at
least once per component's browser test so a baseline a11y check happens by default.

## Verification checklist for each new phase

- Build the component(s), confirm the "compose, don't inherit" rule holds where
  applicable (e.g. Popover's source has no import from Dialog's package/module).
- Confirm the Playwright-backed Vitest browser tests actually exercise real focus
  behavior where relevant (Dialog: focus trap, restore-on-close; Listbox/Select:
  arrow-key navigation, typeahead) — these are exactly the interactions jsdom can't
  validate.
- Run `pnpm check:coverage-parity` and confirm it's green.
- Confirm each component actually survives an SSR round trip: `renderToStringAsync`
  doesn't throw, and `hydrate()` against the resulting HTML produces no console
  hydration-mismatch warnings. Don't skip this because "it's just Button-like" —
  Dialog's portal/focus-trap/id-linking are exactly the parts most likely to break here.
- Once there's more than one component package, confirm `pnpm changeset` +
  `pnpm changeset version` produces per-package-family changelogs as expected.
- Once package grouping exists, wire up a throwaway consumer app (Vite + solid-js)
  importing via subpath exports and confirm via bundle analysis that importing one
  component doesn't pull in unrelated component code.
