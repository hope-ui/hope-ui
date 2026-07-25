# Reference implementations

Where to look when building or debugging a kernel primitive. This captures the sources evaluated
while porting the signal-based navigation kernel and `createFloating` — and the sources chosen for
the overlay work still to build (`createHoverIntent`, nested-overlay ordering) — so future work
doesn't re-derive the map. **Negative results are recorded too**: §1's nested-overlay entry exists
mostly to stop the next reader re-surveying three references that turn out not to implement it at
all.

**References policy** (see also `CLAUDE.md`): Angular Aria, Astryx, react-aria, floating-ui (both
the `@floating-ui/react` and `@floating-ui/vue` ports) and Base UI are **adapt-and-credit**
references — read their reasoning and public API, adapt, and credit any verbatim borrowing. When a
reference exists in more than one framework port, prefer the **fine-grained-reactive** one (Vue,
Angular signals) over the re-render one (React): its lifecycle
(`ref`/`computed`/`watch`/`onScopeDispose`) ports to Solid's
`createSignal`/`createMemo`/`createEffect`/`onCleanup` almost 1:1 — the same reason Angular Aria
won the navigation bake-off (§3).

**Port the hooks a reference composes; do not stand in for them.** When the source you are porting
calls a hook this kernel does not have, port that hook first — as its own primitive, in
`internal/`, with its own Definition of Done — and only then write the consumer over it. A narrower
hand-rolled substitute is not a cheaper route to the same behavior; it is a *different* behavior
that happens to satisfy the case you were looking at. If a port needs `useLongPress`, build
`createLongPress`; don't approximate it with a `setTimeout` in the consumer. And before building
anything, **check `internal/` first** — the hook may already be here.

The rule exists because the calendar/React Aria parity work nearly shipped without it. RA's
range-calendar auto-advance is gated on `e.pointerType === 'keyboard'` (`useCalendarCell.ts:300`), a value produced
by `usePress`. Two substitutes were proposed and rejected: an ad-hoc `onKeyDown` handler, and
`event.detail === 0`. The latter is the instructive one — `detail === 0` is also true of a screen
reader's virtual click, and RA routes *that* down a deliberately different branch: select the date,
but do **not** advance the focused date (`useCalendarCell.ts:307`). Either hatch would have silently
shipped the wrong behavior for AT users, and no sighted-keyboard test would have caught it. The real
primitive — `packages/primitives/src/internal/create-press.ts`, which already models
`mouse | pen | touch | keyboard | virtual` — had existed for the whole design discussion and was
nearly missed. Missing hooks are visible; missing *distinctions inside* a hook are not, which is
why the substitute has to be refused on principle rather than judged case by case.

---

## 1. Per-behavior source map

The kernel primitives live in `packages/primitives/src/internal/` (and `utils/`). For each, the
reference file(s) that informed it. Entries marked **(planned)** are not built yet — the source
map is recorded up front so the build doesn't re-derive it.

### `createListFocus` — the foundation

- **Angular Aria** `src/aria/private/behaviors/list-focus` — **primary architectural reference.** The
  active-item + `roving | activedescendant` split, `getItemTabindex`/`getListTabindex`/
  `getActiveDescendant`, injected into every other behavior. Signals ≈ Solid signals, so the
  decomposition ports almost 1:1.
- **react-aria** `packages/@react-aria/selection` — `useSelectableCollection` for the
  virtual-mode tabindex-omit (iOS VoiceOver) and the "focused key" bookkeeping.

### `createCollection` / `createVirtualCollection` — the item source

- **Angular Aria** `SortedCollection` + `private/behaviors/list` — the DOM-order registry.
- **react-aria** virtualizer (`@react-aria/virtualizer`) + **TanStack Virtual** (`@tanstack/virtual-core`)
  — the windowed source: `scrollToIndex(index, {align})` to bring an unmounted target in, and
  `measureElement` for variable row sizes. We adopt `@tanstack/virtual-core` and write the Solid
  binding ourselves (not `@tanstack/solid-virtual`, which is Solid-1.x-compiled).

