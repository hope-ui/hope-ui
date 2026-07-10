# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`solid-zero` is a headless, accessible component library for SolidJS, targeting
**SolidJS 2.0 (beta)** — not 1.x. It is API-inspired by Base UI and React Aria (their
public API surface and accessibility patterns — actively reference and adapt their
code/reasoning) but explicitly avoids the architectural patterns of Kobalte and Corvu
(cite them only as anti-pattern case studies; never copy their code or "keep the shape
of" anything from either). See `docs/plan.md` for the full architecture rationale,
pitfall analysis, and phased build plan.

**SSR and SolidStart support are required, not optional** — every primitive/component
must render under SSR and hydrate cleanly, verified with `renderToStringAsync`/
`hydrate` from `@solidjs/web`. See "SSR & hydration requirements" in `docs/plan.md` for
the concrete rules (effect-gate DOM access, `createUniqueId` for ARIA-linking ids,
portals must degrade gracefully server-side) and a version caveat: `@solidjs/start`
hasn't migrated to solid-js 2.0 yet, so real SolidStart end-to-end testing is currently
blocked on them, not on this project — SSR correctness is still fully testable now
without SolidStart itself.

## Commands

```bash
pnpm install              # install workspace deps
pnpm build                # turbo: build all packages (Vite library mode, ESM + per-package .d.ts)
pnpm lint                 # biome check .
pnpm format               # biome format --write .
pnpm typecheck            # turbo: tsc --noEmit per package (reads sibling src, never dist — see below)
pnpm test                 # vitest run --project=unit    (node, no DOM, pure logic)
pnpm test:ssr             # vitest run --project=ssr     (node, SERVER builds of solid-js + @solidjs/web)
pnpm test:browser         # vitest run --project=browser (real Chromium, DOM + hydration)
pnpm storybook            # visual harness on :6006 (the only non-test feedback loop)
pnpm build:storybook      # static build, also the CI smoke test for the Storybook config
pnpm check:coverage-parity  # fails if any packages/*/src file lacks a test, .md doc, or story
pnpm check:dist-imports   # fails if a built file imports a client-only @solidjs/web helper.
                          # Reads packages/*/dist, so it runs after `pnpm build`.
pnpm changeset            # add a changeset before a PR that changes a published package
```

Playwright's browser needs to be installed once (CI does this automatically):
```bash
pnpm exec playwright install --only-shell chromium
```

**Running a single test file or test:**
```bash
pnpm exec vitest run --project=browser packages/components/src/button/Button.browser.test.tsx
pnpm exec vitest run --project=browser -t "fires onClick"
```

**Building/typechecking a single package:**
```bash
pnpm --filter @solid-zero/components build
pnpm --filter @solid-zero/components typecheck
```

## Definition of Done (enforced, not a guideline)

Every source file under `packages/*/src/` (except `index.ts`) must have:
1. A matching test file: `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx`
   (real-browser — required for anything touching focus/keyboard/pointer behavior,
   since jsdom cannot be trusted for that).
2. A matching `Foo.md` doc (API, keyboard interaction table, ARIA pattern reference)
   colocated in the same `src/` directory.
3. **`@solid-zero/components` only:** a matching `Foo.stories.tsx`, colocated in the same
   `src/` directory. Components are what a human has to look at; pure primitives aren't.
   Stories are excluded from `dist/` (see `vite-plugin-dts`'s `exclude` in
   `vite.config.base.ts`) and from the `build` task's turbo `inputs`.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces this in CI
and fails the build if any is missing. This exists because Kobalte's test coverage is
inconsistent (concentrated gaps in exactly the highest a11y-risk components) and Corvu
has no automated tests at all — see `docs/plan.md` for the specifics.

Stories are also where known-but-unfixed behavior gets pinned somewhere a human can see
it. Don't "fix" a story by deleting it; fix the component and rename the story. Dialog's
`Modal with an unpositioned Popup (content is unclickable — by design)` is the current
example: it reproduces a real, documented consequence of the pointer-blocking
`ModalBackdrop` rather than a defect, and exists so the failure mode is visible somewhere.

Every component/primitive test that renders real DOM should also call
`expectNoA11yViolations` (from `@solid-zero/internal-test-utils`) at least once, so a
baseline axe-core check runs by default. It fails on axe **violations** *and* on
**`incomplete`** results — the rules axe ran but couldn't decide. When axe genuinely
cannot judge one (`color-contrast` over an unresolvable background), name it in
`allowIncomplete` at the call site with a reason; never silence the category. See
`axe.md`.

`mount()` (also from `@solid-zero/internal-test-utils`) **fails the test** on a
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic. Both were
documented in prose here and emitted 170 times a run, so the next real one was invisible.
A deliberate untracked read is spelled `untrack(...)`; anything still warning is
unreviewed. See `mount.md`.

Every component (not needed for pure internal primitives with no DOM output) also
needs an SSR **and** a hydration round-trip test, and `check:coverage-parity` enforces
both: a `Foo.ssr.test.tsx` that *calls* `renderToStringAsync`, and a
`Foo.browser.test.tsx` that *calls* `hydrate`. "Calls" means outside a comment, outside a
string, outside an `it.skip`, and not merely imported — every one of those loopholes was
live at some point, and Dialog exercised three at once while the docs claimed it had a
hydration test.

**Read `docs/testing.md` before writing any test.** Three Vitest projects, one job and
one module resolution each: `unit` (node, no DOM, client builds, pure logic), `ssr`
(node, **server** builds of `solid-js` *and* `@solidjs/web`, the HTML a server sends),
`browser` (real Chromium, client builds, DOM/focus/pointer/axe/hydration). The file
suffix picks the project: `Foo.test.tsx`, `Foo.ssr.test.tsx`, `Foo.browser.test.tsx`.

Hydration is two environments by definition, so the two projects cooperate through a
committed fixture: `src/<component>/__fixtures__/<component>-ssr.html` is genuine server
output, asserted byte-for-byte by `Foo.ssr.test.tsx` and hydrated by
`Foo.browser.test.tsx`. Corrupt the fixture and both halves go red. The browser half must
assert no `console.error`/`console.warn`, exactly one of the element, and that the
surviving node **is the same object** as the server's — a silent fallback to a client
render otherwise looks identical to success.

Hydration keys (`_hk`) are a path through the component tree, so the `ssr` and `browser`
test files must define structurally identical trees. Inserting a component before
`Dialog.Trigger` — even one that renders nothing — shifts the trigger's key.

## No component may write a literal host JSX element

`vite-plugin-solid` is configured with neither `generate` nor `hydratable`, i.e.
`generate: 'dom'`, which compiles a literal `<div>`/`<span>`/SVG into a **module-scope**
`_$template()` call plus `_$insert()`. `@solidjs/web`'s **server** build exports
`template`/`insert`/`spread`/`setAttribute` as `notSup` throwers ("Client-only API called
on the server side"). So a single literal host element anywhere in a component throws *at
import* under SSR — not at render.

SSR works today only because every host element routes through `renderElement` →
`<Dynamic>` → `createComponent`, and `Dynamic` bridges the two builds at runtime
(`ssrElement(…, true)` server-side, `sharedConfig.hydrating ? getNextElement() :
createElement(...)` client-side). Compile mode never matters. This was previously
justified in `docs/plan.md` by the claim that `@solidjs/web` "exposes the same exported
function names per environment" — that reasoning is wrong, and the invariant is what
actually holds it up.

`pnpm check:dist-imports` (`scripts/check-dist-imports.mjs`, run in CI right after
`build`) enforces it: no `packages/*/dist/**/*.js` may import
`template`/`insert`/`spread`/`setAttribute`/`use`/`addEventListener` from `@solidjs/web`.
The same grep is the tripwire for a `babel-preset-solid@1.x` creeping back into the
compiler pipeline — 1.x emits `use` and `addEventListener`, names 2.0 renamed to `ref` and
`addEvent`, which is what makes the deferred `tsdown`/`unplugin-solid` migration safe to
attempt (see `docs/migration-2.0-stable.md` §5).

The first Popover arrow or visually-hidden label written the obvious way is what this
catches. Route it through `renderElement`.

## The Solid internals this codebase leans on are pinned

`packages/primitives/src/solid-contract.test.tsx` (unit, server `@solidjs/web`) and
`solid-contract.browser.test.tsx` (browser, client build) are characterization tests. They
don't test solid-zero; they pin the undocumented `solid-js`/`@solidjs/web` behaviors listed
in the section below, each with a comment naming the code that depends on it. `@solidjs/web`
already renamed runtime helpers *within* the beta line (`use`→`ref`,
`addEventListener`→`addEvent`), so when stable breaks one of these you get a red test with a
pointer instead of a bug hunt. Add to them rather than re-deriving a behavior in a comment.

## Architecture

**Package layout** (pnpm workspace, Turborepo pipeline):
- `packages/primitives` (`@solid-zero/primitives`) — the shared behavior kernel, and
  **public, supported API**: its exported signatures are the public contract, not an
  implementation detail free to churn. Consumers compose it to build components this
  library doesn't ship. Nothing here is duplicated per-component; everything else composes
  it. Currently:
  `renderElement` (the render-prop/`as`-polymorphism primitive every public component
  uses instead of hand-rolling its own polymorphic-`as` type system — it also owns ref
  merging; modeled on Base UI's `useRender` idea, not its code — see
  `packages/primitives/src/render/render.md`), `withDefaults` (the *only* correct way to
  apply prop defaults under 2.0 — see the `merge` bullet below), `createComponentContext`
  (thin `createContext`/`useContext` wrapper with a friendlier missing-Provider error),
  `composeEventHandlers`, `createControllableState`, `createRegisteredId`,
  `createRegisteredElement`, `createFocusTrap`, `createFocusRestore`, `createHideOutside`,
  `createDismissable`, `createScrollLock`, `createPresence`, and `ModalBackdrop` (see each
  primitive's colocated `.md` for API details, and the ref/`createEffect` timing gotcha below
  before writing another one).

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
  or it paints beneath the backdrop; see `modal-backdrop.md`.

  Two consequences that bite: `ModalBackdrop` and any consumer backdrop must be **spared** from
  `inert` (an inert element is transparent to hit testing, so a backdrop that hid itself would
  silently stop blocking anything), and `createHideOutside` must do **nothing** until its
  `target` resolves — a run without the popup in the spared set makes the popup itself inert,
  which blurs whatever the focus trap just focused and strands focus on `<body>` for good.

  Because it's public API, **no primitive may keep cross-instance state at module scope.**
  A consumer can end up with two installed copies (`dependencies` doesn't force
  deduplication), and two module-scope ref counts each believing they own `document.body`
  is an unreproducible field bug. `createScrollLock` and `createHideOutside` store
  their counts on `document.body`/the element under a `Symbol.for(...)` key, which resolves
  through the cross-realm global symbol registry, so every copy reads the same slot.
  `scroll-lock.browser.test.tsx` pins this by importing a genuinely separate module
  instance (`./scroll-lock?instance=2`, which Vite serves as a distinct module).
- `packages/components` (`@solid-zero/components`) — every public component, one
  subpath export each (`@solid-zero/components/button`, `@solid-zero/components/dialog`,
  ...) rather than one package per component or per component-family. No root `.`
  export — consumers always import a specific component's subpath, which is also what
  keeps this from becoming a Kobalte-style single giant package: importing one
  component's subpath never pulls in another's code. See "Publishing shape" below for
  the full rationale.
- `packages/internal-test-utils` (`@solid-zero/internal-test-utils`, private) — shared
  test harness: `mount()` (renders into a detached, document-attached container) and
  `expectNoA11yViolations()` (axe-core against a mounted container).

**Composition rule for future components:** compose shared kernel primitives from
`@solid-zero/primitives`, never import from another component's subpath within
`@solid-zero/components`. E.g. Popover must compose
`createFloating`/`createDismissable`/`createPresence` directly — it must never import
from `@solid-zero/components/dialog`, even though both are "overlay-ish." This is the
specific mistake Corvu makes (`@corvu/popover` depends on `@corvu/dialog`) that this
project avoids by design, despite now sharing one package.

**Publishing shape:** originally planned as packages grouped by shared-primitive family
(`@solid-zero/overlays`, `@solid-zero/collections`, etc.); revised to a single
`@solid-zero/components` package with one subpath export per component instead. The
family-package plan meant consumers had to remember which family package a given
component lived in before they could install/import it; a single package name with
per-component subpaths removes that lookup entirely while keeping the same
per-component tree-shaking (via `package.json#exports` + `"sideEffects": false`) that
family packages would have given. `@solid-zero/primitives` stays a fully separate
package — every entry in `@solid-zero/components` depends on it, never on a sibling
subpath. Each component subpath is its own Vite library-mode entry point (see
`vite.config.base.ts`'s `entries` option), building to `dist/<component>/index.js` +
matching `.d.ts`. ESM-only builds.

## SolidJS 2.0 (beta) — API differences from 1.x that matter here

This project targets `2.0.0-beta.x` (pinned via the `pnpm-workspace.yaml` catalog, kept
in lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web`). Key differences
from 1.x, discovered while building Phase 0 (not just from docs — verified against the
actual installed package):

- **DOM rendering moved to a separate package.** `solid-js` is now renderer-neutral;
  `render`, `Dynamic`, `Portal`, and the `JSX` types live in **`@solidjs/web`**, not
  `solid-js` or `solid-js/web`. `jsxImportSource` must point at `@solidjs/web`
  (see `tsconfig.base.json`, and the `solid.moduleName` override in
  `vite.config.base.ts` / `vitest.config.ts` for `vite-plugin-solid`, which defaults to
  `"solid-js/web"`).
- **The build pipeline is Vite library mode, not tsup.** Phase 0 used
  `tsup`/`esbuild-plugin-solid`; both were removed at the start of Dialog's build (see
  `vite.config.base.ts`) after discovering a hard incompatibility: `esbuild-plugin-solid`
  (and the `vite-plugin-solid@2.x` originally pinned in Phase 0) bundle
  `babel-preset-solid@1.x`, which compiles a JSX `ref` attribute into an import of a
  runtime helper called `use` from the target module — a name `@solidjs/web` 2.0 renamed
  to `ref`/`applyRef`. Since Button never used a literal `ref=` attribute, Phase 0 never
  hit this; Dialog is the first component that needs one, and *any* `ref=` usage failed
  to even load ("does not provide an export named 'use'") under the old pipeline.
  `esbuild-plugin-solid` has no 2.0-compatible release; the first-party
  `vite-plugin-solid` does, published under the npm `next` tag
  (`vite-plugin-solid@3.0.0-next.5`, pulling a matching `babel-preset-solid@2.0.0-beta.x`
  via its own dependency range) — confirmed against the npm registry, not assumed. Now
  build and test share one Solid-2.0-aware compiler pipeline; `vite-plugin-dts` replaces
  tsup's built-in `.d.ts` bundling (with `exclude` globs so test files don't leak into
  published type output).
- **A `createEffect(compute, effect)` compute function must never read a plain
  (non-signal) ref accessor** (e.g. `ref: () => someLetVariable` backed by a bare
  `let x; <div ref={x}>`). The compute function runs synchronously at the moment
  `createEffect(...)` is *called* — which, for a primitive invoked at the top of a
  component body, is *before* that component's own later JSX (and its `ref` callback)
  has executed — so it captures the ref as permanently `undefined`, and since it isn't a
  tracked signal, the effect never reruns to pick up the real value once the ref is set.
  Read the ref inside the *effect* (second) callback instead — by the time that runs
  (deferred, post-mount), the ref is populated. Hit and fixed in `createFocusTrap` and
  `createDismissable` (see the comments there); `createPresence` already did this
  correctly by construction.
- **A distinct, later-discovered variant of the above: when the ref-owning element is
  itself conditionally rendered by the same signal a primitive reacts to, the ref must
  be a real signal *and* tracked inside `compute`** — reading it only in the effect's
  apply phase (the fix for the previous bullet) isn't enough here. Hit wiring
  `createFocusTrap`/`createDismissable` into Dialog's `Popup`, whose DOM element only
  exists as a reactive consequence of `createPresence`'s `mounted()` (itself a reactive
  consequence of `context.open()`). When `open` flips true, presence's effect (which
  eventually creates the DOM node and assigns the ref, several reactive layers deep
  through `Show` → `Dynamic` → `spread`'s own internal ref-assignment effect) races
  against the focus-trap's/dismissable's own effects, which need the ref *immediately*
  upon activation. If the ref isn't a signal the primitive's `compute` actually tracks,
  a read mid-race can catch it still `undefined` — and since `active` (the only tracked
  dependency) won't change again, the effect never gets a second chance to see the
  populated ref. Symptom: Escape/outside-click/focus-trap silently do nothing, forever,
  but *only* for components whose ref-owning element is conditionally rendered — a
  primitive's own isolated tests (unconditionally-rendered container) won't catch it.
  Fix: track both in `compute`, e.g.
  `createEffect(() => [options.active(), options.ref()] as const, ([active, container]) => { ... })`,
  with the ref always backed by `createSignal`, never `let el; ref={el}`. Live in
  `createFocusTrap`/`createDismissable`; see `packages/components/src/dialog/Dialog.tsx`
  (`Popup`/`Backdrop`) for the call-site pattern. Any future `createXyz({ active, ref })`-
  shaped primitive that needs the ref the moment `active` flips true needs this same
  pattern — `createPresence` doesn't need it (and wasn't touched) because it doesn't read
  the ref on the activating edge.
- **`mergeProps`/`splitProps` are gone from the public API.** The 2.0 idiom is `merge`
  and `omit`, imported from `solid-js` (see `packages/components/src/button/Button.tsx`).
  Prefer these over anything reintroducing the old names.
- **`merge` resolves a key by *presence*, not by value — never use it to apply defaults.**
  `merge({ modal: true }, props)` looks like a default, but a later source that has the key
  *at all* wins, even when its value is `undefined`. So `<Dialog.Root>` (key absent) gets
  `true`, while `<Dialog.Root modal={props.modal}>` with `modal` unset gets `undefined` —
  and silently produces a non-modal dialog with no focus trap, no scroll lock, no
  `aria-modal`. The same bug turned `<Button type={props.type}>` into a form-submitting
  button. Forwarding an optional prop from a wrapper is the most common thing a consumer
  does, and it hit the broken case every time. Use `withDefaults(props, { ... })` from
  `@solid-zero/primitives`, which resolves each defaulted key with `??`. See
  `packages/primitives/src/defaults/defaults.md`.
- **Internal computed props must fall back to the consumer's, not overwrite them.** Same
  root cause: `merge(props, { get "aria-labelledby"() { return context.titleId(); } })`
  puts the internal object last, so a getter returning `undefined` *erases* a
  consumer-supplied `aria-labelledby`, leaving the dialog with no accessible name. Write
  `props["aria-labelledby"] ?? context.titleId()`. Only props derived from state the
  consumer doesn't control (`aria-modal`, `data-presence`) stay component-owned. See
  `Dialog.md`'s "Prop precedence" table for the house rule.
- **A signal write is not visible to a plain read until the next flush — in the *client*
  build only.** `setV(2); v()` returns the *old* value under `solid-js`'s client/dev build
  (deterministic microtask batching) and the *new* value under its server build. Tests that
  write a signal and read it back need `flush(() => setV(2))` (see
  `scroll-lock.browser.test.tsx`, `defaults.test.ts`). This bites hardest when a snippet is
  prototyped with plain `node` (which resolves the server build) and then moved into a
  Vitest project (which resolves the client build) — the behavior silently inverts.
- **`createSignal(fn)` creates a *memo*, not a signal holding a function.** 2.0 overloads it:
  `createSignal<T>(value: Exclude<T, Function>, options?)` and
  `createSignal<T>(fn: ComputeFunction<T>, options?)`. So a generic primitive that does
  `createSignal(options.defaultValue())` silently invokes a function-typed value and stores
  its return. `createControllableState` boxes its value (`{ value: T }` plus an `equals` that
  unwraps with Solid's own `isEqual`) specifically to dodge this; do the same in any other
  generic `createSignal<T>` wrapper.
- **Sibling effects run in creation order. On *re-run* their cleanups do too — but on
  *owner disposal* cleanups are LIFO.** Verified against the installed beta and pinned in
  `solid-contract.test.tsx`. The re-run path is the one that matters (`active` flips false;
  Solid walks the siblings in creation order, running each one's previous cleanup before its
  own new body). Two consequences, both live in `createFocusRestore` (see
  `focus-restore.md`): a primitive that must snapshot state before a sibling mutates it has
  to be *created first*; and a primitive whose cleanup must run *after* a sibling's cleanup
  has to defer the work by a `queueMicrotask` (effect cleanups are synchronous within a
  flush, so a microtask queued from the first cleanup lands after all of them). Focus restore
  needs both: it snapshots `document.activeElement` before `createFocusTrap` moves focus, and
  restores after the trap has removed its `focusin` listener — otherwise the still-live trap
  yanks focus straight back, since `.focus()` dispatches `focusin` synchronously.
- **`onMount` → `onSettled`**, `createEffect` can take a split `(depsFn, computeFn)`
  form, `createContext` returns the Provider component directly (`<XContext value={...}>`,
  not `<XContext.Provider>`), and `useContext` throws by default instead of returning
  `undefined`. `ref` accepts an array of ref-setter functions natively, and `applyRef`
  skips falsy entries — so no `mergeRefs` utility is needed anywhere in this codebase.
  `renderElement` owns ref merging: pass the internal setter as its `ref` option and it
  merges with any consumer `ref` on `props`, reading the consumer's inside a getter so the
  read lands in `spread`'s effect rather than in the component body.
- **Solid 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` if a descendant component writes
  to a signal owned by an *ancestor* reactive scope directly from its own synchronous
  render body.** Hit in `Dialog.Title`/`Dialog.Description`, which originally called
  `context.setTitleId(id)` (a signal owned by `Root`) directly in their component body,
  to register their id with `Root`'s context for `Popup`'s `aria-labelledby`/
  `aria-describedby`. Fix: defer the write into `onSettled`:
  ```tsx
  onSettled(() => {
    context.setTitleId(id);
    return () => context.setTitleId(undefined);
  });
  ```
  General rule: any primitive/component where a descendant needs to register something
  into an ancestor-owned signal must do so via `onSettled` (or another deferred
  mechanism), never directly in the descendant's synchronous render body. This is packaged
  as `createRegisteredId` in `@solid-zero/primitives`; use it rather than re-deriving the
  deferral. Watch for
  SSR/hydration mismatches when applying this outside a case like Dialog's, where the
  writing component (`Title`/`Description`) only ever renders inside a `Portal`-guarded
  subtree that itself never renders server-side — so there's no server-rendered
  `aria-labelledby` value for a later client-only write to disagree with. A component
  that does this cross-scope write *outside* a Portal-guarded subtree would need that
  reasoning re-checked.
- **Vite's `solid-refresh` HMR wrapper breaks prop forwarding in dev/test mode for
  components imported from another module** (a real bug hit during Phase 0: `children`
  silently failed to reach the DOM only when `Button` was imported from `Button.tsx`,
  not when the same component was defined inline in the test file). Fixed by setting
  `refresh: { disabled: true }` on the Solid Vite plugin in `vitest.config.ts` — tests
  never need HMR (`hot` still works but is deprecated in `vite-plugin-solid@3.x` in
  favor of `refresh`). If a similar "props vanish only for imported components" symptom
  reappears, check this setting first before assuming a merge/omit bug.
- Browser tests import `page` from `vitest/browser`, not the deprecated
  `@vitest/browser/context`.

## In development, `@solid-zero/*` always resolves to `src` — never to a sibling's `dist`

`package.json#exports` points at `dist/` because that's what consumers install. Nothing
in this repo may follow it. A stale `dist/` silently masquerades as the current API: add an
export to `@solid-zero/primitives` and, until someone rebuilds, `@solid-zero/components`
can't see it — or worse, keeps compiling against the old implementation and its tests pass.

Three places redirect to source, and all three must stay in sync when a package is added:
- `tsconfig.base.json`'s `paths` (editor + `tsc --noEmit`). Relative paths in an inherited
  config resolve against the config that declares them, so these are repo-root-relative.
- `vitest.config.ts`'s `resolve.alias` (both projects).
- `.storybook/main.ts`'s `viteFinal` alias.

`turbo.json`'s `typecheck` task therefore has **no** `dependsOn: ["^build"]`. If you find
yourself running a build to make an import resolve, the resolution config is what's wrong.

The single exception is `vite-plugin-dts`, which honours `paths` when it *emits*: without
`compilerOptions: { paths: {} }` in `vite.config.base.ts` the published `Dialog.d.ts` gets
`import { RenderProp } from '../../packages/primitives/src/index.ts'`, a path that doesn't
exist in the tarball. The build artifact resolves through `exports` (i.e. `dist`); only
development resolves to source.

## Build/test/Storybook share one Solid compiler config

Three pipelines compile this repo's JSX — the library build (`vite.config.base.ts`), the
test runs (`vitest.config.ts`), and Storybook (`.storybook/main.ts`). They must agree,
because a mismatch surfaces as a runtime error deep inside `@solidjs/web`, not as a config
error. All three import `solidPluginOptions()` from the root `solid-babel-options.ts`;
don't respell the options anywhere.

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
