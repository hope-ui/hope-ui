# hope-ui: architecture plan and roadmap

## Status

**Nothing is published until SolidJS 2.0 ships stable.** The release model is: build on the
pinned beta → wait for stable → fix the beta→stable breakage → publish 1.0. Everything that
must happen at that boundary is tracked in `__internal__/migration-2.0-stable.md`, not in comments.

Current component/primitive status is **not** tracked here — see
[`__internal__/roadmap.md`](roadmap.md), which supersedes the phase ordering below.

**Decisions this project reversed under measurement** — the part of the history that still binds,
because each was a recorded "fact" that was actively instructing the next person:

- **The single pre-compiled `generate: 'dom'` build, and the "no literal host JSX element" rule it
  spawned.** Both retired; the library ships source under the `"solid"` condition. See "SSR &
  hydration requirements" below and `__internal__/migration-2.0-stable.md` §3.
- **Dialog's hydration root cause.** Neither "separate Vite projects → different module instances"
  nor "the `_$HY.r` registry is empty". It was a half-complete alias rendering "server" HTML with the
  *browser* `createUniqueId`. Full diagnosis: `__internal__/migration-2.0-stable.md` §4; the test
  bench that resulted: `__internal__/testing.md`.
- **"Sibling effect cleanups are never reversed."** They are — LIFO on owner disposal, creation
  order on re-run. `createFocusRestore` depends on both halves; pinned in `solid-contract.test.ts`.
- **`@solid-primitives/controlled-signal` "breaks hydration".** A harness-config artifact (an
  externalized dep escaping the server-build alias), not a defect. See
  `__internal__/solid-primitives-eval.md`.
- **`Dialog.Trigger` should emit `aria-controls` unconditionally**, on the grounds that Base UI does.
  Wrong — verified against axe-core 4.12; it emits it only while open. See the ARIA IDREF rule below.

**Two structural detours worth knowing about**, since their reasoning still constrains the build:
the pipeline left `tsup`/`esbuild-plugin-solid` because it could not compile a JSX `ref` at all under
solid-js 2.0 (root cause under "SolidJS 2.0" in `CLAUDE.md`, §5 of the migration doc); and the
original `@hope-ui/core` + `@hope-ui/button` packages were renamed/absorbed into
`@hope-ui/primitives` + `@hope-ui/components` (see "Publishing strategy").

**Key implementation findings from Phase 0** (verified against the actual installed
`2.0.0-beta.16` packages, not from docs/memory — see `CLAUDE.md` for the concise
version):
- DOM rendering (`render`, `Dynamic`, `Portal`, `JSX` types) moved out of `solid-js`
  into a separate **`@solidjs/web`** package; `jsxImportSource` and the
  `solid.moduleName` option (for `esbuild-plugin-solid`/`vite-plugin-solid`, which both
  still default to `"solid-js/web"`) must point there.
- `mergeProps`/`splitProps` are gone; the 2.0 idiom is `merge`/`omit` from `solid-js`.
  But `merge` resolves keys by *presence*, so it is the wrong tool for defaults — use
  `withDefaults` (`__internal__/primitives/utils/defaults.md`). See CLAUDE.md.
- Hit a real bug: Vite's `solid-refresh` HMR wrapper silently broke prop forwarding
  (`children` vanished) for components imported from another module, but not for the
  same component defined inline in a test file. Fixed with `refresh: { disabled: true }`
  in the shared Solid plugin options (`solid-babel-options.ts`) — tests don't need HMR,
  and Storybook doesn't get it either until a story proves it's safe.
- Confirmed a genuine, unavoidable type-system limit for the render-prop/`as` pattern:
  a component's `render` callback can't be soundly typed for an arbitrary target
  element without full generics (the `Polymorphic<T>` cost this project is explicitly
  trying to avoid). Documented in `__internal__/primitives/render/render.md` rather than
  papered over — an explicit type-assertion escape hatch is used at the one call site that
  needs cross-element rendering.

## Reference policy

- **Base UI and React Aria: active, legitimate references.** Use their code and
  reasoning freely when designing hope-ui's public API and accessibility behavior
  (e.g. the `render`/`useRender` pattern, ARIA keyboard-interaction logic). Don't do a
  byte-per-byte copy when a from-scratch Solid idiom is straightforward — but if a
  literal port from either is genuinely unavoidable, add an attribution comment at the
  top of the file (e.g. "Portions of this file are based on code from react-spectrum").
