# ZagDialog — findings ledger (Phase 2)

`packages/components/src/zag-dialog/` is a feature-identical clone of `packages/components/src/dialog/`
whose behavior comes from `@zag-js/dialog@1.42.0` through the vendored Solid 2.0 adapter
(`@hope-ui/primitives/zag-solid`), sharing the *same* hope `dialog` recipe and importing nothing from
`@hope-ui/primitives/dialog`.

This file is the raw evidence for Phase 3 — **one row per thing that had to change**, with why. The
porting rule was: any ported test that has to change to pass is itself a finding. 43 tests, 39
passing, 4 skipped (one cause, row 12).

Do **not** read a verdict into this document. It records what happened; the go/no-go is Phase 3's job.

---

## A. Fixes that landed in the vendored adapter

Two defects were real bugs in `packages/primitives/src/zag-solid/`, not in the machine, and both were
fixed there rather than papered over in the component. They are recorded in the fork's deviation table
(`__internal__/primitives/zag-solid/machine.md`) and widen the spike's revert surface accordingly.

| # | What | Why it happened | Fix |
| - | ---- | --------------- | --- |
| A1 | **Every boolean `aria-*` the machine emitted was malformed.** An open modal shipped `aria-modal=""` (axe: `aria-valid-attr-value`), and a collapsed trigger shipped **no** `aria-expanded` at all. | Zag emits ARIA state as real booleans, which is correct for React — its DOM layer stringifies `aria-*`. `@solidjs/web`'s `setAttribute` is `value == null \|\| value === false ? removeAttribute(name) : setAttribute(name, value === true ? "" : value)`, and its SSR serializer agrees. Upstream `@zag-js/solid` has the identical bug; nothing there is exercised against axe, so it has never surfaced. | `normalizeProps` now stringifies boolean `aria-*` values (`normalize-props.md`). Upstreaming it is the real fix. |
| A2 | **Every controlled open/close emitted `[STRICT_READ_UNTRACKED]`**, which `mount()` fails a test on. | `@zag-js/dialog`'s `watch` tracks `prop("open")` and then runs `toggleVisibility`, which reads `prop("open")` again to pick `CONTROLLED.OPEN` vs `CONTROLLED.CLOSE`. Solid 2.0 runs an effect's second callback in a strict-read-labelled phase; Solid 1.x had no such phase, so upstream never had to spell this. | `createTrack` runs its callback as `untrack(effect)` (`track.md`). A `track` callback is a side effect, not a subscription — `deps` is the whole of its reactive input by construction. |

## B. Workarounds the component layer had to carry

The spike suspended CLAUDE.md's "primitives own all a11y and business logic" rule precisely so these
would be visible and countable. Each is code hope-ui would own forever under adoption.

| # | Workaround | Why Zag forces it |
| - | ---------- | ----------------- |
| B1 | **`createPresence` is kept**, driven off `api().open`, created eagerly on `Root` and shared by `Content` + `Positioner` (`Backdrop` keeps its own). | The dialog machine ships **no presence** — `connect()` emits `hidden` + `data-state` and nothing else. Ark composes a separate `@zag-js/presence`, which is animation-name based (`getComputedStyle().animationName` + `animationend`) while the hope recipe animates with CSS *transitions*; it would report exit-done immediately and drop the exit animation. Adoption does not remove `create-presence.ts` (249 lines) from the code we own. |
| B2 | **Zag's `hidden` is dropped** from `getBackdropProps()` / `getContentProps()`; presence gates the render instead. | `[hidden] { display: none }` is a UA rule that any explicit `display` beats, and every hope dialog slot sets one (`positioner` is `fixed inset-0 flex`, `content` is `flex flex-col`). Always-mounting the Zag way would leave a full-viewport layer over the page while closed. |
| B3 | **`closeOnInteractOutside` is passed explicitly on every render.** | Zag defaults it to `modal && !alertDialog`, so `role="alertdialog"` silently stops closing on an outside click. `compact()` drops an omitted key, so "explicitly, always" is the only way to hold hope's semantics. Regression-guarded by `keeps role='alertdialog' dismissable on an outside click`. |
| B4 | **`initialFocusEl` is passed explicitly on every render**, as a function returning `undefined`, behind a cast. | Same shape as B3: Zag defaults `initialFocusEl` to the close trigger under `role="alertdialog"`, where hope focuses the first focusable for both roles. `undefined` is the only value `@zag-js/focus-trap` reads as "no preference" — a `null` return **throws** in `getNodeForOption`. Zag types the return as `MaybeElement` = `HTMLElement \| null`, which **excludes the one value its own implementation needs**, hence the cast. |
| B5 | **`untrack` around `useMachine(...)` in `Root`.** | The adapter seeds the machine's bindables by reading its props memo straight from the render body — `initialState({ prop })` for the state cell, `prop("triggerValue")`/`prop("defaultTriggerValue")` for the context cell. Thirteen `[STRICT_READ_UNTRACKED]` per `Root` otherwise. (Left in the component, not the fork: unlike A2 these are genuine one-time seed reads that a *caller* can legitimately scope.) |
| B6 | **`mergePartProps`** (`zag-dialog-merge-props.ts`) — the adapter's `mergeProps` wrapped in `untrack`. | `connect()` returns a plain object computed eagerly, so it cannot be spread without freezing state. The adapter's `mergeProps` is the bridge, but it calls each source once at construction to enumerate keys — a reactive read in a render body, one diagnostic per part. |
| B7 | **`id` is stripped from the consumer's props in all seven Zag-backed parts.** | See C6. |

