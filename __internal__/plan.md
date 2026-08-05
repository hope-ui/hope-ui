# hope-ui: architecture plan

## Status

**Nothing is published until SolidJS 2.0 ships stable.** The release model: build on the pinned beta →
wait for stable → fix the beta→stable breakage → publish 1.0. Everything that must happen at that
boundary is tracked in `__internal__/migration-2.0-stable.md`, not in comments.

Component/primitive status lives in [`__internal__/roadmap.md`](roadmap.md), which also supersedes the
build ordering below.

## Reference policy

- **Base UI and React Aria: active, legitimate references.** Use their code and reasoning freely when
  designing hope-ui's public API and accessibility behavior (the `render`/`useRender` pattern, ARIA
  keyboard-interaction logic). Prefer a from-scratch Solid idiom where it is straightforward; where a
  literal port is unavoidable, add an attribution comment at the top of the file ("Portions of this
  file are based on code from react-spectrum").
- **`@solid-primitives` (`next`): adopt as a dependency, don't just reference.** Before building a new
  internal primitive, check it and record an *adopt / wrap / build-fresh-because* verdict. Anything
  adopted is full-DoD-wrapped through its consumer, above all the hydration round-trip. Hazard: a
  `node_modules` primitive creating a compute-form signal/memo isn't compiled by our Solid pipeline,
  so the server drops a hydration id the client still consumes and `_hk` diverges. Practice, hazard,
  and per-package verdicts: `__internal__/solid-primitives-eval.md`.

Full source map for ported behavior: [`reference-implementations.md`](reference-implementations.md).

## Context

`hope-ui` is a Base UI / React Aria–inspired, **elegant, themeable**, accessible component library for
SolidJS — copying their **API surface** (prop patterns, composition idioms) but not their React
internals. Ready-to-use themeable components (Tailwind v4 + tailwind-variants) are the product, built
over an **internal** headless behavior kernel (`@hope-ui/primitives`) — an implementation detail and
an advanced escape hatch, **not** a stability-promised public API.

**Target runtime: SolidJS 2.0 (beta), not 1.x.** An architectural input, not a version bump: 2.0
reworks reactivity (`@solidjs/signals` as a standalone reactive core decoupled from the UI/JSX layer,
deterministic microtask batching), stores (draft-first mutable setters, `createProjection`,
`storePath()`), effects (`createEffect` split into compute/apply), lifecycle (`onMount` →
`onSettled`), context (`createContext` returns the Provider directly, `useContext` throws by default),
refs (native array flattening via `applyRef`, no `mergeRefs`), and async (native Promise support in
`createMemo`, `<Loading>`, `isPending`, `action`/`createOptimisticStore`). `@solidjs/signals` is
explicitly still "stabilizing but may have breaking changes before final release" — the beta is pinned
via the `pnpm-workspace.yaml` catalog, and churn is contained behind the Layer 1 kernel boundary
rather than letting every component touch raw signals/store APIs.

## Confirmed anti-patterns to avoid

Structural pitfalls observed in existing headless SolidJS component libraries — the concrete failure
modes this architecture is designed to prevent, stated on their own merits:

- **Per-component context boilerplate.** One bespoke `XContext` + `XContextValue` + `useXContext`
  hand-rolled per component family, with no shared context-factory kernel, multiplies boilerplate and
  drifts out of consistency. hope-ui uses one `createComponentContext` factory.
- **Per-package context boilerplate.** A dual public/internal context pair plus a bespoke
  keyed-context string-registry per package is the same multiplication, relocated.
- **One giant package.** A single package holding every component gives no independent
  release/versioning blast-radius control — hence the per-component subpath exports.
- **Inconsistent or absent test coverage.** Coverage that skips exactly the highest a11y-risk
  keyboard/floating components (`popover`, `tooltip`, `menu`, `slider`, `dismissable-layer`) leaves no
  regression safety net — hence the enforced Definition of Done and `check:coverage-parity`.
- **`Polymorphic`/`PolymorphicProps<T>` generic `as`-prop machinery** is a known type-DX pain point
  when consumers wrap components in their own polymorphic layer. hope-ui uses `renderElement`; the
  underlying type-system limit is documented in `__internal__/primitives/render/render.md`.
- **Coupling a component's *behavior* to a heavier sibling** (Popover or Drawer wiring their overlay
  behavior through Dialog). Popover/Drawer aren't semantically "a kind of Dialog"; such coupling ties
  their behavior to Dialog's internals and forces every non-modal floating consumer to pull in
  scroll-lock, pinch-zoom prevention and focus-restore unused. Popover composes the shared kernel
  directly. Reusing a *presentational leaf* like `CloseButton` is fine and encouraged — the
  anti-pattern is behavioral coupling and circular imports, not reuse.