- **`@solid-primitives` (`next`): adopt as a dependency, don't just reference.** It's the
  community, SolidJS-team-adjacent low-level library. Before building a new internal
  primitive, check it first and record an *adopt / wrap / build-fresh-because* verdict.
  Anything adopted is full-DoD-wrapped through its consumer — above all the hydration
  round-trip. Hazard: a `node_modules` primitive creating a compute-form signal/memo isn't
  compiled by our Solid pipeline, so the server drops a hydration id the client still
  consumes and `_hk` diverges — this rejected `controlled-signal` (kept our zero-dep,
  more-capable boxing impl). Full practice, the hydration-id hazard, and current per-package
  verdicts live in `__internal__/solid-primitives-eval.md`.

## Context

`hope-ui` is a Base UI / React Aria–inspired, **elegant, themeable**, accessible
component library for SolidJS — copying their **API surface** (prop patterns, composition idioms)
but not their React internals. Ready-to-use, themeable components (a full-featured, Tailwind-v4 +
tailwind-variants system — see [`__internal__/roadmap.md`](roadmap.md)) are the product; they are built over an **internal**
headless behavior kernel (`@hope-ui/primitives`). That kernel is an implementation detail and an
advanced escape hatch, **not** a stability-promised public API — see "Recommended architecture"
below.

**"SSR support" = "works in SolidStart."** Renders on the SolidStart server, hydrates
without mismatch, runs on the client. That is the whole requirement — not a broader,
self-imposed invariant. Every primitive and component must clear it; it is a
cross-cutting, non-negotiable requirement like the Definition of Done, not a follow-up
phase. See "SSR & hydration requirements" below for the concrete (and deliberately small)
set of rules that protect it, the "Distribution model" section for how shipping source
keeps it true without constraining how components are written, and a caveat about
SolidStart's current version alignment.

**Target runtime: SolidJS 2.0 (beta, first public build `v2.0.0-beta.0`, March 2026) —
not 1.x.** This is a meaningful architectural input, not a version bump: 2.0 reworks
reactivity (`@solidjs/signals` as a standalone reactive core decoupled from the UI/JSX
layer, deterministic microtask batching), stores (draft-first mutable setters,
`createProjection` for read-only derived stores, `storePath()` as an opt-in path-style
helper), effects (`createEffect` split into separate compute/apply), lifecycle
(`onMount` → `onSettled`), context (`createContext` returns the Provider component
directly, `useContext` throws by default when no provider is found), refs (native array
flattening via `applyRef`, no `mergeRefs` needed), and async (native Promise support in `createMemo`,
`<Loading>`, `isPending`, `action`/`createOptimisticStore`). It's beta and
`@solidjs/signals` is explicitly still "stabilizing but may have breaking changes
before final release" — the exact beta version is pinned via the `pnpm-workspace.yaml`
catalog, and any future churn should be contained behind the Layer A kernel boundary
(see architecture section) rather than letting every component touch raw signals/store
APIs directly.