### `createListNavigation`

- **Angular Aria** `private/behaviors/list-navigation` — arrows/wrap/orientation/RTL, skip-disabled.
- **react-aria** `ListKeyboardDelegate` + `DOMLayoutDelegate` — the edge-case checklist (wrap, RTL,
  first/last with disabled items).
- **floating-ui-react** (via Base UI) `useListNavigation` — the ref-array + `virtual` dual-mode.
- **Angular CDK** `a11y/key-manager` (`list-key-manager`, `focus-key-manager`,
  `activedescendant-key-manager`) — validates the focus/navigation split.

### `createListTypeahead`

- **Angular Aria** `private/behaviors/list-typeahead`; **Angular CDK** `a11y/key-manager/typeahead`
  — the standalone buffered typeahead.
- **react-aria** `useTypeSelect` — the matching rules ported here: start point, repeated-letter
  cycling, typeahead-from-focused-key, leading-space handling.

### `createListSelection`

- **Angular Aria** `private/behaviors/list-selection` — single/multiple, follow/explicit, range.
- **react-aria** `useSelectableCollection`/`useSelectableItem` — the behavior/edge-case checklist:
  select-on-focus, Ctrl+A, shift-extend from an anchor, virtual-mode selection.

### `createListExpansion`

- **Angular Aria** `private/behaviors/expansion` — single/multiple expand for Accordion/Tree/Disclosure.

### `createGridNavigation`

- **Angular Aria** `src/aria/private/grid` — 2D row/cell navigation, span-aware, roving⇆AD.
- **Astryx** `packages/core/src/hooks/useGridFocus` — the **calendar** month-flip via
  `onNavigateBefore`/`onNavigateAfter`, and caret-guard details.
- **floating-ui-react** `hooks/gridNavigation` — a second 2D reference.

### `createKeyboardHandler` (`utils/`)

- **Angular Aria** `private/behaviors/event-manager` — the declarative, modifier-aware keymap idea.

### `createFloating` — overlay positioning

Wraps `@floating-ui/dom` (placement, flip/shift, offset, arrow, autoUpdate); adopted as an optional
peer dependency, same pattern as `@tanstack/virtual-core`. Positioning only — interaction concerns
(dismiss, hover intent) are separate primitives, exactly as floating-ui splits its own packages.

- **floating-ui `@floating-ui/vue`** `packages/vue/src/useFloating.ts` — **primary structural
  reference.** Vue 3's fine-grained reactivity maps to Solid almost 1:1: `ref`/`shallowRef` →
  `createSignal`, `computed` → `createMemo`, `watch(…, { flush: 'sync' })` →
  `createEffect(depsFn, computeFn)`, `toValue` (ref-or-plain option) → accessor-or-value via
  `runIfFunction`, `onScopeDispose` (autoUpdate teardown) → `onCleanup`. Prefer this over the React
  port (`@floating-ui/react-dom` `src/useFloating.ts`), whose `useState`/`useLayoutEffect`/
  memoization machinery is re-render bookkeeping you'd have to reverse out.
- **floating-ui `@floating-ui/vue`** `packages/vue/src/arrow.ts` — the reactive ref-binding for the
  `arrow` middleware. `createFloating` owns arrow **measurement** only (`middlewareData.arrow` =
  `{x, y, centerOffset}` + the derived static side); the visual 45° rotation / static-side pinning
  is CSS the themeable component writes, not a number the kernel owns.
- **Base UI** `packages/react/src/utils/useAnchorPositioning.ts` — the **API-vocabulary** reference
  (not wiring): `side`/`align`/`sideOffset`/`alignOffset`/collision padding and the anchor↔positioner
  split. React is irrelevant here — only its option surface is borrowed.

