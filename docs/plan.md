# enara-ui: architecture plan and roadmap

## Status (as of Phase 1 in progress — Dialog's shared primitives complete)

**Phase 0 is complete and merged to `develop`.** In place: pnpm + Turborepo workspace,
`@enara-ui/primitives` (behavior kernel — at the time, just `renderElement`),
`@enara-ui/components/button` (first real component), `@enara-ui/internal-test-utils`
(shared `mount` + `expectNoA11yViolations` harness), GitHub Actions CI (lint → build →
typecheck → Vitest unit + Playwright browser tests → Storybook build → coverage/doc/story
parity check), Changesets. Full pipeline verified green locally, including the
coverage-parity script's fail/pass behavior.

> Phase 0 shipped as `@enara-ui/core` + `@enara-ui/button`; both were later renamed and
> absorbed (see "Publishing strategy"). Names above are the current ones.

**Nothing is published until SolidJS 2.0 ships stable.** The release model is: build on the
pinned beta → wait for stable → fix the beta→stable breakage → publish 1.0. Everything that
must happen at that boundary is tracked in `docs/migration-2.0-stable.md`, not in comments.

**Phase 1, step 2 (Dialog) is complete**, and `@enara-ui/primitives` gained
`createComponentContext`, `createFocusTrap`, `createDismissable`, `createScrollLock`,
`createPresence`, and `withDefaults` — all built fresh (Base UI/React Aria as behavior
reference, per the reference policy below), all with tests + docs. Building these forced a
significant, unplanned but necessary detour: the build pipeline moved from
`tsup`/`esbuild-plugin-solid` to Vite library mode/`vite-plugin-solid@3.0.0-next.5`,
because the old pipeline could not compile a JSX `ref` attribute at all under solid-js 2.0
(see "SolidJS 2.0 (beta) — API differences" in `CLAUDE.md` for the full root-cause
writeup). A second restructure followed: `@enara-ui/core` was renamed to
`@enara-ui/primitives`, and `@enara-ui/button` was absorbed into a new
`@enara-ui/components` package (one subpath export per component). See "Publishing
strategy" for the full rationale.

**An audit then reshaped the public API before Popover could copy its mistakes.** The
`render` prop is function-only (a JSX element could only ever *drop* the computed props);
`renderElement` owns ref merging; defaults go through `withDefaults` rather than `merge`;
and a component's internal ARIA values fall back to the consumer's rather than overwriting
them. Storybook is now the visual harness, with a story required per component.

**The kernel has since been reshaped, and Popover is unblocked.** Focus *restore* is its own
primitive (Popover and Tooltip are non-modal and need restore without a trap); modal dialogs
are genuinely inert (`createHideOutside` applies `aria-hidden` + `inert`, `ModalBackdrop`
blocks the pointer); `createScrollLock`'s ref count moved off module scope; and
`composeEventHandlers` / `createControllableState` / `createRegisteredId` /
`createRegisteredElement` were lifted out of `dialog.tsx`, which now owns no helper a second
component would want. `Dialog.Trigger` emits `aria-controls` only while open, and respects
`event.preventDefault()` as a cancel channel.

**The migration insurance is now in place.** The `solid-contract.*` tests pin every
undocumented `solid-js`/`@solidjs/web` behavior this codebase leans on, each naming the code
that depends on it. The browser suite emitted 170 `STRICT_READ_UNTRACKED` warnings; it now
emits zero, and `mount()` fails any test that produces one (or a
`REACTIVE_WRITE_IN_OWNED_SCOPE`). `check:dist-imports` enforces the no-literal-host-JSX
invariant SSR silently depends on. `expectNoA11yViolations` no longer drops axe's `incomplete`
results, `check:coverage-parity` no longer accepts a `renderToStringAsync` mention in a comment
or an `it.skip`, and `passWithNoTests` is gone.

**The test bench was then restructured, and the hydration gap closed.** There are now three
Vitest projects with one job and one module resolution each — `unit` (node, no DOM, client
builds), `ssr` (node, **server** builds of both `solid-js` and `@solidjs/web`), `browser` (real
Chromium). The old two-project layout had SSR tests squatting in the `unit` project behind a
half-complete alias, which rendered "server" HTML using the *browser* `createUniqueId`. That
hybrid — not module instances, not the `_$HY` bootstrap — is what made Dialog's hydration test
impossible. Both `Button` and `Dialog` now have real SSR → hydrate round-trips against
committed fixtures; nothing is `it.skip`'d. See `docs/testing.md`, and
`docs/migration-2.0-stable.md` §4 for the two disproved theories.