To ground the analysis in fact rather than recollection, the following reference repos
were cloned and inspected directly during planning (read-only, then deleted):
- `mui/base-ui` — single `@base-ui/react` package (the actual "Base UI";
  `github.com/base/ui` is Coinbase's unrelated app repo — ruled out during research)
- `adobe/react-spectrum` (`packages/react-aria`, `packages/@react-stately/*`)

## Confirmed anti-patterns to avoid

Structural pitfalls observed in existing headless SolidJS component libraries. These are the
concrete failure modes this project's architecture is designed to prevent — stated on their own
merits, so the design rules stand without reference to any specific library:

- **Per-component context boilerplate.** One bespoke `XContext` + `XContextValue` type +
  `useXContext` hand-rolled per component family, with no shared context-factory kernel,
  multiplies boilerplate and drifts out of consistency (e.g. components integrating a shared
  `FormControlContext` in subtly different ways). hope-ui uses one `createComponentContext`
  factory instead.
- **One giant package.** A single package holding every component gives no independent
  release/versioning blast-radius control — hence the per-component subpath exports here.
- **Inconsistent or absent test coverage.** Coverage that skips exactly the highest a11y-risk,
  keyboard/floating components (`popover`, `tooltip`, `menu`, `dropdown-menu`,
  `navigation-menu`, `hover-card`, `slider`, `dismissable-layer`), or is missing entirely,
  leaves no regression safety net — hence the enforced Definition of Done and
  `check:coverage-parity`.
- **`Polymorphic`/`PolymorphicProps<T>` generic `as`-prop machinery** is a known type-DX pain
  point when consumers wrap components in their own polymorphic layer — hope-ui hit a version
  of this exact tension in Phase 0 (see Status above), and uses `renderElement` instead.
- **Coupling a component's *behavior* to a heavier sibling** rather than the shared kernel
  (e.g. Popover or Drawer wiring their overlay behavior through Dialog). Popover/Drawer aren't
  semantically "a kind of Dialog" — such coupling ties their behavior to Dialog's internals and
  forces every non-modal floating consumer to pull in Dialog's full machinery (scroll-lock,
  pinch-zoom prevention, focus-restore) even when unused. Popover composes the shared kernel
  directly. (Reusing a *presentational leaf* like `CloseButton` across components is fine and
  encouraged — the anti-pattern is behavioral coupling and circular imports, not reuse.)
- **Per-package context boilerplate.** A dual public/internal context pair plus a bespoke
  keyed-context string-registry hand-rolled per package is the same boilerplate multiplication,
  relocated from per-component to per-package.

**Validating evidence for going Solid-native, from Base UI (active reference, best-funded
of the references):** Base UI's own React team built a hand-rolled external `Store` class
(`packages/utils/src/store/Store.ts`) — `subscribe`/`getSnapshot`/`setState`/
selector-based `use()` — plus a custom `useSyncExternalStore` wrapper and a "fastHooks"
instance registry, specifically to get fine-grained, selector-scoped updates and dodge
context/re-render cost. That is, structurally, a hand-built signal system. Solid's
`createStore`/`createSignal`/`createMemo` give you this for free — building an
equivalent indirection layer in Solid would be pure waste. Base UI also has real test
density (273 test files / ~44 components) and a clean single `useRender` hook for the
render-prop/`asChild` composition pattern — hope-ui's `renderElement` is modeled on
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