Two Solid-2.0 hazards the Vue port won't flag (see `__internal__/solid-2.0-notes.md`): the watched
reference/floating **elements** are conditionally rendered, so back them with `createSignal` and
track them in the `compute` callback (never read a plain ref accessor there); and `autoUpdate`/
`computePosition` are client-only — effect-gate them (nothing runs under `renderToStringAsync`).

**As built** (`packages/primitives/src/internal/create-floating.ts`; usage doc
`__internal__/primitives/internal/create-floating.md`). Four deliberate divergences from the map
above:

- **Reactive options are object getters, not accessor-or-value via `runIfFunction`.** The
  `toValue` → `runIfFunction` line was a Vue→Solid mapping note written before the getter idiom
  settled across eight primitives. Following it literally would fork the kernel's convention in its
  most-consumed primitive *and* collide with floating-ui itself: `runIfFunction` is only sound when
  `T` is not callable, and floating-ui's option surface is full of callables (`Derivable<T> =
  (state) => T` on `offset`/`flip`/`shift`/`size`, plus `Middleware.fn`), so
  `sideOffset?: number | (() => number)` would be ambiguous against `offset(state => …)`.
- **The `size` middleware is in, opt-in and measurement-only** (`trackSize` → `size()`), a scope
  addition beyond the recorded line: ~20 LOC now versus a Select/Combobox retrofit later. The kernel
  records `{anchorWidth, anchorHeight, availableWidth, availableHeight}` and never writes
  width/max-height onto the element — the same line this record already draws for the arrow, which
  also sidesteps `size`'s ResizeObserver feedback loop.
- **`VirtualElement` anchors are supported in v1** — a type widening at roughly zero cost, which
  unblocks a pointer-anchored ContextMenu.
- **RTL is delegated to floating-ui's DOM platform** (`isRTL` = `getComputedStyle(el).direction`),
  with **no** `@hope-ui/i18n` import: threading `useLocale()` in would create a second, divergent
  source of truth. Alignment is logical for free.

  **Logical sides: revisited 2026-07-25, and now offered.** The original record concluded that
  logical *sides* (`inline-start`/`inline-end`) could not be supported without reintroducing that
  coupling. That turned out to be avoidable rather than inherent, and both named references had
  already gone the other way:

  - **React Aria** accepts logical `'start'`/`'end'` on input and resolves them with
    `translateRTL(placement, direction)` off `useLocale()`, reporting a strictly physical
    `PlacementAxis` back out (`useOverlayPosition.ts`). It has no floating-ui underneath, so it has
    only ever had one direction authority.
  - **Base UI** — the directly analogous case, since it *is* built on floating-ui — has
    `Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'`, maps logical→physical
    at the input boundary, and re-derives the resolved side back into the **input's own** vocabulary
    (`getLogicalSide`, `internals/useAnchorPositioning.ts`). Its direction comes from its own
    `DirectionContext` — i.e. it simply accepted the two-sources-of-truth cost.

  hope-ui takes the input half and declines the output half:

  - **Input is logical, resolved from the DOM — specifically from the *floating* element.**
    `@floating-ui/core` always calls `platform.isRTL(elements.floating)`, and `@floating-ui/dom`
    implements that as `getComputedStyle(element).direction === "rtl"`. `createFloating` calls the
    same function on the same element, so a logical side and floating-ui's own alignment handling
    **cannot** disagree. That is strictly better than Base UI on the exact axis this record cared
    about, and `@hope-ui/i18n` still never enters the positioning layer. The consequence to know: a
    portaled positioner inherits `dir` from where it is portaled to, not from the anchor's subtree —
    which is already how floating-ui treats alignment.
  - **Output stays physical, always.** `side()` and `data-placement` report where the layer actually
    landed after `flip`, which is a physical fact. Mirroring the input vocabulary the way Base UI does
    is a footgun *here specifically*: hope-ui has a closed `RecipeRegistry` and a third-party preset
    conformance kit, so a recipe author selecting on `data-placement` cannot know which vocabulary the
    consumer happened to ask in. Recipes get the inline-relative hook from CSS instead —
    `data-placement-inline-start`/`-end` are `@custom-variant`s derived from the physical attribute
    plus `:dir()` (`_base/_variants.css`), so there is no second attribute and no JS bookkeeping.
  - **Timing.** Nothing emitted `data-placement` yet when this was settled (Tooltip/Popover are T2,
    Select T3), so the change cost nothing; doing it after those shipped would have been a breaking
    change to public data attributes and to third-party recipes.

  The one seam that cannot be direction-resolved is the SSR seed: there is no floating element and no
  `getComputedStyle`, so a logical side seeds as if `ltr`. Invisible by construction —
  `isPositioned()` is false and the layer is `visibility: hidden` until the first measurement — and it
  keeps the server's bytes identical to the client's first render, which is what hydration compares.