Three recorded "facts" were corrected against measurement rather than inherited: the SSR
rationale below, Dialog's hydration root cause, and the claim that sibling effect cleanups are
never reversed (they are, on owner disposal).

Remaining before SolidJS 2.0 stable lands: Popover + Tooltip (Phase 1, step 3), then the
migration itself.

**Key implementation findings from Phase 0** (verified against the actual installed
`2.0.0-beta.16` packages, not from docs/memory — see `CLAUDE.md` for the concise
version):
- DOM rendering (`render`, `Dynamic`, `Portal`, `JSX` types) moved out of `solid-js`
  into a separate **`@solidjs/web`** package; `jsxImportSource` and the
  `solid.moduleName` option (for `esbuild-plugin-solid`/`vite-plugin-solid`, which both
  still default to `"solid-js/web"`) must point there.
- `mergeProps`/`splitProps` are gone; the 2.0 idiom is `merge`/`omit` from `solid-js`.
  But `merge` resolves keys by *presence*, so it is the wrong tool for defaults — use
  `withDefaults` (`packages/primitives/src/utils/defaults/defaults.md`). See CLAUDE.md.
- Hit a real bug: Vite's `solid-refresh` HMR wrapper silently broke prop forwarding
  (`children` vanished) for components imported from another module, but not for the
  same component defined inline in a test file. Fixed with `refresh: { disabled: true }`
  in the shared Solid plugin options (`solid-babel-options.ts`) — tests don't need HMR,
  and Storybook doesn't get it either until a story proves it's safe.
- Confirmed a genuine, unavoidable type-system limit for the render-prop/`as` pattern:
  a component's `render` callback can't be soundly typed for an arbitrary target
  element without full generics (the `Polymorphic<T>` cost this project is explicitly
  trying to avoid). Documented in `packages/primitives/src/utils/render/render.md` rather than
  papered over — an explicit type-assertion escape hatch is used at the one call site that
  needs cross-element rendering.

## Reference policy (important, corrects an earlier misstep in this plan's own history)

- **Kobalte and Corvu: anti-pattern references only.** Never copy their code or
  "keep the shape of" anything from either, even in spirit. The user is Kobalte's
  original author and a Corvu contributor, and has explicitly called out both as bad
  references to design from — cite them only as pitfall case studies (backed by direct
  source inspection, not recollection).
