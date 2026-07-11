# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository. This file is the operative
index; the deepest rationale lives in `docs/` (notably `docs/plan.md`, `docs/testing.md`,
`docs/solid-2.0-notes.md`, `docs/definition-of-done.md`) and in each primitive/component's colocated
`.md`.

## What this is

`enara-ui` is a headless, accessible component library for SolidJS, targeting
**SolidJS 2.0 (beta)** — not 1.x. It is API-inspired by Base UI and React Aria (their
public API surface and accessibility patterns — actively reference and adapt their
code/reasoning) but explicitly avoids the architectural patterns of Kobalte and Corvu
(cite them only as anti-pattern case studies; never copy their code or "keep the shape
of" anything from either). See `docs/plan.md` for the full architecture rationale,
pitfall analysis, and phased build plan.

`@solid-primitives` (the `next` branch) is a separate axis: a community, SolidJS-team-adjacent
library to **adopt as a dependency**, not merely reference. Before writing a new internal primitive,
check it for an existing solution and record a verdict — but anything adopted must clear the full
Definition of Done through its consumer, especially the **hydration** round-trip. Hard-won hazard: an
adopted `node_modules` primitive that creates a compute-form signal/memo (`createSignal(fn)` /
`createMemo`) can break hydration because it isn't compiled by our `vite-plugin-solid` pipeline — the
server skips the hydration id the client's runtime still consumes, so `_hk` diverges (server vs
client). `controlled-signal` was rejected for exactly this. Prove any such adoption against the
hydration fixture; effect-only primitives are the safe bet. See `docs/solid-primitives-eval.md`.

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
pnpm --filter @enara-ui/components build
pnpm --filter @enara-ui/components typecheck
```

## Definition of Done (enforced, not a guideline)

**Full rationale and history: `docs/definition-of-done.md`. Read `docs/testing.md` before writing
any test.**

Every source file under `packages/*/src/` (except `index.ts`) must have:
1. A matching test file: `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx` (real-browser —
   required for anything touching focus/keyboard/pointer behavior, since jsdom cannot be trusted for
   that).
2. A matching `Foo.md` doc (API, keyboard interaction table, ARIA pattern reference) colocated in
   the same `src/` directory.
3. **`@enara-ui/components` only:** a matching `Foo.stories.tsx`, colocated in the same `src/`
   directory. Components are what a human has to look at; pure primitives aren't. Stories are
   excluded from `dist/` (see `vite-plugin-dts`'s `exclude` in `vite.config.base.ts`) and from the
   `build` task's turbo `inputs`.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces the above in CI (it
exists because Kobalte's test coverage is inconsistent, with gaps in the highest a11y-risk
components, and Corvu has no automated tests at all — see `docs/plan.md`) and additionally requires:
- Every browser test that calls `mount()` also calls `expectNoA11yViolations` at least once (both
  from `@enara-ui/internal-test-utils`), running a baseline axe-core check. A browser test that
  renders nothing (e.g. `solid-contract.browser.test.tsx`) is exempt.
- Every component (not pure internal primitives with no DOM output) has an SSR test
  (`Foo.ssr.test.tsx` that *calls* `renderToStringAsync`) **and** a hydration test
  (`Foo.browser.test.tsx` that *calls* `hydrate`). "Calls" means outside a comment, string, or
  `it.skip`, and not merely imported.

Also required:
- `expectNoA11yViolations` fails on axe **violations** *and* on **`incomplete`** results. Name a
  genuinely undecidable one (`color-contrast` over an unresolvable background) in `allowIncomplete`
  at the call site with a reason; never silence the category. See `axe.md`.
- `mount()` **fails the test** on a `STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE`
  diagnostic. A deliberate untracked read is spelled `untrack(...)`; anything still warning is
  unreviewed. See `mount.md`.
- Stories also pin known-but-unfixed behavior where a human can see it. Don't "fix" a story by
  deleting it; fix the component and rename the story. Current example: Dialog's `Modal with an
  unpositioned Popup (content is unclickable — by design)`, a documented consequence of the
  pointer-blocking `ModalBackdrop`, not a defect.
- Hydration cooperates through a committed fixture `src/<component>/__fixtures__/<component>-ssr.html`
  (genuine server output): the `ssr` test asserts it byte-for-byte, the `browser` test hydrates it
  and must assert no `console.error`/`console.warn`, exactly one of the element, and that the
  surviving node **is the same object** as the server's (a silent client-render fallback otherwise
  looks identical to success). The `ssr` and `browser` files must define **structurally identical
  trees** — hydration keys (`_hk`) are a path through the component tree, so inserting a component
  before `Dialog.Trigger` (even one that renders nothing) shifts the trigger's key.

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
don't test enara-ui; they pin the undocumented `solid-js`/`@solidjs/web` behaviors listed
in `docs/solid-2.0-notes.md`, each with a comment naming the code that depends on it. `@solidjs/web`
already renamed runtime helpers *within* the beta line (`use`→`ref`,
`addEventListener`→`addEvent`), so when stable breaks one of these you get a red test with a
pointer instead of a bug hunt. Add to them rather than re-deriving a behavior in a comment.

## Architecture

**Package layout** (pnpm workspace, Turborepo pipeline):
- `packages/primitives` (`@enara-ui/primitives`) — the shared behavior kernel, and
  **public, supported API**: its exported signatures are the public contract, not an
  implementation detail free to churn. Consumers compose it to build components this
  library doesn't ship. Nothing here is duplicated per-component; everything else composes it.

  Every source file lives under exactly one **top-level `src/` folder**, and *only* top-level
  folders carry a barrel (`index.ts`) and a subpath export — nothing deeper. The four folders:
  - `dialog/` (`@enara-ui/primitives/dialog`) — the `createDialog` **hook family**: a root
    state hook `createDialog` plus one hook per part (`createDialogTrigger`, `createDialogPopup`,
    `createDialogBackdrop`, `createDialogPortal`, `createDialogTitle`, `createDialogDescription`,
    `createDialogClose`), each in its own `dialog/<part>/dialog-<part>.ts`. Each part hook takes
    the `createDialog` state + its props and owns that part's effects/registration/prop-precedence
    (so the effect stack lives in `createDialogPopup`, the popup's scope). This is the headless
    shape `@enara-ui/components`' `Dialog` is a thin JSX layer over — modeled on React Aria's
    `useDialog`/`useOverlay*` split. See `dialog/root/dialog-root.md`.
  - `modal-backdrop/` (`@enara-ui/primitives/modal-backdrop`) — `ModalBackdrop`, the kernel's
    only component (it renders DOM), so it sits at `src/` beside the families rather than in
    `internal/`.
  - `utils/` (`@enara-ui/primitives/utils`) — the non-`createX` composition helpers:
    `renderElement` (the render-prop/`as`-polymorphism primitive every public component uses
    instead of hand-rolling its own polymorphic-`as` type system — it also owns ref merging;
    modeled on Base UI's `useRender` idea, not its code — see `utils/render/render.md`),
    `withDefaults` (the *only* correct way to apply prop defaults under 2.0 — see the `merge` note
    in `docs/solid-2.0-notes.md`), and `composeEventHandlers`.
  - `internal/` (`@enara-ui/primitives/internal`) — the `createX` behavior primitives:
    `createComponentContext` (thin `createContext`/`useContext` wrapper with a friendlier
    missing-Provider error), `createControllableState`, `createPresence`, `createFocusTrap`,
    `createFocusRestore`, `createHideOutside`, `createDismissable`, `createScrollLock`,
    `createRegisteredId`, `createRegisteredElement` (see each primitive's colocated `.md`, and the
    ref/`createEffect` timing gotcha in `docs/solid-2.0-notes.md` before writing another one).

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
- `packages/components` (`@enara-ui/components`) — every public component, one
  subpath export each (`@enara-ui/components/button`, `@enara-ui/components/dialog`,
  ...) rather than one package per component or per component-family. No root `.`
  export — consumers always import a specific component's subpath, which is also what
  keeps this from becoming a Kobalte-style single giant package: importing one
  component's subpath never pulls in another's code. See "Publishing shape" below for
  the full rationale.
- `packages/internal-test-utils` (`@enara-ui/internal-test-utils`, private) — shared
  test harness: `mount()` (renders into a detached, document-attached container) and
  `expectNoA11yViolations()` (axe-core against a mounted container).

**Composition rule for future components:** compose shared kernel primitives from
`@enara-ui/primitives`, never import from another component's subpath within
`@enara-ui/components`. E.g. Popover must compose
`createFloating`/`createDismissable`/`createPresence` directly — it must never import
from `@enara-ui/components/dialog`, even though both are "overlay-ish." This is the
specific mistake Corvu makes (`@corvu/popover` depends on `@corvu/dialog`) that this
project avoids by design, despite now sharing one package.

**Publishing shape:** originally planned as packages grouped by shared-primitive family
(`@enara-ui/overlays`, `@enara-ui/collections`, etc.); revised to a single
`@enara-ui/components` package with one subpath export per component instead. The
family-package plan meant consumers had to remember which family package a given
component lived in before they could install/import it; a single package name with
per-component subpaths removes that lookup entirely while keeping the same
per-component tree-shaking (via `package.json#exports` + `"sideEffects": false`) that
family packages would have given. `@enara-ui/primitives` stays a fully separate
package — every entry in `@enara-ui/components` depends on it, never on a sibling
subpath. Each component subpath is its own Vite library-mode entry point (see
`vite.config.base.ts`'s `entries` option), building to `dist/<component>/index.js` +
matching `.d.ts`. ESM-only builds.

## SolidJS 2.0 (beta) — API differences from 1.x that matter here

Targets `2.0.0-beta.x` (pinned via the `pnpm-workspace.yaml` catalog, kept in lockstep across
`solid-js` / `@solidjs/signals` / `@solidjs/web`), discovered building Phase 0 and verified against
the installed package. **Full rationale, repros, fixes, and code for every item below:
`docs/solid-2.0-notes.md`.** The gotchas at a glance:

- DOM rendering moved to `@solidjs/web` (`render`, `Dynamic`, `Portal`, `JSX` types), not
  `solid-js`/`solid-js/web`; `jsxImportSource` and the `solid.moduleName` override point there.
- Build pipeline is Vite library mode with `vite-plugin-solid@3.0.0-next.5` (+
  `babel-preset-solid@2.0.0-beta.x`), not tsup/`esbuild-plugin-solid`; `vite-plugin-dts` emits
  `.d.ts` (older `babel-preset-solid@1.x` emits `use`/`addEventListener` instead of 2.0's
  `ref`/`addEvent` and fails to load `ref=`).
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
  `createFocusRestore` / `focus-restore.md`).
- `onMount` → `onSettled`; `createEffect` takes a split `(depsFn, computeFn)` form; `createContext`
  returns the Provider directly (`<XContext value={...}>`); `useContext` throws by default; `ref`
  accepts an array and `applyRef` skips falsy (no `mergeRefs`); `renderElement` owns ref merging.
- A descendant writing an ancestor-owned signal in its synchronous render body throws
  `[REACTIVE_WRITE_IN_OWNED_SCOPE]` — defer via `onSettled` / use `createRegisteredId`.
- `solid-refresh` HMR breaks prop forwarding for imported components; `refresh: { disabled: true }`
  in `vitest.config.ts`.
- Browser tests import `page` from `vitest/browser`, not the deprecated `@vitest/browser/context`.

## In development, `@enara-ui/*` always resolves to `src` — never to a sibling's `dist`

`package.json#exports` points at `dist/` because that's what consumers install. Nothing
in this repo may follow it. A stale `dist/` silently masquerades as the current API: add an
export to `@enara-ui/primitives` and, until someone rebuilds, `@enara-ui/components`
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
`import { RenderProp } from '../../packages/primitives/src/utils/index.ts'`, a path that doesn't
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
