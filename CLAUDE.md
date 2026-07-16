# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository. This file is the operative
index; the deepest rationale lives in `docs/` (notably `docs/plan.md`, `docs/testing.md`,
`docs/solid-2.0-notes.md`, `docs/definition-of-done.md`, `docs/theming.md`) and in each
primitive/component's per-file usage doc under `docs/usage/<pkg>/<relative-src-path>/`.

## What this is

`hope-ui` is a batteries-included, **themed**, accessible component library for SolidJS,
targeting **SolidJS 2.0 (beta)** — not 1.x. Ready-to-use themed components (a batteries-included,
Tailwind-v4 + tailwind-variants system — see `docs/roadmap.md`) are the product; they are built over an **internal**
headless behavior kernel (`@hope-ui/primitives`), which is an implementation detail and an
advanced escape hatch, **not** a stability-promised public API. It is API-inspired by Base UI
and React Aria (their public API surface and accessibility patterns — actively reference and
adapt their code/reasoning). See `docs/plan.md` for the full architecture rationale,
pitfall analysis, and phased build plan.

**i18n provenance:** `packages/primitives/src/i18n/` (locale + reading-direction
context — `I18nProvider`/`useLocale`/`createDefaultLocale`/`getReadingDirection`) is derived
from React Spectrum/`@react-aria/i18n` (Apache-2.0). The improvements over that source are
documented in `default-locale.ts` (SSR-safe seeding + a `Symbol.for` dual-copy registry). Do
not "correct" this back to a hand-rolled reimplementation.

`@solid-primitives` (the `next` branch) is a separate axis: a community, SolidJS-team-adjacent
library to **adopt as a dependency**, not merely reference. Before writing a new internal primitive,
check it for an existing solution and record a verdict — but anything adopted must clear the full
Definition of Done through its consumer, especially the **hydration** round-trip. Hard-won hazard: an
adopted `node_modules` primitive that creates a compute-form signal/memo (`createSignal(fn)` /
`createMemo`) can break hydration because it isn't compiled by our `vite-plugin-solid` pipeline — the
server skips the hydration id the client's runtime still consumes, so `_hk` diverges (server vs
client). `controlled-signal` was rejected for exactly this. Prove any such adoption against the
hydration fixture; effect-only primitives are the safe bet. See `docs/solid-primitives-eval.md`.