**Why Solid-native rather than a state-container layer.** Base UI's React team hand-rolled an external
`Store` class (`packages/utils/src/store/Store.ts` — `subscribe`/`getSnapshot`/`setState`,
selector-based `use()`), a custom `useSyncExternalStore` wrapper, and a "fastHooks" instance registry
to get fine-grained, selector-scoped updates and dodge context/re-render cost. That is structurally a
hand-built signal system; Solid's `createStore`/`createSignal`/`createMemo` give it for free, so an
equivalent indirection layer in Solid is pure waste.

React Aria/React Stately's two-layer split — platform-agnostic **state** hooks (`@react-stately/*`)
consumed by DOM/ARIA **behavior** hooks (`@react-aria/*`) — is sound but collapses into one Solid
idiom (a primitive returning state + DOM props/handlers together): there is no React Native–style
second renderer to justify the split.

## Recommended architecture

**Three layers, composition over inheritance:**

1. **Behavior kernel** (`@hope-ui/primitives`, **internal/advanced — not a public product**, never
   duplicated) — Solid 2.0 primitives built directly on `@solidjs/signals`/stores. The
   **list-navigation kernel** is a set of fine-grained, Angular-Aria-aligned primitives (its
   signal-based `private/behaviors` port almost 1:1 to Solid; react-aria's `selection` is the
   edge-case checklist, not the source — full map in
   [`reference-implementations.md`](reference-implementations.md)):
   - `createCollection` / `createVirtualCollection` — the **item-source seam**: a DOM-order registry
     (`compareDocumentPosition`-sorted, over `createRegisteredElement`) and a `@tanstack/virtual-core`
     binding whose `items()` is the full data while `element` resolves only for the mounted window. A
     behavior reads either interchangeably.
   - `createListFocus` — the **foundation**: the active item + the `roving | activedescendant` switch,
     deferring real `.focus()` until the item's element exists (shared by the virtualized and
     activedescendant paths).
   - `createListNavigation` / `createListTypeahead` / `createListSelection` / `createListExpansion` /
     `createGridNavigation` — each injects one `createListFocus` (grid over a 2D cell collection),
     exactly as Angular injects one `ListFocus`.

   Alongside these: `createFocusTrap`, `createFocusScope`, `createAutoFocus`, `createFocusRestore`,
   `createHideOutside`, `createDismissable`, `createFloating` (wraps `@floating-ui/dom`),
   `createScrollLock`, `createPresence`, `createControllableState`, `createPress`, `createButton`,
   `createTextInput`, `createRegisteredId`, `createRegisteredElement`, `createTextDirectionWarning`,
   `scrollIntoView`, `composeEventHandlers`, `withDefaults`, `renderElement`, `createKeyboardHandler`
   (the declarative, modifier-aware keymap builder in `utils/`), and `ModalBackdrop` (the pointer-blocking
   third of modality, alongside `createHideOutside` for assistive technology + focus order, and
   `createFocusTrap` for Tab cycling). Side-effectful wiring uses 2.0's split
   `createEffect(depsFn, computeFn)` form and `onSettled`.

   This package is **shipped but internal/advanced**: it serves `@hope-ui/theming` and
   `@hope-ui/components`, and is an escape hatch for advanced consumers building components this
   library doesn't ship. Its signatures may churn between minors. Two consequences the code honours as
   robustness:
   - **No primitive keeps cross-instance state at module scope.** A consumer can end up with two
     installed copies (a plain `dependencies` entry doesn't force deduplication, and
     `@hope-ui/components` carries primitives transitively), and two module-scope counters each
     believing they own the body is an unreproducible field bug. `createScrollLock` and
     `createHideOutside` key their ref counts off `document.body`/the element under a `Symbol.for`,
     which resolves through the cross-realm global symbol registry.
   - The `internal/` behavior primitives need a test but no consumer-facing `.md` contract. The
     composed families (`dialog`, `calendar`, `listbox`, `combobox`, `popover`, `hidden-select`,
     `modal-backdrop`), `render/` and the `utils/` helpers still carry one, since those are the
     surface an advanced consumer composes.

   **Rule:** Popover composes `createFloating` + `createDismissable` + `createPresence` +
   `createFocusRestore` + `createAutoFocus` + `createFocusScope` + `createKeepVisible` — the last
   three are what make it work as a layer *above* an open modal rather than a sibling of one. Dialog composes `createFocusTrap` + `createFocusRestore` +
   `createHideOutside` + `ModalBackdrop` + `createDismissable` + `createScrollLock` +
   `createPresence`. Popover composes the kernel directly rather than routing through Dialog's modal
   machinery. Focus *restore* is deliberately a separate primitive from the focus *trap*: Popover and
   Tooltip are non-modal and need restore without a trap, and welding the two together is precisely
   how a non-modal Dialog came to strand focus on `<body>`.

   **Worked example — where a primitive's state belongs, and why the test environment follows.**
   Dialog's overlay presence must be created *eagerly* and shared by Content + Positioner, so it lives
   in `createDialog` — the **root state hook** — not in `Dialog.Root`. A lazily-mounted part that owns
   its own `createPresence` latches on first run and skips the enter animation. The second-order
   consequence is the one to internalize: `createDialog`'s test had to move from the `unit` project to
   `browser`, and that is the correct direction. **A test running in node is never a reason to keep
   logic in the component layer** — convert the test, don't relocate the behavior. (A per-part,
   eagerly-mounted presence like the backdrop's stays in its own part hook, `createDialogBackdrop`.)