1. **Behavior kernel** (`@hope-ui/primitives`, **internal/advanced — not a public product**,
   never duplicated) — Solid 2.0 primitives, not hooks, built directly on `@solidjs/signals`/stores. The
   **list-navigation kernel** is a set of fine-grained, Angular-Aria-aligned primitives (its
   signal-based `private/behaviors` port almost 1:1 to Solid; react-aria's `selection` is the
   edge-case checklist, not the source — full map in
   [`__internal__/reference-implementations.md`](reference-implementations.md)):
   - `createCollection` / `createVirtualCollection` — the **item-source seam**: a DOM-order
     registry (`compareDocumentPosition`-sorted, over `createRegisteredElement`) and a
     `@tanstack/virtual-core` binding whose `items()` is the full data while `element` resolves
     only for the mounted window. A behavior reads either interchangeably.
   - `createListFocus` — the **foundation**: the active item + the `roving | activedescendant`
     switch, deferring real `.focus()` until the item's element exists (shared by the
     virtualized and activedescendant paths).
   - `createListNavigation` / `createListTypeahead` / `createListSelection` /
     `createListExpansion` / `createGridNavigation` — each injects one `createListFocus` (grid
     over a 2D cell collection), exactly as Angular injects one `ListFocus`.

   Alongside these: `createFocusTrap`, `createFocusRestore`, `createHideOutside`,
   `createDismissable`, `createFloating` (wraps `@floating-ui/dom`), `createScrollLock`,
   `createPresence`, `createControllableState`, `createRegisteredId`, `composeEventHandlers`,
   `withDefaults`, `renderElement`, `createKeyboardHandler` (the declarative, modifier-aware
   keymap builder in `utils/`), and `ModalBackdrop` (the one component in the kernel: the
   pointer-blocking third of modality, alongside `createHideOutside` for assistive technology +
   the focus order, and `createFocusTrap` for Tab cycling), plus `createRegisteredElement`.
   Side-effectful wiring should use 2.0's split
   `createEffect(depsFn, computeFn)` form and `onSettled` (not `onMount`, which no longer
   exists in 2.0).

   This package is **shipped but internal/advanced**: it exists to serve `@hope-ui/theming`
   and `@hope-ui/components`, and is available as an escape hatch for advanced consumers who
   want to build components this library doesn't ship. Its signatures are **not** a
   stability-promised public contract and may churn between minors — headless composition is no
   longer the marketed path (themeable components are). Two consequences the code still honours,
   now as robustness rather than a public-API mandate:
   - **No primitive keeps cross-instance state at module scope.** A consumer can still end up
     with two installed copies (a plain `dependencies` entry doesn't force deduplication, and
     `@hope-ui/components` carries primitives transitively), and two module-scope counters each
     believing they own the body is an unreproducible field bug. `createScrollLock` and
     `createHideOutside` key their ref counts off `document.body`/the element under a
     `Symbol.for`, which resolves through the cross-realm global symbol registry. Cheap to keep;
     worth keeping.
   - The `internal/` behavior primitives need a test but no longer a consumer-facing `.md`
     contract (`check:coverage-parity` no longer requires one for them). The composed families
     (`dialog`, `calendar`, `i18n`, `modal-backdrop`) and the `utils/` helpers still carry a
     colocated `.md`, since those are the surface an advanced consumer actually composes.

   **Rule:** Popover composes `createFloating` + `createDismissable` + `createPresence` +
   `createFocusRestore`. Dialog composes `createFocusTrap` + `createFocusRestore` +
   `createHideOutside` + `ModalBackdrop` + `createDismissable` + `createScrollLock` +
   `createPresence`. Popover composes the kernel directly rather than routing its behavior through
   Dialog's modal machinery — the anti-pattern above is behavioral coupling (and circular imports),
   not reusing a presentational leaf like `CloseButton`. Note that focus *restore* is deliberately a separate primitive from
   the focus *trap*: Popover and Tooltip are non-modal and need restore without a trap, and
   welding the two together is precisely how a non-modal Dialog came to strand focus on
   `<body>`.

   **Worked example — where a primitive's state belongs, and why the test environment follows.**
   Dialog's overlay presence must be created *eagerly* and shared by Content + Positioner, so it
   lives in `createDialog` — the **root state hook** — not in `Dialog.Root`. A lazily-mounted part
   that owns its own `createPresence` latches on first run and skips the enter animation. The
   consequence to internalize is the second-order one: `createDialog`'s test had to move from the
   `unit` project to `browser` as a result, and that is the correct direction. **A test running in
   node is never a reason to keep logic in the component layer** — convert the test, don't relocate
   the behavior. (A per-part, eagerly-mounted presence like the backdrop's stays in its own part
   hook, `createDialogBackdrop`.)

2. **Component wiring kernel** — thinner than under 1.x, because 2.0's `createContext`
   already returns the Provider component directly and `useContext` already throws by
   default when no provider is found. Only needs a thin `createComponentContext(name)`
   wrapper for consistent naming/typing, plus optional multi-instance keying where
   genuinely needed (Menu, Select, Accordion, Tabs). Prefer prop/closure passing over
   context entirely for shallow compound components.

3. **Public component API** — compound components (`Dialog.Root`, `Dialog.Trigger`, …)
   built on `solid-js`'s `merge`/`omit` (2.0's replacements for `mergeProps`/
   `splitProps`), plus `renderElement` (in `@hope-ui/primitives`) for the render-prop/`as`
   pattern. Ref merging needs no custom utility — `renderElement` collapses the internal and
   consumer refs into a single function ref that delegates flatten/falsy to `applyRef`
   (`applyRef([internalRef, props.ref], element)`), so it works with any render target, not just
   host elements.

**Async-loaded components** (Combobox with remote options, Toast queues, any
"loading…" state): lean on 2.0's native async support (`createMemo` accepting
Promises, `<Loading>`, `isPending`) instead of hand-rolling resource/loading-state
plumbing.

## SSR & hydration requirements (cross-cutting, non-negotiable)

"SSR support" means one concrete thing: **the library works in SolidStart** — it renders
on the SolidStart server, hydrates without mismatch, and runs on the client. Everything
below is the small, genuine set of rules that protects that. There is no broader,
self-imposed SSR invariant.