**"SSR support" = "works in SolidStart."** Renders on the SolidStart server, hydrates
without mismatch, runs on the client. That is the whole requirement — nothing broader.
Every primitive/component must clear it, verified with `renderToStringAsync`/`hydrate`
from `@solidjs/web` (the framework-agnostic pair SolidStart's server uses). The concrete
rules that actually protect it are small and named in `docs/plan.md` ("SSR & hydration
requirements"): effect-gate DOM access, `createUniqueId` for ARIA-linking ids, gate
server-side `Portal` behind `isServer`, and keep an `aria-controls` IDREF only while its
target is mounted. A version caveat: `@solidjs/start` hasn't migrated to solid-js 2.0 yet,
so real SolidStart end-to-end testing is currently blocked on them, not on this project —
SSR correctness is still fully testable now (per-environment compilation + the
`renderToStringAsync`/`hydrate` round-trip) without SolidStart itself.

The library ships JSX-preserved **source** only, under the `"solid"` export condition, so
the consumer's own `vite-plugin-solid` compiles it per environment (server `ssr`, client
`dom` + hydrate). There is deliberately **no** dom-compiled fallback: every SolidJS app
(SolidStart, `npm init solid`) is Vite + `vite-plugin-solid`, so the `"solid"` condition
always resolves; a consumer without that plugin gets no match and fails loudly. Components
are therefore free to write literal host elements — see the "Distribution model" in
`docs/plan.md`.

## Commands

```bash
pnpm install              # install workspace deps
pnpm build                # turbo: build all packages (tsdown → JSX-preserved .jsx + .d.ts per subpath)
pnpm lint                 # biome check .
pnpm format               # biome format --write .
pnpm typecheck            # turbo: tsc --noEmit per package (reads sibling src, never dist — see below)
pnpm test                 # vitest run --project=unit    (node, no DOM, pure logic)
pnpm test:ssr             # vitest run --project=ssr     (node, SERVER builds of solid-js + @solidjs/web)
pnpm test:browser         # vitest run --project=browser (real Chromium, DOM + hydration)
pnpm storybook            # visual harness on :6006 (the only non-test feedback loop)
pnpm build:storybook      # static build, also the CI smoke test for the Storybook config
pnpm check:coverage-parity  # fails if a src file lacks a test / docs/usage doc / story, OR a leaf folder has flat sprawl
pnpm changeset            # add a changeset before a PR that changes a published package
```

Playwright's browser needs to be installed once (CI does this automatically):
```bash
pnpm exec playwright install --only-shell chromium
```

**Running a single test file or test:**
```bash
pnpm exec vitest run --project=browser packages/components/src/button/__tests__/button.browser.test.tsx
pnpm exec vitest run --project=browser -t "fires onClick"
```

**Building/typechecking a single package:**
```bash
pnpm --filter @hope-ui/components build
pnpm --filter @hope-ui/components typecheck
```

## Git conventions

**Never add a `Co-Authored-By: Claude` (or any `Co-authored-by` / "Generated with Claude
Code") trailer or attribution line to commit messages.** Commit messages carry the change
rationale only — no tool or assistant attribution, in any form.

## Definition of Done (enforced, not a guideline)

**Full rationale and history: `docs/definition-of-done.md`. Read `docs/testing.md` before writing
any test.**

Every source file under `packages/*/src/` (except `index.ts`) must have:
1. A matching test file — `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx` (real-browser —
   required for anything touching focus/keyboard/pointer behavior, since jsdom cannot be trusted for
   that) — in a `__tests__/` subfolder of the same leaf directory (`Foo/__tests__/Foo.test.tsx`), so
   the leaf folder stays free of test/fixture visual noise. See "Leaf source folders stay flat-free".
2. A matching `Foo.md` doc (API, keyboard interaction table, ARIA pattern reference) at
   `docs/usage/<pkg>/<relative-src-path>/Foo.md` (out of the source tree; the path mirrors package +
   src path so the primitives/ and components/ `dialog` docs never collide). **Exception:** files
   under `packages/primitives/src/internal/` (the advanced/unstable behavior kernel — see
   "Architecture" below) require a test but **not** a consumer-facing `.md`; the composed families
   (`dialog`, `calendar`, `i18n`, `modal-backdrop`) and `utils/` still need one.
3. **`@hope-ui/components` only:** a matching `Foo.stories.tsx`, colocated **beside the source** in
   the same `src/` leaf directory (stories are the human-facing harness, so they stay next to what
   they render). Components are what a human has to look at; pure primitives aren't. Stories (and
   tests) never reach `dist/` because tsdown only builds the `package.json` `hope.entries` files,
   and they're excluded from the `build` task's turbo `inputs`.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces the above in CI and
additionally requires:
- Every browser test that calls `mount()` also calls `expectNoA11yViolations` at least once (both
  from `@hope-ui/internal-test-utils`), running a baseline axe-core check. A browser test that
  renders nothing (e.g. `solid-contract.browser.test.tsx`) is exempt.
- Every component (not pure internal primitives with no DOM output) has an SSR test
  (`Foo.ssr.test.tsx` that *calls* `renderToStringAsync`) **and** a hydration test
  (`Foo.browser.test.tsx` that *calls* `hydrate`). "Calls" means outside a comment, string, or
  `it.skip`, and not merely imported.

Also required:
- `expectNoA11yViolations` fails on axe **violations** *and* on **`incomplete`** results. Name a
  genuinely undecidable one (`color-contrast` over an unresolvable background) in `allowIncomplete`
  at the call site with a reason; never silence the category. See
  `docs/usage/internal-test-utils/axe/axe.md`.
- `mount()` **fails the test** on a `STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE`
  diagnostic. A deliberate untracked read is spelled `untrack(...)`; anything still warning is
  unreviewed. See `docs/usage/internal-test-utils/mount/mount.md`.
- Stories also pin known-but-unfixed behavior where a human can see it. Don't "fix" a story by
  deleting it; fix the component and rename the story. Current example: Dialog's `Modal with an
  unpositioned Popup (content is unclickable — by design)`, a documented consequence of the
  pointer-blocking `ModalBackdrop`, not a defect.
- Hydration cooperates through a shared **render entry** `src/<component>/__tests__/<component>.ssr-entry.tsx`
  (exports the `Tree` it renders) — **no committed fixture file**. The `ssr` test renders `Tree` and
  `toMatchInlineSnapshot()`s the bytes; the `browser` test hydrates that same `Tree` (via
  `hydrateFixture`) against genuine server HTML served fresh, in-process, by the hydration-fixture
  bridge (`import ssr from "virtual:hydration-fixture?id=<component>"` — see `vitest-hydration-bridge.ts`).
  `hydrateFixture` asserts no `console.error`/`console.warn`, no element added or dropped, and that
  every surviving node **is the same object** as the server's (a silent client-render fallback
  otherwise looks identical to success). Sharing one `Tree` is what keeps the `ssr` and `browser`
  halves **structurally identical** — hydration keys (`_hk`) are a path through the component tree, so
  a component inserted before `Dialog.Trigger` (even one that renders nothing) shifts the trigger's
  key. Adding a component adds **zero** committed fixture files at any scale. See `docs/testing.md`.

## Leaf source folders stay flat-free

A `src/<name>/` folder holds only its implementation file(s), `index.ts`, and — for
`@hope-ui/components` — `<name>.stories.tsx`. Everything else has a home: tests, `__fixtures__/`,
and `__screenshots__/` live in a `__tests__/` subfolder; the per-file usage `.md` lives under
`docs/usage/<pkg>/<path>/`. Never drop test, fixture, or doc files flat beside source, and never
let a leaf folder accumulate a dozen files. `pnpm check:coverage-parity` enforces this — a flat
`*.test.*`, a flat `<name>.md`, or a flat `__fixtures__/` in any leaf under `primitives`,
`components`, `theming`, or `internal-test-utils` fails the build.

## Components may write literal host elements — the library ships source

Earlier this file carried a "no component may write a literal host JSX element" rule: a
literal `<div>` compiles (under a single `generate: 'dom'` build) to a module-scope
`_$template()` call that `@solidjs/web`'s **server** build throws on *at import*, so one
literal element crashed SSR. That was never an SSR requirement — it was an artifact of the
**distribution choice** to ship one pre-compiled dom build. The library now ships
JSX-preserved **source** under the `"solid"` export condition (see "Distribution model" in
`docs/plan.md`), so the consumer's `vite-plugin-solid` compiles each element per
environment and literal host elements are fine. Write them where they read best.

`renderElement` (`@hope-ui/primitives/utils`) stays — but only as the `as`/render-prop
**polymorphism** helper (and the owner of ref merging), which is its real job. It is no
longer a mandatory wrapper you route every host element through for SSR's sake. Reach for
it when a component exposes `as`/`render`; otherwise a literal element is fine.

## The Solid internals this codebase leans on are pinned

`packages/primitives/src/__tests__/solid-contract.test.ts` (unit, `solid-js` client build),
`solid-contract.ssr.test.tsx` (server builds) and `solid-contract.browser.test.tsx`
(browser, client build) are characterization tests. They don't test hope-ui; they pin the
undocumented `solid-js`/`@solidjs/web` behaviors listed in `docs/solid-2.0-notes.md`, each
with a comment naming the code that depends on it (`withDefaults`, `createControllableState`,
`createComponentContext`, `createFocusRestore`, `renderElement`'s ref merging, and the
`Dynamic` → `_hk` hydration key `renderElement` relies on). `@solidjs/web` already renamed
runtime helpers *within* the beta line (`use`→`ref`, `addEventListener`→`addEvent`), so when
stable breaks one of these you get a red test with a pointer instead of a bug hunt. Add to
them rather than re-deriving a behavior in a comment.

## Architecture

**Package layout** (pnpm workspace, Turborepo pipeline):
- `packages/primitives` (`@hope-ui/primitives`) — the shared behavior kernel, and an
  **internal / advanced (unstable) layer**, not a marketed public product: it serves
  `@hope-ui/theming` and `@hope-ui/components`, and is available as an escape hatch for advanced
  consumers who build components this library doesn't ship, but its signatures may churn between
  minors — headless composition is no longer the primary use case. Nothing here is duplicated
  per-component; everything else composes it.

  Every source file lives under exactly one **top-level `src/` folder**, and *only* top-level
  folders carry a barrel (`index.ts`) and a subpath export — nothing deeper. The top-level folders
  — `dialog`, `modal-backdrop`, `utils`, `internal` (documented below), plus `calendar` and `i18n`:
  - `dialog/` (`@hope-ui/primitives/dialog`) — the `createDialog` **hook family**: a root
    state hook `createDialog` plus one hook per part (`createDialogTrigger`, `createDialogPopup`,
    `createDialogBackdrop`, `createDialogPortal`, `createDialogTitle`, `createDialogDescription`,
    `createDialogClose`), each in its own `dialog/<part>/dialog-<part>.ts`. Each part hook takes
    the `createDialog` state + its props and owns that part's effects/registration/prop-precedence
    (so the effect stack lives in `createDialogPopup`, the popup's scope). This is the headless
    shape `@hope-ui/components`' `Dialog` is a thin JSX layer over — modeled on React Aria's
    `useDialog`/`useOverlay*` split. See `docs/usage/primitives/dialog/root/dialog-root.md`.
  - `modal-backdrop/` (`@hope-ui/primitives/modal-backdrop`) — `ModalBackdrop`, the kernel's
    only component (it renders DOM), so it sits at `src/` beside the families rather than in
    `internal/`.
  - `utils/` (`@hope-ui/primitives/utils`) — the non-`createX` composition helpers:
    `renderElement` (the render-prop/`as`-polymorphism primitive every public component uses
    instead of hand-rolling its own polymorphic-`as` type system — it also owns ref merging;
    modeled on Base UI's `useRender` idea, not its code — see `docs/usage/primitives/utils/render/render.md`),
    `withDefaults` (the *only* correct way to apply prop defaults under 2.0 — see the `merge` note
    in `docs/solid-2.0-notes.md`), and `composeEventHandlers`.
  - `internal/` (`@hope-ui/primitives/internal`) — the `createX` behavior primitives:
    `createComponentContext` (thin `createContext`/`useContext` wrapper with a friendlier
    missing-Provider error), `createControllableState`, `createPresence`, `createFocusTrap`,
    `createFocusRestore`, `createHideOutside`, `createDismissable`, `createScrollLock`,
    `createRegisteredId`, `createRegisteredElement` (see each primitive's doc under
    `docs/usage/primitives/internal/`, and the
    ref/`createEffect` timing gotcha in `docs/solid-2.0-notes.md` before writing another one). The
    `internal/` barrel also carries the list/grid/collection navigation family
    (`createListNavigation`/`createListSelection`/`createGridNavigation`/`createVirtualCollection`,
    …) that the collection/floating components (Listbox, Menu, Select, …) will compose.
  - `calendar/` (`@hope-ui/primitives/calendar`) — the `createCalendar` **hook family** (headless
    month/year/decade calendar with single/range/multiple selection), built on
    `@internationalized/date`; same root-state-plus-per-part shape as `dialog/`.
  - `i18n/` (`@hope-ui/primitives/i18n`) — locale + reading-direction context
    (`I18nProvider`/`useLocale`/`createDefaultLocale`/`getReadingDirection`) plus message
    translation. See the i18n provenance note under "What this is".

  **Modality is four mechanisms, not one**, and each was verified against the installed
  Chromium rather than assumed. `createHideOutside` applies `aria-hidden` (accessibility tree)
  *and* `inert` (focus order + hit testing) to everything outside the popup; `createFocusTrap`
  handles Tab cycling inside it; `ModalBackdrop` (the kernel's only component) blocks the
  pointer unconditionally. None is redundant: `aria-hidden` alone leaves the background
  focusable and clickable; `inert` alone does *not* take content out of the accessibility tree
  as far as ARIA tooling is concerned (a role query still finds an `inert` button, but not an
  `aria-hidden` one); and `inert` only blocks the pointer on elements the layer actually
  marked, so an element inserted before the `MutationObserver` sees it would be clickable
  without the backdrop. floating-ui's `markOthers` layers the same two attributes for the same
  reason. Any future modal layer (Popover, Select) composes all four — that's why
  `ModalBackdrop` is in the kernel rather than inside Dialog. A modal popup must be positioned,
  or it paints beneath the backdrop; see `docs/usage/primitives/modal-backdrop/modal-backdrop.md`.

  Two consequences that bite: `ModalBackdrop` and any consumer backdrop must be **spared** from
  `inert` (an inert element is transparent to hit testing, so a backdrop that hid itself would
  silently stop blocking anything), and `createHideOutside` must do **nothing** until its
  `target` resolves — a run without the popup in the spared set makes the popup itself inert,
  which blurs whatever the focus trap just focused and strands focus on `<body>` for good.

  As a robustness measure (cheap to keep, and it outlives the demotion to internal API),
  **no primitive keeps cross-instance state at module scope.**
  A consumer can end up with two installed copies (`dependencies` doesn't force
  deduplication), and two module-scope ref counts each believing they own `document.body`
  is an unreproducible field bug. `createScrollLock` and `createHideOutside` store
  their counts on `document.body`/the element under a `Symbol.for(...)` key, which resolves
  through the cross-realm global symbol registry, so every copy reads the same slot.
  `scroll-lock.browser.test.tsx` pins this by importing a genuinely separate module
  instance (`./scroll-lock?instance=2`, which Vite serves as a distinct module).
- `packages/components` (`@hope-ui/components`) — every public component, one
  subpath export each (`@hope-ui/components/button`, `@hope-ui/components/dialog`,
  ...) rather than one package per component or per component-family. No root `.`
  export — consumers always import a specific component's subpath, which is also what
  keeps this from becoming a single giant barrel package: importing one
  component's subpath never pulls in another's code. See "Publishing shape" below for
  the full rationale.
- `packages/theming` (`@hope-ui/theming`) — the **theming contract** and dependency-inversion
  seam: `ThemeProvider` + `useRecipe`, the closed, hand-declared `RecipeRegistry` (plus the parallel,
  type-only `ThemeablePropsRegistry` for per-component `defaultProps` — both declared, **not** module-
  augmented), the `SlotRecipeFn` shape and a contract-version constant, the `SemanticColorContract`
  token vocabulary, and the Tailwind styling seam (`tv`/`cn`/`cx` from `tailwind-variants`), plus a
  conformance kit (recipe + semantic-token checks) on the `@hope-ui/theming/conformance` subpath.
  `@hope-ui/components` reads recipes through it; `@hope-ui/presets/*` implement it; neither knows
  about the other. Depends on `@hope-ui/primitives` (for `createComponentContext`) — which is *why*
  primitives cannot fold into components without a dependency cycle (`components → theming →
  components`). See `docs/theming.md`.
- `packages/presets` (`@hope-ui/presets`) — the concrete presets, per-preset subpaths
  (`@hope-ui/presets/hope` is the **default** visual identity). A preset is a JS entry
  (`@hope-ui/presets/hope` → `src/hope/index.ts`: `definePreset` over the recipe map) plus a
  `tailwind.css` (`@import "@hope-ui/presets/hope/tailwind.css"`) mapping the semantic tokens to clean
  utilities via `@theme inline`. **hope authors its `--hope-*` token values in CSS** (`src/hope/tokens.css`
  — `:root` + `.dark`, each `var(--color-*)`, imported by `tailwind.css`), so `<ThemeProvider preset={hope}>`
  renders no DOM (hope is a **zero-DOM preset**; token values are not carried on the `Preset` object).
  Because those `var(--color-*)` references live in the compiled CSS, Tailwind keeps the palette shades
  the preset uses — no `@source` scan trick. Raw scales come from Tailwind itself; swap-safety is
  enforced only on the shared **semantic vocabulary**, via `checkSemanticTokenConformance`
  (`@hope-ui/theming/conformance`) run against a preset's token CSS — for hope, its `tokens.css` read as
  a string (see `hope.test.ts`) — a missing `--hope-*` token compiles a referencing utility to an
  unresolved `var(--…)`.
- `packages/internal-test-utils` (`@hope-ui/internal-test-utils`, private) — shared
  test harness: `mount()` (renders into a detached, document-attached container) and
  `expectNoA11yViolations()` (axe-core against a mounted container).

**Composition rule for future components:** compose shared kernel primitives from
`@hope-ui/primitives`, never import from another component's subpath within
`@hope-ui/components`. E.g. Popover must compose
`createFloating`/`createDismissable`/`createPresence` directly — it must never import
from `@hope-ui/components/dialog`, even though both are "overlay-ish." A higher-level
component depending on a sibling component's package (rather than the shared kernel) is a
known anti-pattern this project avoids by design, despite now sharing one package.

**Publishing shape:** originally planned as packages grouped by shared-primitive family
(`@hope-ui/overlays`, `@hope-ui/collections`, etc.); revised to a single
`@hope-ui/components` package with one subpath export per component instead. The
family-package plan meant consumers had to remember which family package a given
component lived in before they could install/import it; a single package name with
per-component subpaths removes that lookup entirely while keeping the same
per-component tree-shaking (via `package.json#exports` + `"sideEffects": false`) that
family packages would have given. `@hope-ui/primitives` stays a fully separate
package — every entry in `@hope-ui/components` depends on it, never on a sibling
subpath. Each component subpath is its own tsdown entry (from `package.json`'s
`hope.entries`), building to `dist/<component>/index.jsx` (JSX-preserved source) +
matching `.d.ts`. ESM-only builds.

## SolidJS 2.0 (beta) — API differences from 1.x that matter here

Targets `2.0.0-beta.x` (pinned via the `pnpm-workspace.yaml` catalog, kept in lockstep across
`solid-js` / `@solidjs/signals` / `@solidjs/web`), discovered building Phase 0 and verified against
the installed package. **Full rationale, repros, fixes, and code for every item below:
`docs/solid-2.0-notes.md`.** The gotchas at a glance:

- DOM rendering moved to `@solidjs/web` (`render`, `Dynamic`, `Portal`, `JSX` types), not
  `solid-js`/`solid-js/web`; `jsxImportSource` and the `solid.moduleName` override point there.
- The **published** build is tsdown (rolldown + oxc) emitting JSX-preserved source — it runs
  no Solid compiler at all, so the `babel-preset-solid` version is irrelevant to it. The
  **tests + Storybook** still compile JSX with `vite-plugin-solid@3.0.0-next.5` (+
  `babel-preset-solid@2.0.0-beta.x`); the 1.x preset (`tsup`/`esbuild-plugin-solid`,
  `unplugin-solid`) emits `use`/`addEventListener` instead of 2.0's `ref`/`addEvent` and fails
  to load `ref=`, which is why those toolchains are *not* used for JSX compilation here. See
  `docs/plan.md` "Distribution model" and `docs/migration-2.0-stable.md` §5.
- A `createEffect(compute, effect)` compute function must never read a plain (non-signal) ref
  accessor — read the ref in the *effect* (second) callback.
- When the ref-owning element is conditionally rendered by the signal the primitive reacts to, back
  the ref with `createSignal` and **track it in `compute`**, e.g.
  `createEffect(() => [options.active(), options.ref()] as const, ([active, container]) => { ... })`.
- `mergeProps`/`splitProps` are gone → use `merge` and `omit` from `solid-js`.
- `merge` resolves keys by *presence*, not value — never use it for defaults; use
  `withDefaults(props, { ... })` (resolves each key with `??`).
- Internal computed props must fall back to the consumer's (`props["aria-labelledby"] ??
  context.titleId()`), never overwrite; only consumer-uncontrolled props (`aria-modal`,
  `data-presence`) stay component-owned.
- A signal write isn't visible to a plain read until the next flush — **client build only**; use
  `flush(() => setV(2))` in tests.
- `createSignal(fn)` creates a *memo*, not a signal holding a function; box generic values as
  `createControllableState` does.
- Sibling effects run/clean up in creation order on re-run, but LIFO on owner disposal (see
  `createFocusRestore` / `docs/usage/primitives/internal/create-focus-restore/create-focus-restore.md`).
- `onMount` → `onSettled`; `createEffect` takes a split `(depsFn, computeFn)` form; `createContext`
  returns the Provider directly (`<XContext value={...}>`); `useContext` throws by default; `ref`
  accepts an array and `applyRef` skips falsy (no `mergeRefs`); `renderElement` owns ref merging.
- A descendant writing an ancestor-owned signal in its synchronous render body throws
  `[REACTIVE_WRITE_IN_OWNED_SCOPE]` — defer via `onSettled` / use `createRegisteredId`.
- `solid-refresh` HMR breaks prop forwarding for imported components; `refresh: { disabled: true }`
  in `vitest.config.ts`.
- Browser tests import `page` from `vitest/browser`, not the deprecated `@vitest/browser/context`.

## In development, `@hope-ui/*` always resolves to `src` — never to a sibling's `dist`

`package.json#exports` points at `dist/` because that's what consumers install. Nothing
in this repo may follow it. A stale `dist/` silently masquerades as the current API: add an
export to `@hope-ui/primitives` and, until someone rebuilds, `@hope-ui/components`
can't see it — or worse, keeps compiling against the old implementation and its tests pass.

Three places redirect to source, and all three must stay in sync when a package is added:
- `tsconfig.base.json`'s `paths` (editor + `tsc --noEmit`). Relative paths in an inherited
  config resolve against the config that declares them, so these are repo-root-relative.
- `vitest.config.ts`'s `resolve.alias` (both projects).
- `.storybook/main.ts`'s `viteFinal` alias.

`turbo.json`'s `typecheck` task therefore has **no** `dependsOn: ["^build"]`. If you find
yourself running a build to make an import resolve, the resolution config is what's wrong.

This used to have a `vite-plugin-dts` exception (it honoured `paths` when emitting, leaking
`import { RenderProp } from '../../packages/primitives/src/utils/index.ts'` into the published
`Dialog.d.ts` unless `paths` was cleared). That's gone: tsdown emits the `.d.ts`, and it keeps
sibling `@hope-ui/*` packages **external** (via `deps.neverBundle` in `tsdown.config.base.ts`),
so the emitted declarations reference them by bare specifier (`@hope-ui/primitives/utils`) —
resolved through the consumer's `exports`, never a src path. Nothing in the build follows
`paths` to source; only development (editor, `tsc --noEmit`, tests, Storybook) does.

## test/Storybook share one Solid compiler config

The **published build no longer compiles JSX** — tsdown ships JSX-preserved source and the
consumer's `vite-plugin-solid` compiles it. Only two pipelines here compile this repo's JSX:
the test runs (`vitest.config.ts`) and Storybook (`.storybook/main.ts`). They must agree,
because a mismatch surfaces as a runtime error deep inside `@solidjs/web`, not as a config
error. Both import `solidPluginOptions()` from the root `solid-babel-options.ts`; don't
respell the options anywhere.

Two non-obvious things that config guards against, both hit for real:

- **`storybook-solidjs-vite`'s framework preset adds its own, unconfigured
  `vite-plugin-solid`** unless a plugin literally named `solid` is already in
  `config.plugins` — and its `viteFinal` runs *before* the one in `.storybook/main.ts`.
  So `main.ts` filters the framework's plugin out and substitutes ours. Adding ours
  without removing theirs would double-compile every file; leaving theirs alone would
  re-enable `solid-refresh` and resurrect the prop-forwarding bug below.
  `Button.stories.tsx`'s "Children reach the DOM (solid-refresh canary)" story exists to
  catch exactly that regression.

- **`vite-plugin-solid` auto-injects `@testing-library/jest-dom/vitest` as a *bare* setup
  specifier** into any non-browser Vitest project whenever it can `require.resolve` that
  package — it's an *optional peer*. Vitest then resolves the bare specifier against the
  repo root, where pnpm's isolated layout doesn't expose it, and the whole `unit` project
  dies with `Cannot find module '<root>/@testing-library/jest-dom/vitest'`. Nothing here
  depends on jest-dom; it entered the graph because `storybook` depends on it, and adding
  Storybook was enough to break the unit suite. The plugin's only opt-out is a setup-file
  path matching `/jest-dom/`, hence the (intentionally empty) root
  `vitest.setup.jest-dom-optout.ts`. If a similar "a new devDependency broke an unrelated
  test project" symptom appears, check `vite-plugin-solid`'s `config()` hook first.

## Testing stack specifics

**`docs/testing.md` is the full explanation. This is the compressed version.**

- Vitest 4's `test.projects` (not the deprecated `vitest.workspace.ts` file) defines three
  projects in `vitest.config.ts`, and the split is by **module resolution**, not by taste:
  `unit` (node, no DOM, client builds), `ssr` (node, **server** builds of `solid-js` *and*
  `@solidjs/web`), `browser` (real Chromium via `@vitest/browser-playwright`, client builds).
  File suffix picks the project. Anything asserting on build-specific behavior belongs in the
  `solid-contract.*` files, which say which build they pin.
- `unit` is `environment: "node"`, **not jsdom**, deliberately: jsdom can't be trusted for
  focus/keyboard/pointer, so those live in `browser`. With no `document` at all, writing one
  in the wrong project is impossible rather than merely discouraged.
- **`environment: "node"` does not change package resolution.** It swaps JS globals; Vite's
  default `resolve.conditions` still includes `browser`. A node project silently gets browser
  builds unless you alias them — verified empirically, and the source of a months-long bug.
- **Aliasing `@solidjs/web` to its server build is not enough on its own.** It is externalized
  and loaded by Node, so its own `import { createRoot } from "solid-js"` bypasses the alias,
  producing two `solid-js` instances with two `currentOwner`s. Symptom: `createUniqueId cannot
  be used outside of a reactive context`. Fix: `server: { deps: { inline: [...] } }` on the
  `ssr` project. Both are commented in `vitest.config.ts`.
- CI installs only `chromium-headless-shell` (`playwright install --with-deps
  --only-shell`), which is why `headless: true` is required in the browser project
  config — Playwright only picks the shell build when headless is on.
- No `passWithNoTests`. It was a Phase 0 concession from when no pure-logic primitive had a
  node-environment test; leaving it on meant deleting every unit test kept CI green.