2. **Component wiring kernel** — thin, because 2.0's `createContext` already returns the Provider
   directly and `useContext` already throws when no provider is found. Only a
   `createComponentContext(name)` wrapper for consistent naming/typing, plus optional multi-instance
   keying where genuinely needed (Menu, Select, Accordion, Tabs). Prefer prop/closure passing over
   context entirely for shallow compound components.

3. **Public component API** — compound components (`Dialog.Root`, `Dialog.Trigger`, …) built on
   `solid-js`'s `merge`/`omit`, plus `renderElement` for the render-prop/`as` pattern. Ref merging
   needs no custom utility: `renderElement` collapses the internal and consumer refs into a single
   function ref that delegates flatten/falsy to `applyRef` (`applyRef([internalRef, props.ref],
   element)`), so it works with any render target, not just host elements.

**Async-loaded components** (Combobox with remote options, Toast queues, any "loading…" state): lean
on 2.0's native async support (`createMemo` accepting Promises, `<Loading>`, `isPending`) instead of
hand-rolling resource/loading-state plumbing.

## SSR & hydration requirements (cross-cutting, non-negotiable)

"SSR support" means one concrete thing: **the library works in SolidStart** — renders on the
SolidStart server, hydrates without mismatch, runs on the client. Every primitive and component must
clear it; it is a cross-cutting requirement like the Definition of Done, not a follow-up phase.

`renderElement` → `<Dynamic>` is kept for what it is good at: `as`/render-prop **polymorphism** and
ref merging. `Dynamic` also emits the `_hk` hydration key for whatever it renders (`dynamic()` →
`ssrElement(component, props, undefined, true)` server-side; `sharedConfig.hydrating ?
getNextElement() : createElement(...)` client-side), which the components rendering through it rely
on — pinned in `solid-contract.ssr.test.tsx`.

Concrete rules every primitive/component must follow:

- **No unconditional DOM/`window`/`document` access outside effects.** `createEffect`/`onSettled`
  bodies only run client-side already, so client-only concerns (focus management, scroll lock,
  floating-position calculation, outside-click dismissal) live there naturally rather than needing
  manual `isServer` guards everywhere. Reach for `isServer` (from `@solidjs/web`) only for code that
  isn't naturally effect-gated.
- **IDs used for ARIA linking** (`aria-labelledby`, `aria-describedby`, `aria-controls`) **must be
  generated with `createUniqueId`** — deterministic and SSR-stable. Never `Math.random()`, a
  module-level counter, or anything that can differ server vs client.