> **Corrected (twice).** An earlier version claimed one `generate: 'dom'` build works
> everywhere because `@solidjs/web` "exposes the same exported function names per
> environment." That is false: the **server** build exports `template`/`insert`/`spread`/
> `setAttribute` as `notSup` stubs that throw *"Client-only API called on the server side"*,
> and a single pre-compiled `generate: 'dom'` build hoists a `_$template()` call to module
> scope, so a literal `<div>` would throw at *import* under SSR. The follow-up "correction"
> then promoted **"no source file may contain a literal host JSX element"** to a load-bearing
> invariant, enforced by a `dist`-import grep. That, too, was an over-reach: the crash is a
> property of shipping a **single pre-compiled dom build**, not of SSR itself. The fix is a
> distribution change, not a coding rule — see "Distribution model" below. The library now
> ships JSX-preserved source under the `"solid"` export condition, the consumer's
> `vite-plugin-solid` compiles each element per environment, and **literal host elements are
> fine.** The grep (`scripts/check-dist-imports.mjs`) and the invariant are both gone.

`renderElement` → `<Dynamic>` is kept, but for what it is actually good at: `as`/render-prop
**polymorphism** and ref merging. `Dynamic` also emits the `_hk` hydration key for whatever
it renders (`dynamic()` → `ssrElement(component, props, undefined, true)` server-side;
`sharedConfig.hydrating ? getNextElement() : createElement(...)` client-side), which the
components that render through it rely on — pinned in `solid-contract.ssr.test.tsx`. It is no
longer a mandatory per-element SSR wrapper.

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
- **An ARIA IDREF must never point at an element that isn't in the DOM.** `Dialog.Trigger`
  therefore emits `aria-controls` **only while open**, because `Popup` is unmounted while
  closed. The audit originally decided the opposite, on the grounds that Base UI's
  `DialogTrigger` emits it unconditionally; that reasoning was wrong. Verified against
  axe-core 4.12: a dangling `aria-controls` reports `aria-valid-attr-value` (as `incomplete`)
  whether `aria-expanded` is `"true"` or `"false"`, and reports nothing once removed. Every
  future component with an unmounted popup (Popover, Tooltip, Select) does the same.

  Corollary: axe must run against the **closed** state too. An open-state-only a11y check
  structurally cannot see this class of bug — which is exactly why it survived Phase 0.
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

  Verified for real: `dialog.browser.test.tsx` hydrates genuine server HTML (served fresh by the
  generation bridge) and asserts the trigger's DOM node is *reused*, then that clicking it mounts
  the portal client-side. See `__internal__/testing.md` for how the `ssr` and `browser` projects cooperate.
- **Focus-trap/scroll-lock/dismissable/floating-position primitives are inherently
  client-only** and should be structured so they simply don't run their DOM-touching
  logic during SSR (again, via effects) rather than crashing or needing to be manually
  disabled.

**SolidStart version caveat (checked directly against the npm registry, not assumed):**
as of this writing, `@solidjs/start`'s most Solid-2.0-aligned release
(`2.0.0-alpha.3`) still depends on `solid-js@^1.9.11`, not 2.0 — SolidStart itself has
not yet migrated. This means **real end-to-end SolidStart integration testing is
currently blocked** on their migration, not on anything in this project. Don't treat
"no SolidStart example app yet" as a hope-ui gap; re-check `@solidjs/start`'s
registry versions periodically and add a real SolidStart example once it supports 2.0.
In the meantime, SSR/hydration correctness is fully testable and required *now* using
`@solidjs/web`'s own framework-agnostic `renderToStringAsync`/`hydrate` directly (see
DoD below) — this doesn't depend on SolidStart at all.

## How to build, in order

> **Superseded** by [`__internal__/roadmap.md`](roadmap.md), which defines the current
> complexity-ordered build order (a surface aggregated from Mantine/MUI/Ant/shadcn/Nuxt plus the
> kernel primitives still needed). The original repo-creation ordering was Button → Dialog →
> Popover/Tooltip → Listbox, each step chosen to force the next shared primitive into existence
> before scaling to 50+ components — that *sequencing principle* still holds even though the list
> doesn't.

