# SolidJS 2.0 (beta) — API differences from 1.x that matter here

Full rationale for the checklist in CLAUDE.md § *SolidJS 2.0 (beta)*.

This project targets `2.0.0-beta.x` (pinned via the `pnpm-workspace.yaml` catalog, kept
in lockstep across `solid-js` / `@solidjs/signals` / `@solidjs/web`). Key differences
from 1.x, discovered while building Phase 0 (not just from docs — verified against the
actual installed package):

- **DOM rendering moved to a separate package.** `solid-js` is now renderer-neutral;
  `render`, `Dynamic`, `Portal`, and the `JSX` types live in **`@solidjs/web`**, not
  `solid-js` or `solid-js/web`. `jsxImportSource` must point at `@solidjs/web`
  (see `tsconfig.base.json`, and the `solid.moduleName` override in `solid-babel-options.ts`
  — used by `vitest.config.ts` and `.storybook/main.ts` — for `vite-plugin-solid`, which
  defaults to `"solid-js/web"`).
- **The published build compiles no JSX at all — it ships source.** The publishable packages
  build with **tsdown** (`transform.jsx: "preserve"`), emitting JSX-preserved `.jsx` the
  consumer's `vite-plugin-solid` compiles per environment (see `docs/plan.md`, "Distribution
  model"). This sidesteps a hard 2.0 incompatibility in every *compiling* Solid bundler
  plugin: Phase 0's `tsup`/`esbuild-plugin-solid` (and `unplugin-solid`) bundle
  `babel-preset-solid@1.x`, which compiles a JSX `ref` into an import of a helper called `use`
  from the target module — a name `@solidjs/web` 2.0 renamed to `ref`/`applyRef` (and
  `addEventListener` → `addEvent`). Any `ref=` usage failed to even load ("does not provide an
  export named 'use'") under that pipeline. The **tests + Storybook** compile JSX with the
  first-party `vite-plugin-solid@3.0.0-next.5` (pulling a matching
  `babel-preset-solid@2.0.0-beta.x`), the one 2.0-correct compiler — confirmed against the npm
  registry, not assumed. tsdown emits the `.d.ts` (no `vite-plugin-dts`); test/story files
  never reach `dist/` because tsdown only builds the `hope.entries`.
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
  `createFocusTrap`/`createDismissable`; see `createDialogPopup`/`createDialogBackdrop`
  (`packages/primitives/src/dialog/popup/dialog-popup.ts` and `.../backdrop/dialog-backdrop.ts`)
  for the call-site pattern. Any future `createXyz({ active, ref })`-
  shaped primitive that needs the ref the moment `active` flips true needs this same
  pattern — `createPresence` doesn't need it (and wasn't touched) because it doesn't read
  the ref on the activating edge.
- **`mergeProps`/`splitProps` are gone from the public API.** The 2.0 idiom is `merge`
  and `omit`, imported from `solid-js` (see `packages/components/src/button/button.tsx`).
  Prefer these over anything reintroducing the old names.
- **`merge` resolves a key by *presence*, not by value — never use it to apply defaults.**
  `merge({ modal: true }, props)` looks like a default, but a later source that has the key
  *at all* wins, even when its value is `undefined`. So `<Dialog.Root>` (key absent) gets
  `true`, while `<Dialog.Root modal={props.modal}>` with `modal` unset gets `undefined` —
  and silently produces a non-modal dialog with no focus trap, no scroll lock, no
  `aria-modal`. The same bug turned `<Button type={props.type}>` into a form-submitting
  button. Forwarding an optional prop from a wrapper is the most common thing a consumer
  does, and it hit the broken case every time. Use `withDefaults(props, { ... })` from
  `@hope-ui/primitives`, which resolves each defaulted key with `??`. See
  `docs/usage/primitives/utils/defaults/defaults.md`.
- **Internal computed props must fall back to the consumer's, not overwrite them.** Same
  root cause: `merge(props, { get "aria-labelledby"() { return context.titleId(); } })`
  puts the internal object last, so a getter returning `undefined` *erases* a
  consumer-supplied `aria-labelledby`, leaving the dialog with no accessible name. Write
  `props["aria-labelledby"] ?? context.titleId()`. Only props derived from state the
  consumer doesn't control (`aria-modal`, `data-presence`) stay component-owned. See
  `dialog.md`'s "Prop precedence" table for the house rule.
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
  `create-focus-restore.md`): a primitive that must snapshot state before a sibling mutates it has
  to be *created first*; and a primitive whose cleanup must run *after* a sibling's cleanup
  has to defer the work by a `queueMicrotask` (effect cleanups are synchronous within a
  flush, so a microtask queued from the first cleanup lands after all of them). Focus restore
  needs both: it snapshots `document.activeElement` before `createFocusTrap` moves focus, and
  restores after the trap has removed its `focusin` listener — otherwise the still-live trap
  yanks focus straight back, since `.focus()` dispatches `focusin` synchronously.