## C. Behavior / API deltas, measured

| # | Dialog | ZagDialog | Verdict |
| - | ------ | --------- | ------- |
| C1 | `aria-controls` only while open — a dedicated browser test, a dedicated SSR test, and a closed-state axe check exist to keep it that way. | `getTriggerProps()` sets it **unconditionally**, closed and during SSR. The shipped server HTML carries an IDREF resolving to nothing. | **Regression.** Every closed-state axe call needs `allowIncomplete: ["aria-valid-attr-value"]`. Fixable only by an override getter in the component (Zag exposes no prop). |
| C2 | `createHideOutside` layers `aria-hidden` **and** `inert`. | `@zag-js/aria-hidden` applies `aria-hidden` only (`hideOthers`; its `inertOthers` export exists but the machine calls `ariaHidden`). Background controls stay in the tab order inside an `aria-hidden` subtree. | **Regression.** axe raises `aria-hidden-focus` (serious) on every open modal; both open-state axe calls need `allowIncomplete`. The end result still looks right — the trap's `focusin` handler pulls focus back — but by a weaker mechanism: focus genuinely lands there first, where `inert` makes it unreachable. |
| C3 | `ModalBackdrop` — a real element blocking the pointer, deliberately spared from `inert`; a consumer `Dialog.Backdrop` hit-tests above it and keeps its handlers. | `pointer-events: none` + `data-inert` on `<body>`, with `auto` restored on the **layer node only** — the content. `Backdrop` and `Positioner` are `layerStyleTargets`, which get `--layer-index`/`--z-index` bookkeeping and no pointer restoration. | **Regression, and a subtle one.** A consumer's `ZagDialog.Backdrop` receives no `pointerdown`, no `click` and no `:hover` while modal — its handlers are simply dead. Dismissal still works (Zag listens on the document), so nothing looks broken. Every outside-click test had to be re-aimed at `<html>`. Upside: one fewer element, no backdrop-vs-`inert` interaction to get wrong. |
| C4 | `aria-labelledby`/`aria-describedby` come from ids **registered by the parts that actually mount**, so they are never dangling. | DOM-sniffed: `checkRenderedElements` runs in a `raf` after open with `rendered` defaulting to `{title: true, description: true}`. | **Regression, time-boxed.** A dialog with no `Description` advertises a dangling `aria-describedby` for ≥1 frame. Pinned by a new test with no Dialog counterpart. |
| C5 | Non-modal: focus is **not** moved into the dialog, and Escape restores it to the trigger (`createFocusRestore`, gated on `open()` alone — a deliberate fix). | Zag derives `trapFocus` from `modal`, and honours `restoreFocus` *inside the trap* (`returnFocusOnDeactivate`). A non-modal dialog therefore never restores — while its `setInitialFocus` action still moves focus in. Escape leaves focus on `<body>`. | **Regression**, and exactly the bug hope fixed by lifting restore out of the focus trap. |
| C6 | A consumer `id` on `Content` is honoured, and `aria-controls` points at it. | Impossible. Every part id is `dialog:<scope>:<part>` and the machine finds its own elements with `getElementById`; letting a consumer `id` through breaks the dismiss layer, the focus trap and the aria-hiding at once. | **Regression.** Each part now drops `id` from the consumer's props outright. The supported route is the machine's `ids` prop on `Root` — a Root-level prop for a Content-level concern. |
| C7 | Synchronous state (`createControllableState`). | `send` is `queueMicrotask`-deferred by design, and a controlled change routes `watch` → `toggleVisibility` → `CONTROLLED.OPEN`. | **Neutral-to-worse.** Every observation of a state change in the ported suite became a `vi.waitFor`. No user-visible defect found. |
| C8 | `initialFocus` on `Content`. | `initialFocusEl` is a machine prop, so it moves to `Root`. | **Public API delta** — the only one. Docs/examples would need the change. |
| C9 | `aria-modal` omitted when non-modal. | Stated explicitly as `aria-modal="false"`. | **Delta, arguably better.** Both are correct ARIA. |
| C10 | — | `tabIndex: -1` on the content. | **Improvement**, adopted for free. |
| C11 | — | `data-scope`/`data-part` markers on every part, `--layer-index`/`--nested-layer-count`/`--z-index` inline custom properties, `data-ownedby` carrying the scope id. | **Neutral.** Extra DOM noise beside our `data-slot`; harmless, and the layer variables are a real nesting feature we don't currently have. |
| C12 | — | Unexposed Zag extras: `finalFocusEl`, `restoreFocus`, `trapFocus`, `preventScroll`, `persistentElements`, `triggerValue`/multi-trigger, `aria-label`, `ids`, `dir`. | **Extra.** `persistentElements` and multi-trigger are genuinely useful and have no hope equivalent. |

