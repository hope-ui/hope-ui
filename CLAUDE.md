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
pnpm typecheck            # turbo: tsc --noEmit per package (each depends on that package's build)
pnpm test                 # vitest run --project=unit   (node env, pure-logic primitives)
pnpm test:browser         # vitest run --project=browser (real Chromium via Playwright)
pnpm check:coverage-parity  # fails if any packages/*/src file lacks a test or .md doc
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

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces this in CI
and fails the build if either is missing. This exists because Kobalte's test coverage is
inconsistent (concentrated gaps in exactly the highest a11y-risk components) and Corvu
has no automated tests at all — see `docs/plan.md` for the specifics.

Every component/primitive test that renders real DOM should also call
`expectNoA11yViolations` (from `@solid-zero/internal-test-utils`) at least once, so a
baseline axe-core check runs by default.

Every component (not needed for pure internal primitives with no DOM output) also
needs an SSR/hydration round-trip test: `renderToStringAsync` (from `@solidjs/web`)
must resolve without throwing, and `hydrate()` against the resulting HTML must produce
no hydration-mismatch warnings. `check:coverage-parity` mechanically enforces the first
half of this (every `@solid-zero/components` source file must have a matching test
that references `renderToStringAsync`) — added alongside Dialog, the first component to
need it.

The second half — a genuine in-browser `hydrate()` round-trip producing zero mismatch
warnings — is **not** mechanically enforced, and for **Portal-using components
specifically** (Dialog, and by extension any future Popover/Tooltip/etc.) is currently
a known, deliberately accepted gap rather than a TODO: `renderToStringAsync` called
*from inside* a Vitest browser test always resolves to `@solidjs/web`'s client build
(`isServer` hardcoded `false`), so it never produces genuine server output for an
`isServer`-guarded branch like `Dialog.Portal`'s. Two different fixes were attempted
for Dialog and both hit real, separate blockers — a custom Vitest browser `command`
hand-constructing the component tree hit `createUniqueId cannot be used outside of a
reactive context`; reading a fixture (written by a genuine server-side
`renderToStringAsync` in the "unit" project) via Vitest's built-in `readFile` browser
command got past that, but then hit a `hydrate()` "Hydration Mismatch: Unable to find
DOM nodes for hydration key" error even with a byte-for-byte identical component tree —
plausibly because the "unit" and "browser" Vitest projects are separate Vite builds, so
`@solidjs/web` (and therefore the component's own compiled module) are genuinely
different module instances between the SSR render and the client hydrate. Neither was
root-caused further; see `docs/session-handoff-dialog.md` finding #8 for the full
investigation if picking this up again. `Dialog.browser.test.tsx`'s hydration test is
`it.skip`'d, pointing back at that doc. Non-Portal components (Button, and any future
non-overlay component) aren't affected — `renderToStringAsync` called in-browser is
fine for them since there's no `isServer`-guarded branch to get wrong.

## Architecture

**Package layout** (pnpm workspace, Turborepo pipeline):
- `packages/primitives` (`@solid-zero/primitives`) — the shared behavior kernel.
  Nothing here is duplicated per-component; everything else composes it. Currently:
  `renderElement` (the render-prop/`as`-polymorphism primitive every public component
  uses instead of hand-rolling its own polymorphic-`as` type system, modeled on Base
  UI's `useRender` idea, not its code — see `packages/primitives/src/render/render.md`),
  `createComponentContext` (thin `createContext`/`useContext` wrapper with a friendlier
  missing-Provider error), `createFocusTrap`, `createDismissable`, `createScrollLock`,
  and `createPresence` (built fresh for Dialog — see each primitive's colocated `.md`
  for API details, and the ref/`createEffect` timing gotcha below before writing
  another one).
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
- **`onMount` → `onSettled`**, `createEffect` can take a split `(depsFn, computeFn)`
  form, `createContext` returns the Provider component directly (`<XContext value={...}>`,
  not `<XContext.Provider>`), and `useContext` throws by default instead of returning
  `undefined`. `ref` accepts an array of ref-setter functions natively — no `mergeRefs`
  utility needed anywhere in this codebase.
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
  mechanism), never directly in the descendant's synchronous render body. Watch for
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

## Testing stack specifics

- Vitest 4's `test.projects` (not the deprecated `vitest.workspace.ts` file) defines two
  projects in `vitest.config.ts`: `unit` (node env, `*.test.{ts,tsx}`, excludes
  `*.browser.test.*`) and `browser` (real Chromium via `@vitest/browser-playwright`,
  `*.browser.test.{ts,tsx}` only, `headless: true`).
- CI installs only `chromium-headless-shell` (`playwright install --with-deps
  --only-shell`), which is why `headless: true` is required in the browser project
  config — Playwright only picks the shell build when headless is on.
- `unit` currently has `passWithNoTests: true` at the root `test` level (not per-project
  — that placement matters, it's ignored inside a project block) because Phase 0 has no
  pure-logic primitives yet; remove it once `createListState` or similar lands.