The one rule from this section that is not superseded: **each component ships meeting the full
Definition of Done before the next one starts.** Don't let "we'll add tests/docs later" creep in —
that is exactly the drift that produces the coverage gaps this project is designed to avoid.

## Publishing strategy

- **Package granularity (revised from the original family-package plan):** a small fixed set
  of packages — `@hope-ui/primitives` (internal behavior kernel), `@hope-ui/components` (every
  public component), and the theming pair `@hope-ui/theming` / `@hope-ui/presets` — **not** a
  single one-giant-package, not a spread of
  15+ micro-packages with sibling deps, and not the shared-primitive-family split
  (`@hope-ui/overlays`, `@hope-ui/collections`, `@hope-ui/forms`,
  `@hope-ui/disclosure`) originally planned here. (An earlier revision of this doc said "two
  packages total"; the themeable direction added the theming pair — see
  [`__internal__/theming.md`](theming.md).) `@hope-ui/primitives` for the
  behavior kernel (never duplicated), and a single `@hope-ui/components` package for
  every public component, each as its own subpath export
  (`@hope-ui/components/button`, `@hope-ui/components/dialog`, ...). The
  family-package plan required remembering which family package a given component
  shipped from before you could install/import it (`overlays` vs. `collections` vs.
  `forms`); a single package name with per-component subpaths removes that lookup while
  keeping the same per-component tree-shaking a family package would have given —
  importing `@hope-ui/components/button` never pulls in Dialog's code, since each
  subpath is its own build entry (see each `package.json`'s `hope.entries`). Every
  component subpath depends only on `@hope-ui/primitives` — never on another
  component's subpath, which is what keeps this from becoming a single giant barrel
  package in spirit despite sharing one package in name.
- **Entry points:** subpath exports via `package.json#exports` per component rather
  than one barrel re-exporting everything (no root `.` export on
  `@hope-ui/components` at all), plus `"sideEffects": false`.
- **Monorepo tooling:** pnpm workspaces + Turborepo. Skip Nx — even Base UI itself runs
  Nx *and* Lerna together, more tooling than a greenfield library needs.

## Distribution

- **ESM-only** (no CJS) — Solid is ESM-first; reversible decision if real CJS demand
  appears later.
- **tsdown** (rolldown + oxc) builds each publishable package to JSX-preserved `.jsx` source
  + `.d.ts` per subpath (multi-entry via each `package.json`'s `hope.entries`) — see
  "Distribution model" below. It runs no Solid compiler, so the `babel-preset-solid@1.x`
  hazard that rules out `tsup`/`esbuild-plugin-solid` and `unplugin-solid` for JSX
  *compilation* (see the `esbuild-plugin-solid` writeup above and
  `__internal__/migration-2.0-stable.md` §5) doesn't apply. `vite-plugin-solid` is still used for the
  tests and Storybook, which do compile JSX.
- **Changesets** for versioning — fits pnpm workspaces natively, per-package-family
  changelogs.

## Distribution model — ship source only, under the `"solid"` condition

Each publishable subpath of `@hope-ui/components` and `@hope-ui/primitives` ships **source
only** — no dom-compiled fallback:

- `"solid"` → `dist/<name>/index.jsx` — **JSX-preserved source** (TS stripped, JSX intact).
  `vite-plugin-solid` adds `solid` to Vite's resolve conditions, so any consumer using it
  (SolidStart, and `npm init solid`/create-solid, always do) receives this and compiles it
  **per environment**: `generate: 'ssr'` on the server, `generate: 'dom'` + hydratable on the
  client. Literal host elements therefore compile correctly on each side — the reason the old
  "no literal host JSX element" rule is gone.
- `"types"` → `dist/<name>/index.d.ts` — the bundled declarations.

There is **no `"import"`/`"default"` (dom-compiled) fallback.** Every SolidJS app is Vite +
`vite-plugin-solid`, so `"solid"` always resolves; a consumer without that plugin gets no
matching condition and fails loudly. A pre-compiled fallback isn't worth shipping (and re-opens
the `babel-preset-solid@1.x` question) until a Solid-2.0-stable toolchain makes it cheap — the
library isn't published before 2.0 stable anyway.

The build is **tsdown** (rolldown + oxc), configured in `tsdown.config.base.ts`
(`createTsdownConfig`, one `tsdown.config.ts` per package). It runs with
`transform.jsx: "preserve"` so oxc keeps JSX intact, and leaves
`solid-js`/`@solidjs/web`/`@hope-ui/primitives` external (the consumer resolves those —
`@hope-ui/primitives` via *its own* `"solid"` condition). Styling is **Tailwind v4 +
`tailwind-variants`**, so there is no generated CSS runtime to inline. It runs
**no Solid compiler**, so the `babel-preset-solid@1.x` hazard that rules out
`tsup`/`esbuild-plugin-solid`/`rollup-preset-solid`/`unplugin-solid` for *compilation* is moot
here. Entries come from each `package.json`'s `hope.entries`.

Two build wrinkles worth knowing:
- **dts stays sibling-external.** `deps.neverBundle` keeps
  `solid-js`/`@solidjs/web`/`@hope-ui/primitives` external in the `.d.ts` too, so the declarations
  reference siblings by bare specifier and there's no `paths`→src leakage (the old
  `vite-plugin-dts` `paths: {}` hazard is gone). *(Historically this list also excluded
  `@pandacss/*` + its `pkg-types`/`typescript` tail, because the styled-system types the `.d.ts`
  inlined reached them — moot since the Panda runtime was removed.)*