## D. The one that stopped the port

| # | Finding |
| - | ------- |
| D1 | **Unmounting an open ZagDialog poisons every dialog after it.** `@zag-js/dismissable` keeps its layer registry in a **module-scope `layerStack` singleton**. Unmount while open and that entry survives; from then on every new dialog sits below a phantom pointer-blocking layer, so `layerStack.isTopMost` is false — its Escape handler early-returns — and `assignPointerEventToLayers` gives it `pointer-events: none`. It opens, and **nothing dismisses it**, with no error, no warning and a clean DOM. In an app this is one route change away. `@zag-js/remove-scroll` (`lockMap`) and `@zag-js/focus-trap` (`trapStack`) hold module-scope state of the same kind. This is precisely what CLAUDE.md forbids in the kernel — `createScrollLock` and `createHideOutside` key their counts off `document.body` under `Symbol.for` for exactly this reason — except here it lives in a dependency. **`layerStack` is not exported**; the package's `exports` map blocks even a deep import, so neither a consumer nor a test can reset it. Pinned by `ZagDialog teardown > unmounting an open dialog poisons the next one`. **Four tests are skipped because of it** — `merges a consumer ref on Content`, `auto-renders a corner CloseTrigger`, `leaves the DOM clean when an open dialog is unmounted`, and one of the three hydration tests. Each passes in isolation and fails in sequence, and the port has no way to make them order-independent. Time-boxed and left skipped deliberately. |

## E. What came through unchanged

Worth as much as the deltas. These ported verbatim and passed with no edit: opening/closing via the
trigger, Escape-to-close with focus restore (modal), the `CloseTrigger`, focus trapping, the
`data-presence` enter/exit lifecycle, `onOpenChange`, controlled `open`, `modal` prop precedence
through `withDefaults`, `closeOnEscape={false}` / `closeOnInteractOutside={false}`, scroll lock and
its restoration, `role="alertdialog"`, a consumer `ref` merging through `renderElement`, all nine
recipe slots and their `data-slot` markers, `showCloseButton`, `preventDefault()` as the consumer's
cancel channel on both the trigger and the close trigger, and a consumer `aria-labelledby` winning
over `Title`.

Two structural results are worth calling out on their own:

- **The SSR → hydrate round-trip passed on the first try**, which was the live risk going in: the
  adapter's boxed `bindable`, a machine started in `onSettled`, and `createUniqueId()` feeding the
  machine's scope id all survive `renderToStringAsync` → `hydrate` with no mismatch and no
  client-render fallback.
- **`preventDefault()` works only with the sources in the right order**, and the ordering is not the
  obvious one. `mergePartProps(zag, consumer, overrides)`: plain keys resolve last-defined-wins, so
  the consumer outranks the machine — but `@zag-js/core`'s `mergeProps` folds a newly-seen handler
  in *ahead* of the accumulated one, so the same order runs the consumer's handler **first**. Zag's
  handlers all open with `if (event.defaultPrevented) return`, which is what makes the cancel channel
  work. Getting this backwards silently disables it.

## F. Volume (for Phase 3's axis 2)

Not yet the full accounting — Phase 3 owns that. Raw numbers as built:

| | Lines |
| - | ---- |
| `packages/components/src/zag-dialog/` (15 source files, excl. tests/stories) | 730 |
| `packages/primitives/src/zag-solid/` (forked adapter — permanently owned) | 746 |
| `create-presence.ts` (still required — B1) | 249 |
| Handmade baseline: `primitives/dialog` + kernel primitives + `components/dialog` | ≈ 2130 |