- **Base UI and React Aria: active, legitimate references.** Use their code and
  reasoning freely when designing enara-ui's public API and accessibility behavior
  (e.g. the `render`/`useRender` pattern, ARIA keyboard-interaction logic). Don't do a
  byte-per-byte copy when a from-scratch Solid idiom is straightforward — but if a
  literal port from either is genuinely unavoidable, add an attribution comment at the
  top of the file, the same way Kobalte itself credits react-spectrum ("Portions of
  this file are based on code from react-spectrum").
- **`@solid-primitives` (`next`): adopt as a dependency, don't just reference.** It's the
  community, SolidJS-team-adjacent low-level library. Before building a new internal
  primitive, check it first and record an *adopt / wrap / build-fresh-because* verdict.
  Anything adopted is full-DoD-wrapped through its consumer — above all the hydration
  round-trip. Hazard: a `node_modules` primitive creating a compute-form signal/memo isn't
  compiled by our Solid pipeline, so the server drops a hydration id the client still
  consumes and `_hk` diverges — this rejected `controlled-signal` (kept our zero-dep,
  more-capable boxing impl). Full practice, the hydration-id hazard, and current per-package
  verdicts live in `docs/solid-primitives-eval.md`.

## Context

`enara-ui` is a Base UI / React Aria–inspired headless, accessible component library
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
  enara-ui hit a version of this exact tension in Phase 0 (see Status above).

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
render-prop/`asChild` composition pattern — enara-ui's `renderElement` is modeled on
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

1. **Behavior kernel** (`@enara-ui/primitives`, **public API**, never duplicated) — Solid
   2.0 primitives, not hooks, built directly on `@solidjs/signals`/stores:
   `createListState`/`createSelectionState`/`createCollection` (port react-stately's
   *algorithms* directly from react-stately, not from Kobalte's port of them) as
   **stores** using 2.0's draft-first setters and `createProjection` for derived views,
   `createFocusTrap`, `createFocusRestore`, `createHideOutside`, `createDismissable`,
   `createRovingFocus`/`createTypeahead` (one shared arrow-key/typeahead primitive, a true
   singleton across every list-like component, not per-component-family logic),
   `createFloating` (wraps `@floating-ui/dom`), `createScrollLock`, `createPresence`,
   `createControllableState`, `createRegisteredId`, `composeEventHandlers`, `withDefaults`,
   `renderElement`, and `ModalBackdrop` (the one component in the kernel: the pointer-blocking
   third of modality, alongside `createHideOutside` for assistive technology + the focus
   order, and `createFocusTrap` for Tab cycling), plus `createRegisteredElement`.
   Side-effectful wiring should use 2.0's split
   `createEffect(depsFn, computeFn)` form and `onSettled` (not `onMount`, which no longer
   exists in 2.0).

   This package is **published and supported**: its exported signatures are the public
   contract, not an implementation detail free to churn. Consumers compose it to build
   components this library doesn't ship, exactly as `@enara-ui/components` does. Two
   consequences the code must honour:
   - **No primitive may keep cross-instance state at module scope.** A consumer can end up
     with two installed copies (a plain `dependencies` entry doesn't force deduplication),
     and two module-scope counters each believing they own the body is an unreproducible
     field bug. `createScrollLock` and `createHideOutside` key their ref counts off
     `document.body`/the element under a `Symbol.for`, which resolves through the
     cross-realm global symbol registry.
   - Every primitive needs its own colocated `.md` stating the contract, since that doc is
     what a consumer reads.

   **Rule:** Popover composes `createFloating` + `createDismissable` + `createPresence` +
   `createFocusRestore`. Dialog composes `createFocusTrap` + `createFocusRestore` +
   `createHideOutside` + `ModalBackdrop` + `createDismissable` + `createScrollLock` +
   `createPresence`. Popover must never depend on Dialog — this directly avoids the Corvu
   coupling smell above. Note that focus *restore* is deliberately a separate primitive from
   the focus *trap*: Popover and Tooltip are non-modal and need restore without a trap, and
   welding the two together is precisely how a non-modal Dialog came to strand focus on
   `<body>`.

2. **Component wiring kernel** — thinner than under 1.x, because 2.0's `createContext`
   already returns the Provider component directly and `useContext` already throws by
   default when no provider is found. Only needs a thin `createComponentContext(name)`
   wrapper for consistent naming/typing, plus optional multi-instance keying where
   genuinely needed (Menu, Select, Accordion, Tabs). Prefer prop/closure passing over
   context entirely for shallow compound components.

3. **Public component API** — compound components (`Dialog.Root`, `Dialog.Trigger`, …)
   built on `solid-js`'s `merge`/`omit` (2.0's replacements for `mergeProps`/
   `splitProps`), plus `renderElement` (in `@enara-ui/primitives`) for the render-prop/`as`
   pattern. Ref merging needs no custom utility — `ref` natively accepts an array of
   ref functions (`ref={[internalRef, props.ref]}`).

**Async-loaded components** (Combobox with remote options, Toast queues, any
"loading…" state): lean on 2.0's native async support (`createMemo` accepting
Promises, `<Loading>`, `isPending`) instead of hand-rolling resource/loading-state
plumbing.

## SSR & hydration requirements (cross-cutting, non-negotiable)

**enara-ui's packages do not need a separate SSR build**, but the reason is narrower and
more fragile than this document used to claim.

> **Corrected.** The old rationale here was that `@solidjs/web` resolves to different runtime
> implementations per environment "behind the *same* exported function names", so one
> `generate: 'dom'` build works everywhere. That is false, and verified false against
> `2.0.0-beta.16`: the **server** build exports `template`, `insert`, `spread` and
> `setAttribute` as `notSup` stubs that throw *"Client-only API called on the server side"*.
> `generate: 'dom'` compiles a literal host JSX element into exactly those — and `_$template()`
> is called at **module scope**, so a single literal `<div>` in any component throws at
> *import* under SSR, not at render.

The single build works because of an invariant, not a symmetry: **no source file under
`packages/*/src` contains a literal host JSX element.** Every host element routes through
`renderElement` → `<Dynamic>` → `createComponent`, and `Dynamic` bridges the two builds at
runtime — server-side `dynamic()` calls `ssrElement(component, props, undefined, true)`
(emitting the `_hk` hydration key); client-side it calls
`sharedConfig.hydrating ? getNextElement() : createElement(...)`. Compile mode never matters.

That invariant is load-bearing and now enforced: `scripts/check-dist-imports.mjs` (CI, right
after `build`) fails if any `packages/*/dist/**/*.js` imports
`template`/`insert`/`spread`/`setAttribute`/`use`/`addEventListener` from `@solidjs/web`. The
same grep is the tripwire for a `babel-preset-solid@1.x` regression in the compiler pipeline.
The runtime behaviors it rests on are pinned by `packages/primitives/src/solid-contract.test.tsx`
and `solid-contract.browser.test.tsx`.

The first Popover arrow or visually-hidden label written the obvious way is what this catches.

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

  Verified for real: `dialog.browser.test.tsx` hydrates a committed fixture of genuine server
  HTML and asserts the trigger's DOM node is *reused*, then that clicking it mounts the portal
  client-side. See `docs/testing.md` for how the `ssr` and `browser` projects cooperate.
- **Focus-trap/scroll-lock/dismissable/floating-position primitives are inherently
  client-only** and should be structured so they simply don't run their DOM-touching
  logic during SSR (again, via effects) rather than crashing or needing to be manually
  disabled.

**SolidStart version caveat (checked directly against the npm registry, not assumed):**
as of this writing, `@solidjs/start`'s most Solid-2.0-aligned release
(`2.0.0-alpha.3`) still depends on `solid-js@^1.9.11`, not 2.0 — SolidStart itself has
not yet migrated. This means **real end-to-end SolidStart integration testing is
currently blocked** on their migration, not on anything in this project. Don't treat
"no SolidStart example app yet" as a enara-ui gap; re-check `@solidjs/start`'s
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
   `createScrollLock`, `createPresence`~~ ✅ — all in `@enara-ui/primitives`, tested,
   documented. `@enara-ui/core` was renamed to `@enara-ui/primitives` and
   `@enara-ui/button` was absorbed into `@enara-ui/components/button` along the way
   — see "Publishing strategy". The Dialog component itself (as
   `@enara-ui/components/dialog`) is next. Also the first real stress-test of the SSR
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

- **Package granularity (revised from the original family-package plan):** two
  packages total, not Kobalte's one-giant-package, not Corvu's
  15+-micro-packages-with-sibling-deps, and not the shared-primitive-family split
  (`@enara-ui/overlays`, `@enara-ui/collections`, `@enara-ui/forms`,
  `@enara-ui/disclosure`) originally planned here. `@enara-ui/primitives` for the
  behavior kernel (never duplicated), and a single `@enara-ui/components` package for
  every public component, each as its own subpath export
  (`@enara-ui/components/button`, `@enara-ui/components/dialog`, ...). The
  family-package plan required remembering which family package a given component
  shipped from before you could install/import it (`overlays` vs. `collections` vs.
  `forms`); a single package name with per-component subpaths removes that lookup while
  keeping the same per-component tree-shaking a family package would have given —
  importing `@enara-ui/components/button` never pulls in Dialog's code, since each
  subpath is its own build entry (see `vite.config.base.ts`'s `entries` option). Every
  component subpath depends only on `@enara-ui/primitives` — never on another
  component's subpath, which is what keeps this from becoming Kobalte's single giant
  package in spirit despite sharing one package in name.
- **Entry points:** subpath exports via `package.json#exports` per component rather
  than one barrel re-exporting everything (no root `.` export on
  `@enara-ui/components` at all), plus `"sideEffects": false`.
- **Monorepo tooling:** pnpm workspaces + Turborepo. Skip Nx — even Base UI itself runs
  Nx *and* Lerna together, more tooling than a greenfield library needs.

## Distribution

- **ESM-only** (no CJS) — Solid is ESM-first; reversible decision if real CJS demand
  appears later.
- **Vite library mode** for builds (multi-entry via `vite.config.base.ts`'s `entries`,
  per-subpath `.d.ts` via `vite-plugin-dts`). This replaced the originally-planned `tsup`,
  which cannot compile Solid 2.0 JSX — see the `esbuild-plugin-solid` writeup above.
  solid-primitives' `tsdown` + `unplugin-solid` toolchain is a deliberate *not yet*; the
  reasoning and its revisit trigger live in `docs/migration-2.0-stable.md` §5.
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

`expectNoA11yViolations` (axe-core, in `@enara-ui/internal-test-utils`) should run at
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
