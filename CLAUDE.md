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

## Commands

```bash
pnpm install              # install workspace deps
pnpm build                # turbo: build all packages (tsup, ESM + per-package .d.ts)
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
pnpm exec vitest run --project=browser packages/button/src/Button.browser.test.tsx
pnpm exec vitest run --project=browser -t "fires onClick"
```

**Building/typechecking a single package:**
```bash
pnpm --filter @solid-zero/button build
pnpm --filter @solid-zero/button typecheck
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

## Architecture

**Package layout** (pnpm workspace, Turborepo pipeline):
- `packages/core` (`@solid-zero/core`) — the shared behavior kernel. Nothing here is
  duplicated per-component; everything else composes it. Currently: `renderElement`,
  the render-prop/`as`-polymorphism primitive every public component uses instead of
  hand-rolling its own polymorphic-`as` type system (modeled on Base UI's `useRender`
  idea, not its code — see `packages/core/src/render.md` for the API and a documented,
  intentional type-system limitation around cross-element `render` callbacks).
- `packages/button` (`@solid-zero/button`) — first real component, proves the
  `as`/render pattern end-to-end.
- `packages/internal-test-utils` (`@solid-zero/internal-test-utils`, private) — shared
  test harness: `mount()` (renders into a detached, document-attached container) and
  `expectNoA11yViolations()` (axe-core against a mounted container).

**Composition rule for future components:** compose shared kernel primitives, never
depend on a sibling component package. E.g. Popover must compose
`createFloating`/`createDismissable`/`createPresence` directly — it must never depend
on `Dialog`, even though both are "overlay-ish." This is the specific mistake Corvu
makes (`@corvu/popover` depends on `@corvu/dialog`) that this project avoids by design.

**Publishing shape (as it scales beyond Button):** packages are grouped by
shared-primitive family, not one-package-per-component and not one-giant-package —
e.g. eventually `@solid-zero/overlays` (dialog/popover/tooltip/context-menu, sharing
dismiss/floating/presence), `@solid-zero/collections` (listbox/select/combobox/menu/tabs,
sharing list/selection/keyboard-nav). Every component package depends only on
`@solid-zero/core`, never on a sibling component package. Subpath exports
(`package.json#exports`) per component, `"sideEffects": false`, ESM-only builds.

## SolidJS 2.0 (beta) — API differences from 1.x that matter here

This project targets `2.0.0-beta.x` (pinned via the `pnpm-workspace.yaml` catalog, kept
in lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web`). Key differences
from 1.x, discovered while building Phase 0 (not just from docs — verified against the
actual installed package):

- **DOM rendering moved to a separate package.** `solid-js` is now renderer-neutral;
  `render`, `Dynamic`, `Portal`, and the `JSX` types live in **`@solidjs/web`**, not
  `solid-js` or `solid-js/web`. `jsxImportSource` must point at `@solidjs/web`
  (see `tsconfig.base.json`, and the `solid.moduleName` override in
  `tsup.config.base.ts` / `vitest.config.ts` for `esbuild-plugin-solid` /
  `vite-plugin-solid`, which both still default to `"solid-js/web"`).
- **`mergeProps`/`splitProps` are gone from the public API.** The 2.0 idiom is `merge`
  and `omit`, imported from `solid-js` (see `packages/button/src/Button.tsx`). Prefer
  these over anything reintroducing the old names.
- **`onMount` → `onSettled`**, `createEffect` can take a split `(depsFn, computeFn)`
  form, `createContext` returns the Provider component directly (`<XContext value={...}>`,
  not `<XContext.Provider>`), and `useContext` throws by default instead of returning
  `undefined`. `ref` accepts an array of ref-setter functions natively — no `mergeRefs`
  utility needed anywhere in this codebase.
- **Vite's `solid-refresh` HMR wrapper breaks prop forwarding in dev/test mode for
  components imported from another module** (a real bug hit during Phase 0: `children`
  silently failed to reach the DOM only when `Button` was imported from `Button.tsx`,
  not when the same component was defined inline in the test file). Fixed by setting
  `hot: false` on the Solid Vite plugin in `vitest.config.ts` — tests never need HMR.
  If a similar "props vanish only for imported components" symptom reappears, check
  this setting first before assuming a merge/omit bug.
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
