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
  consumer's `vite-plugin-solid` compiles per environment (see `__internal__/plan.md`, "Distribution
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
  `createFocusTrap`/`createDismissable`; see `createDialogContent`/`createDialogBackdrop`
  (`packages/primitives/src/dialog/dialog-content.ts` and `.../dialog-backdrop.ts`)
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
  `__internal__/primitives/utils/defaults.md`.
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
- **The trigger for `children()` is a component-valued *prop* read more than once in a render —
  and the `<Show>` `when`+body idiom is the special case where it is load-bearing for hydration.**
  A consumer's `startDecorator={<Icon/>}` compiles to a getter that runs `createComponent(Icon)`
  on **every** read, so reading the same prop in `N` places within one render builds it `N` times
  and discards `N−1`. Resolve it **once** with Solid's `children()` in the component body and read
  the memoized accessor everywhere. Two distinct guarantees, on two axes:
  - **Single creation (always, no `<Show>`/SSR needed).** Button's `loadingText`
    (`JSX.Element | (() => JSX.Element)`) was read three ways — the loader-placement decision, the
    label gate, and the label render — so a loading render constructed it three times. Pure wasted
    work (and lost internal state) on the client. `children()` collapses it to one construction.
  - **Hydration (the `<Show>` `when`+body case).** `<Show when={x != null}>…{x}…</Show>` reads `x`
    **twice**: once in the `when` gate and once in the body. The `when` read builds a component just
    to test truthiness and **throws it away** — but it still allocates a hydration key, and `<Show>`
    evaluates its `when` in a *different owner on the client than the server* (the client wraps it in
    a memo/insert-effect owner; the server's `createComponent(Comp) === Comp()` runs in the ambient
    owner). So the discarded component's key lands at a different position on each side and the real
    body node comes out one `_hk` off: `Hydration tag mismatch for key "…": expected <svg> but found
    <span>` (historically also a `getNextSibling` null crash), caught by the route error boundary,
    which then silently client-renders — console fills with errors and the SSR benefit is lost.
    Upstream `@solidjs/web` beta asymmetry, still open through at least `2.0.0-beta.20`
    (solidjs/solid#2384, solidjs/solid-start#1089). `children()` fixes it because the `when` gate
    then reads the **resolved** accessor (`when={startDecorator() != null}`) — no phantom build in
    the gate, and the single resolved component is allocated in the ambient owner like a direct
    child, so hydration realigns.
- **What does *not* need `children()` — established with isolated SSR→hydrate round-trips, not just
  reasoning:**
  - **A single read — even inside a `<Show>`.** `<Show when={someFlag()}>{x}</Show>` reading `x`
    once hydrates cleanly. It is **not** "read inside a `<Show>`" that breaks hydration (an earlier,
    wrong framing); it is the *second* read, in the `when` gate. A `<Show>` on its own does not move
    the key.
  - **A double read that does not straddle the `when` gate.** Two reads confined to the body
    (`{x != null ? x : null}`), or two reads with **no** `<Show>` at all, hydrate fine — the extra
    build lands in the *same* owner on both sides, so the burned key is symmetric. (They still waste
    a construction, so the single-creation axis may still want `children()` — just not for hydration.)
  - **A static / directly-written child** (`<Button><Icon/></Button>`): compiled to a value created
    **once**, not a getter, so it never multiplies. Only *props* carrying JSX are lazy getters.
  - `children()` is also **lazy and per-mount**: it memoizes within a mount but does **not** survive
    unmount/remount, so a conditionally-shown slot (e.g. `loadingText`) is legitimately re-created
    each time it re-enters — Solid's normal conditional-render model, not a leak.
  **`children()` decision procedure:** resolve once and read the accessor **iff the component-valued
  prop is read more than once** in a render; a slot read exactly once — `<Show>` or not — needs
  neither (a reflexive `children()` only adds a memo and shifts `_hk`). Pinned in
  `packages/primitives/src/__tests__/solid-contract.ssr.test.tsx` (the `when`-gate read is the extra
  key; a single body read inside a `<Show>` is not) and regression-tested by `button-icons`/
  `badge-icons` (hydration round-trip) and `button-slot-resolution.browser.test.tsx` (counts real
  constructions).