`hide()` needed no kernel support at all: unlike `size` (whose numbers arrive through an `apply`
callback with nowhere to land), it writes straight to `middlewareData`, which the `middleware` +
`middlewareData()` escape hatch already exposes. Documented as the worked example instead.

### `createHoverIntent` (planned) — hover open/close intent + safe triangle

The pointer-tracking grace area (the "safe triangle") that keeps a hover-triggered popup open while
the cursor travels diagonally from anchor into popup. **Deliberately separate from `createFloating`**
— positioning vs interaction, the same split floating-ui itself draws (`arrow` lives in the
positioning core; the safe polygon lives in the interaction layer). A click-triggered Popover
composes `createFloating` alone; a hover-triggered Menu/HoverCard composes both.

- **Astryx** `packages/core/src/hooks/useMenuHover` — **primary port** for the wiring (already a
  Solid-adjacent signal shape: open/close intent, submenu safe-triangle).
- **floating-ui `@floating-ui/react`** `packages/react/src/safePolygon.ts` — the framework-agnostic
  **geometry** (builds the polygon from cursor + popup rect, `pointInPolygon` hit-testing). Port the
  math, not `hooks/useHover.ts`'s React lifecycle. floating-ui generalizes the classic triangle to a
  polygon (accounts for placement, gap, buffer) — same concept.

### Nested overlay ordering (planned) — `createDismissable` + `createHideOutside`

Both primitives currently handle exactly one layer. Popover is the first consumer that stacks a
second one on Dialog, and it breaks them in two distinct ways:

- **Escape and outside-pointerdown reach every open layer.** `create-dismissable.ts` attaches its
  listeners to `document` per instance with no ordering guard, so dismissing a Popover inside a
  Dialog closes both.
- **The Dialog's `MutationObserver` hides the Popover.** A portaled popup lands on `document.body`
  after the Dialog's `createHideOutside` is already observing; it isn't in that layer's static
  `spare` array, so it gets `aria-hidden` + `inert`.

**Two registries, not one.** They answer different questions and merging them is a bug: a Dialog with
`dismissOnEscape: false` still participates in hide-outside ordering but must never win Escape.
react-aria keeps them fully separate (`visibleOverlays` in `useOverlay`, `observerStack` in
`ariaHideOutside`, `focusScopeTree` in `FocusScope`) and never centralizes them into one overlay
manager — which is also the argument against `roadmap.md`'s speculative `createOverlayStack` row.
Each registry lives on `document` under a `Symbol.for(…)` key, per CLAUDE.md's no-module-scope rule.

**The policy shortcut does not apply here.** Prefer-the-fine-grained-reactive-port has no candidate:

| Source | Nested-overlay handling |
|---|---|
| **Astryx** `packages/core/src/hooks` | **None.** 53 files — `useFocusTrap`, `useScrollLock`, `useMenuHover`, `useListFocus` — with no dismiss, overlay, or layer hook of any kind |
| **Angular Aria** `private/behaviors/popup` | **None.** `open`/`close`/`toggle` over one `expanded` signal + ARIA wiring; single popup only |
| **floating-ui `@floating-ui/vue`** | **None.** Positioning only (`useFloating.ts`, `arrow.ts`, `types.ts`, `index.ts`) — the interaction layer exists solely in the React port |

react-aria and Base UI are therefore not a fallback, they are the only implementations.

**`createHideOutside` → react-aria `ariaHideOutside`.** Already its source (the TreeWalker
accept/skip/reject strategy and the `MutationObserver` rationale are credited in the file's own
comments), so this is finishing a port rather than choosing one. The per-element ref count is
already here; three pieces are not:
- `react-aria/src/overlays/ariaHideOutside.ts:39` `observerStack` — a new call disconnects the
  previous observer (`:166`) and cleanup restarts it (`:288`), so only the innermost layer observes.
- `:299` `keepVisible(element)` — dynamic registration into the *current topmost* layer's
  `visibleNodes`, returning an undo. hope-ui's `spare` is static and per-layer, so it cannot express
  "spare this in whichever layer is on top right now".
- `:21` `isAlwaysVisibleNode` — a declarative `data-*` opt-out (`data-react-aria-top-layer`,
  `data-live-announcer`) checked inside the observer, so content appearing later is spared with no
  registration at all.

**`createDismissable` → react-aria `useOverlay` for the mechanism, Base UI `useDismiss` for the API
vocabulary.**
- `react-aria/src/overlays/useOverlay.ts:61` — a flat mount-order array, topmost wins (`:95`). The
  pointer path is two-phase (`:100`–`:126`): capture the topmost at pointerdown *start*, dismiss only
  if the same layer is still topmost when the interaction completes.
- One asymmetry worth knowing before porting: react-aria's Escape is **element-scoped** (`useKeyboard`
  → `keyboardProps` spread on the overlay, `:129`), so it only fires with focus inside; only
  outside-press is document-level (`react-aria/src/interactions/useInteractOutside.ts:80`). hope-ui's
  Escape *is* document-level, so the stack carries more weight here than it does upstream.
- **Base UI** `floating-ui-react/hooks/useDismiss.ts` — the `bubbles` option, normalized per event
  type (`escapeKey` / `outsidePress`). "Should Escape on the nested Popover also close the Dialog?"
  is a genuine consumer choice and react-aria has no name for it. API surface only, same borrowing
  as `useAnchorPositioning` above.

**Rejected for now: the layer *tree*.** Base UI vendors floating-ui-react's
`FloatingTree`/`FloatingTreeStore`, and `useDismiss` asks `getNodeChildren` whether a descendant is
open. Real ancestry, but it costs `<FloatingTree>` + `<FloatingNode>` JSX wiring in a kernel that is
hooks-only by design (`ModalBackdrop` is deliberately its one DOM-rendering component), and it forces
every overlay component to declare its node. A flat stack needs no consumer wiring and survives
portals for free, because mount order does not depend on DOM ancestry. **Revisit at Menu**, where
submenu chains make `getNodeChildren` load-bearing — the tree composes with the flat stack rather
than replacing it, exactly as floating-ui-react's own `useDismiss` uses both.

---

## 2. Per-component pointers

For each planned component, the references to open, ranked. (These components are follow-up work; the
kernel above is what they compose.)