- **`onMount` → `onSettled`**, `createEffect` can take a split `(depsFn, computeFn)`
  form, `createContext` returns the Provider component directly (`<XContext value={...}>`,
  not `<XContext.Provider>`), and `useContext` throws by default instead of returning
  `undefined`. `applyRef` flattens ref arrays and skips falsy entries — so no `mergeRefs`
  utility is needed anywhere in this codebase. `renderElement` owns ref merging: pass the
  internal setter as its `ref` option and it merges with any consumer `ref` on `props` into a
  **single function ref** (calling `applyRef([internalRef, consumerRef], element)` inside it),
  reading the consumer's ref inside that callback so the read lands in the render target's ref
  effect rather than in the component body. Merging to one function — not handing the raw array
  to the render target — is what lets it wrap a consumer *component* that only honours function
  refs (e.g. TanStack Router's `Link`), not just host elements whose compiler flattens arrays.
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
  as `createRegisteredId` in `@hope-ui/primitives`; use it rather than re-deriving the
  deferral. Watch for
  SSR/hydration mismatches when applying this outside a case like Dialog's, where the
  writing component (`Title`/`Description`) only ever renders inside a `Portal`-guarded
  subtree that itself never renders server-side — so there's no server-rendered
  `aria-labelledby` value for a later client-only write to disagree with. A component
  that does this cross-scope write *outside* a Portal-guarded subtree would need that
  reasoning re-checked.
- **Vite's `solid-refresh` HMR wrapper breaks prop forwarding in dev/test mode for
  components imported from another module** (a real bug hit during Phase 0: `children`
  silently failed to reach the DOM only when `Button` was imported from `button.tsx`,
  not when the same component was defined inline in the test file). Fixed by setting
  `refresh: { disabled: true }` on the Solid Vite plugin in `vitest.config.ts` — tests
  never need HMR (`hot` still works but is deprecated in `vite-plugin-solid@3.x` in
  favor of `refresh`). If a similar "props vanish only for imported components" symptom
  reappears, check this setting first before assuming a merge/omit bug.
- Browser tests import `page` from `vitest/browser`, not the deprecated
  `@vitest/browser/context`.
- **A *component* rendered lazily inside a `<Show>` fails to hydrate — resolve it eagerly
  with `children()`.** Symptom: `Hydration tag mismatch for key "…": expected <svg> but
  found <span>` (and historically a `getNextSibling` null crash), caught by the route error
  boundary, which then silently client-renders — the console fills with errors and the SSR
  benefit is lost. Trigger is a *conjunction*: (1) the content is a **component** created
  **lazily** — a consumer's `startDecorator={<Icon/>}` compiles to a getter that runs
  `createComponent(Icon)` where the prop is *read*, i.e. inside the slot's reactive `insert`
  — **and** (2) that read happens inside a `<Show>` (keyed or not). Neither alone triggers
  it: a lazy component in an *unconditional* slot hydrates fine (which is why Button's
  unconditional label was always immune), and a *directly-written* child (`<span><Icon/></span>`)
  inside a `<Show>` hydrates fine (it is created eagerly during the span's construction, in
  the ambient owner). Root cause is an upstream `@solidjs/web` beta asymmetry (present through
  at least `2.0.0-beta.20`; byte-identical between beta.19 and beta.20 in the relevant code):
  on the **server** `createComponent(Comp) === Comp()` with no owner, so the component's root
  keys off the ambient owner; on the **client** `createComponent` wraps `Comp` in a transparent
  `createRoot`, and the client `<Show>` nests children under memo/insert-effect owners the
  server `<Show>` does not — so the component's `_hk` comes out one off and `hydrate()` claims
  the wrong node. This is the long-standing, still-open upstream bug (solidjs/solid#2384,
  solidjs/solid-start#1089). **Fix (Button/Badge slots):** resolve each slot's content once,
  eagerly, in the component body with Solid's `children()` helper, then render the resolved
  accessor inside the `<Show>` — the component is then created in the ambient owner, exactly
  like a direct child, and hydration realigns. Read the raw prop **only once**: gate the
  `<Show>` on the *resolved* accessor (`when={startDecorator() != null}`), not the raw prop —
  a second read (e.g. a `!= null` gate on the raw prop) re-runs the consumer getter and creates
  a *second* component instance, which double-claims the server node on hydrate and silently
  drops it. Pinned in `packages/primitives/src/__tests__/solid-contract.ssr.test.tsx` and
  regression-tested by `button-icons`/`badge-icons` (`packages/components/src/{button,badge}/__tests__/`).
- **A JSX-element *prop* read more than once is built more than once — `children()` also fixes
  this, independently of `<Show>`/SSR.** The double-read above is one instance of a broader axis:
  a consumer's `x={<Icon/>}` compiles to a getter that runs `createComponent(Icon)` on **every**
  read, so reading the same prop in `N` places within one render — a `!= null` gate, a placement
  decision, and the render, say — builds it `N` times and discards `N−1`. This bites with **no**
  `<Show>` and **no** SSR involved; it is pure wasted work (and lost internal state) on the client.
  Button's `loadingText` (`JSX.Element | (() => JSX.Element)`) was the real case: read three ways
  (loader-placement, label gate, label render), so a loading render constructed it three times.
  **Fix is the same** `children()`-once-then-read-the-accessor. Two caveats that matter when
  deciding whether a slot needs it: (1) a **static element child** (`<Button><Icon/></Button>`) is
  compiled to a value created **once** — not a getter — so it never multiplies and needs nothing;
  only *props* carrying JSX are lazy getters. (2) `children()` is **lazy and per-mount**: it
  memoizes within a mount but does **not** survive unmount/remount, so a conditionally-rendered
  slot (e.g. `loadingText`, shown only while loading) is still legitimately re-created each time it
  re-enters — that is Solid's normal conditional-render model, not a leak, and `children()` does not
  (and should not) change it. So: use `children()` for a component-capable slot read inside a
  `<Show>` (hydration) **or** read more than once (single creation); a slot read exactly once,
  unconditionally, needs neither — a reflexive `children()` only adds a memo and shifts `_hk`.
  Regression-tested by `button-slot-resolution.browser.test.tsx` (counts real constructions).