- **An ARIA IDREF must never point at an element that isn't in the DOM.** `Dialog.Trigger` emits
  `aria-controls` **only while open**, because `Content` is unmounted while closed. Verified against
  axe-core 4.12: a dangling `aria-controls` reports `aria-valid-attr-value` (as `incomplete`) whether
  `aria-expanded` is `"true"` or `"false"`, and reports nothing once removed. Base UI's
  `DialogTrigger` emits it unconditionally; that is not a reason to follow. Every future component
  with an unmounted popup (Popover, Tooltip, Select) does the same.

  Corollary: **axe must run against the closed state too.** An open-state-only a11y check
  structurally cannot see this class of bug.
- **Portals do NOT degrade gracefully server-side in this `@solidjs/web` beta.** The server build
  (`dist/server.js`) implements `Portal` as `function Portal() { throw new Error("Portal is not
  supported on the server"); }` — calling it during SSR crashes the whole render rather than
  no-opping. Every component that portals content (Dialog's Backdrop/Content) gates its `<Portal>` with
  `isServer` as a plain `if (isServer) return null;` at the top of a small wrapper component — **not**
  a reactive `<Show when={!isServer}>`, since `isServer` is a fixed per-environment constant and a
  plain `if` avoids relying on `Show`'s hydration-key bookkeeping for something that never changes
  within a build. Portaled content is therefore simply absent from the SSR HTML and mounts fresh on
  the client after hydration; `dialog.browser.test.tsx` hydrates genuine server HTML (served fresh by
  the generation bridge), asserts the trigger's DOM node is *reused*, then that clicking it mounts the
  portal client-side. How the `ssr` and `browser` projects cooperate:
  [`testing.md`](testing.md).
- **Focus-trap/scroll-lock/dismissable/floating-position primitives are inherently client-only** and
  are structured so their DOM-touching logic simply doesn't run during SSR (again, via effects)
  rather than crashing or needing manual disabling.

**SolidStart version caveat.** `@solidjs/start`'s most Solid-2.0-aligned release (`2.0.0-alpha.3`)
still depends on `solid-js@^1.9.11`, so real end-to-end SolidStart integration testing is blocked on
their migration, not on anything here. Re-check the registry periodically and add a SolidStart example
once it supports 2.0. SSR/hydration correctness is fully testable and required *now* through
`@solidjs/web`'s framework-agnostic `renderToStringAsync`/`hydrate`.

## How to build, in order

Superseded by [`roadmap.md`](roadmap.md), which defines the current complexity-ordered build order.
The *sequencing principle* still holds: each step is chosen to force the next shared primitive into
existence before scaling to 50+ components.

The one rule not superseded: **each component ships meeting the full Definition of Done before the
next one starts.** "We'll add tests/docs later" is exactly the drift that produces the coverage gaps
this project is designed to avoid.

## Publishing strategy

- **Package granularity:** a small fixed set — `@hope-ui/primitives` (internal behavior kernel),
  `@hope-ui/components` (every public component), the theming pair `@hope-ui/theming` /
  `@hope-ui/presets`, and `@hope-ui/i18n` (the dependency-free locale layer at the bottom of the
  graph, which end users import `I18nProvider` from directly). Every public component is a subpath export of one package
  (`@hope-ui/components/button`, `@hope-ui/components/dialog`, …), so there is no package name to look
  up before importing, while keeping per-component tree-shaking: each subpath is its own build entry
  (see each `package.json`'s `hope.entries`), so importing `@hope-ui/components/button` never pulls in
  Dialog's code. Every component subpath depends only on `@hope-ui/primitives` and, for presentational
  leaves, a sibling subpath — never in a cycle.
- **Entry points:** subpath exports via `package.json#exports` per component rather than one barrel
  (no root `.` export on `@hope-ui/components` at all), plus `"sideEffects": false`.
- **Monorepo tooling:** pnpm workspaces + Turborepo. Skip Nx — even Base UI runs Nx *and* Lerna
  together, more tooling than a greenfield library needs.

## Distribution

- **ESM-only** (no CJS) — Solid is ESM-first; reversible if real CJS demand appears.
- **tsdown** (rolldown + oxc) builds each publishable package to JSX-preserved `.jsx` source + `.d.ts`
  per subpath (multi-entry via each `package.json`'s `hope.entries`). It runs no Solid compiler, so
  the `babel-preset-solid@1.x` hazard that rules out `tsup`/`esbuild-plugin-solid` and
  `unplugin-solid` for JSX *compilation* (`migration-2.0-stable.md` §5) doesn't apply.
  `vite-plugin-solid` is still used for tests and Storybook, which do compile JSX.
- **Changesets** for versioning — fits pnpm workspaces natively, per-package-family changelogs.

## Distribution model — ship source only, under the `"solid"` condition

Each publishable subpath of `@hope-ui/components` and `@hope-ui/primitives` ships **source only**:

- `"solid"` → `dist/<name>/index.jsx` — **JSX-preserved source** (TS stripped, JSX intact).
  `vite-plugin-solid` adds `solid` to Vite's resolve conditions, so any consumer using it (SolidStart,
  and `npm init solid`/create-solid, always do) receives this and compiles it **per environment**:
  `generate: 'ssr'` on the server, `generate: 'dom'` + hydratable on the client. Literal host elements
  therefore compile correctly on each side.
- `"types"` → `dist/<name>/index.d.ts` — the bundled declarations.

There is **no `"import"`/`"default"` (dom-compiled) fallback.** Every SolidJS app is Vite +
`vite-plugin-solid`, so `"solid"` always resolves; a consumer without that plugin gets no matching
condition and fails loudly. A pre-compiled fallback isn't worth shipping (and re-opens the
`babel-preset-solid@1.x` question) until a Solid-2.0-stable toolchain makes it cheap — and the library
isn't published before 2.0 stable anyway.

The build is **tsdown** (rolldown + oxc), configured in `tsdown.config.base.ts` (`createTsdownConfig`,
one `tsdown.config.ts` per package). It runs with `transform.jsx: "preserve"` so oxc keeps JSX intact,
and leaves `solid-js`/`@solidjs/web`/`@hope-ui/*` external (the consumer resolves those —
`@hope-ui/primitives` via *its own* `"solid"` condition). Styling is Tailwind v4 +
`tailwind-variants`, so there is no generated CSS runtime to inline. Entries come from each
`package.json`'s `hope.entries`.

Two build wrinkles worth knowing:

- **dts stays sibling-external.** `deps.neverBundle` keeps `solid-js`/`@solidjs/web`/`@hope-ui/*`
  external in the `.d.ts` too, so the declarations reference siblings by bare specifier and there is
  no `paths`→src leakage.
- **SolidStart consumers may need hope-ui in `ssr.noExternal`.** Server-side, Vite externalizes
  `node_modules` and hands them to Node, which can't parse the `.jsx` we ship. To have the consumer's
  `vite-plugin-solid` compile our source for the server too, list hope-ui in `ssr.noExternal` (`ssr: {
  noExternal: ["@hope-ui/components", "@hope-ui/primitives"] }`). Some setups infer this from the
  `solid` condition; SolidStart wants it explicit.

This is the idiomatic SolidJS-library shape (as used by `@solid-primitives`), minus the dom-compiled
fallback some libraries ship. It is orthogonal to styling: under Tailwind v4 the consumer's own
Tailwind build scans classes, and the recipe layer is unaffected.

## Testing/a11y strategy + Definition of Done

Stack: **GitHub Actions**, **Vitest** (three projects), **Vitest browser mode with Playwright**
(headless-shell in CI: `playwright install --with-deps --only-shell`) — all from day one.

Authoritative DoD: [`definition-of-done.md`](definition-of-done.md). Test-bench mechanics:
[`testing.md`](testing.md).

## Verification checklist for each new phase

Beyond the DoD gate (`pnpm check:coverage-parity` + the three test projects), each phase confirms:

- The "compose, don't inherit" rule holds where applicable — e.g. Popover's source has no import from
  Dialog's module.
- The browser tests exercise real focus behavior where relevant (Dialog: focus trap,
  restore-on-close; Listbox/Select: arrow-key navigation, typeahead) — exactly the interactions jsdom
  can't validate.
- A throwaway consumer app (Vite + solid-js) importing via subpath exports, with bundle analysis
  confirming that importing one component doesn't pull in another's code.