| Component | References, ranked |
|---|---|
| **Listbox** | Angular Aria `listbox` (canonical) · react-aria `useListBox` · Base UI `listbox` |
| **Popover** | Base UI `popover` (anatomy + API surface) · react-aria `usePopover`/`useOverlay` · over `createFloating` + `createDismissable` — **not** over Dialog's modal machinery |
| **Menu** | Angular Aria `menu` (+ `expansion`/`popup`) · Base UI `menu` · Astryx `useMenuHover` |
| **Select / Combobox** | Angular Aria `combobox` (pluggable-widget popup) · react-aria `useComboBox`/`useSelect` · Base UI |
| **Tabs** | Angular Aria `tabs` (roving + follow-focus selection) |
| **Toolbar** | Angular Aria `toolbar` |
| **Accordion** | Angular Aria `accordion` (+ `createListExpansion`) |
| **Tree** | Angular Aria `tree` (navigation + expansion, `aria-level`/`aria-expanded`) |
| **Calendar Grid** | **Astryx `useGridFocus`** (month-flip) over `createGridNavigation` |
| **Data / composite Grid** | Angular Aria `private/grid` over `createGridNavigation` (span-aware) |

---

## 3. Port / reference / skip verdicts

Consolidated verdicts from the evaluation.

| Capability | Verdict |
|---|---|
| list-focus / navigation / selection / typeahead / expansion / grid | **Ported** (this work) — Angular Aria signal behaviors |
| `announce` (live-region) | **Future port** — Astryx `useAnnounce` |
| overlay positioning (placement/flip/shift/arrow/autoUpdate) | **Wrapped** — `internal/create-floating.ts`, over `@floating-ui/dom` (optional peer); ported from `@floating-ui/vue` `useFloating`/`arrow` with Base UI `useAnchorPositioning`'s API vocab — see §1 `createFloating` |
| menu-hover intent / safe triangle | **Future port** — Astryx `useMenuHover` (wiring) + floating-ui `safePolygon.ts` (geometry) — see §1 `createHoverIntent` |
| nested dismissal ordering (Escape / outside-press across layers) | **Future port** into the existing `internal/create-dismissable.ts` — react-aria `useOverlay`'s `visibleOverlays` + two-phase pointer guard (mechanism) with Base UI `useDismiss`'s `bubbles` (API vocab). **Not** Astryx / Angular Aria / `@floating-ui/vue` — none implement it — see §1 |
| nested `aria-hidden` + `inert` (portaled child of a modal) | **Finish the port** into the existing `internal/create-hide-outside.ts` — react-aria `ariaHideOutside`'s `observerStack`, `keepVisible`, and `data-*` top-layer opt-out — see §1 |
| overlay layer *tree* (submenu chains) | **Deferred to Menu** — Base UI `FloatingTree`/`FloatingTreeStore` + `getNodeChildren`. Composes with the flat stack, doesn't replace it; rejected for Popover on consumer-wiring cost — see §1 |
| unified overlay manager / `createOverlayStack` | **Skip as specified.** `roadmap.md` #14 is a placeholder name with no reference behind it; react-aria keeps three independent registries and centralizes nothing — see §1 |
| input-container (combobox text sync) | **Future port** — Astryx `useInputContainer` |
| media-query / hotkeys / overflow observers | **Adopt** `@solid-primitives/*` (see `solid-primitives-eval.md`) |
| focus-trap / scroll-lock / presence | **Already have** in the kernel |
| streaming-text / image-mode / keyboard-hint (Astryx) | **Skip** — out of scope for a headless kernel |

### Why Angular Aria won the architecture bake-off

Four candidates were evaluated for the navigation architecture: Astryx, react-aria `selection`,
floating-ui-react, and Angular CDK key-manager. Angular's **new signal-based**
`src/aria/private/behaviors/` won because Angular signals ≈ Solid signals, so its decomposition — a
foundational `list-focus` owning the active item and the roving/activedescendant switch, with
navigation/selection/typeahead each *injecting* that one focus instance, plus expansion and a 2D grid
layered on top — ports almost directly to Solid's `createX` + split-`createEffect` idiom. react-aria's
`selection` remained invaluable as the **edge-case checklist**, and Astryx's `useGridFocus` supplied
the calendar month-flip pattern. A higher-level primitive depending on a sibling component package
(rather than the shared kernel) is a cross-component-import anti-pattern this kernel avoids by design.