- **SolidStart consumers may need hope-ui in `ssr.noExternal`.** Server-side, Vite externalizes
  `node_modules` and hands them to Node — which can't parse the `.jsx` we ship. To have the
  consumer's `vite-plugin-solid` compile our source for the server too, list hope-ui in
  `ssr.noExternal` (e.g. `ssr: { noExternal: ["@hope-ui/components", "@hope-ui/primitives"] }`).
  Some setups infer this from the `solid` condition; SolidStart historically wants it explicit.

This is the idiomatic SolidJS-library shape (as used by `@solid-primitives`),
minus the dom-compiled fallback some libraries ship. It retires the literal-element rule and its `check:dist-imports`
tripwire. It is orthogonal to styling: under Tailwind v4 the consumer's own Tailwind build scans
classes, and the multi-theme recipe layer is unaffected.

## `/jsx` and `/patterns` (superseded — Panda removed)

> **Historical.** This section recorded why hope-ui banned Panda's generated `/jsx` factory while
> reusing its pure `/patterns` helpers (`flex.raw`, `getFlexStyle`). Panda and the generated
> `@hope-ui/styled-system` runtime have since been **removed** in favor of **Tailwind v4 +
> `tailwind-variants`**, and the `Box`/`Flex` layout primitives are gone (consumers compose layout
> with Tailwind utilities). None of the `/jsx`-vs-`/patterns` reasoning applies anymore; it is kept
> only as a record of the earlier decision. Current styling model: [`__internal__/theming.md`](theming.md).

## Testing/a11y strategy + Definition of Done

Stack: **GitHub Actions**, **Vitest** (three projects), **Vitest browser mode with Playwright**
(headless-shell in CI: `playwright install --with-deps --only-shell`) — all from day one.

The DoD itself moved out of this file once it became mechanically enforced. **Authoritative:
[`__internal__/definition-of-done.md`](definition-of-done.md)**, with the test-bench mechanics in
[`__internal__/testing.md`](testing.md). (The version that used to sit here predated enforcement —
it described the `.md` doc as colocated in `src/` and the SSR/hydration round-trip as "not yet
mechanically enforced, treat as a manual review requirement". Both are false now:
`check:coverage-parity` enforces the round-trip, and docs live under `__internal__/<pkg>/`.)

## Verification checklist for each new phase

Beyond the DoD gate (`pnpm check:coverage-parity` + the three test projects), each phase confirms:

- The "compose, don't inherit" rule holds where applicable — e.g. Popover's source has no import
  from Dialog's package/module.
- The browser tests exercise real focus behavior where relevant (Dialog: focus trap,
  restore-on-close; Listbox/Select: arrow-key navigation, typeahead) — exactly the interactions
  jsdom can't validate.
- Once package grouping exists: a throwaway consumer app (Vite + solid-js) importing via subpath
  exports, with bundle analysis confirming that importing one component doesn't pull in another's
  code.
