# Reference implementations

Where to look when building or debugging a kernel primitive. This captures the sources evaluated
while porting the signal-based navigation kernel — and the sources chosen for the overlay
primitives still to build (`createFloating`, `createHoverIntent`) — so future work doesn't
re-derive the map.

**References policy** (see also `CLAUDE.md`): Angular Aria, Astryx, react-aria, floating-ui (both
the `@floating-ui/react` and `@floating-ui/vue` ports) and Base UI are **adapt-and-credit**
references — read their reasoning and public API, adapt, and credit any verbatim borrowing. When a
reference exists in more than one framework port, prefer the **fine-grained-reactive** one (Vue,
Angular signals) over the re-render one (React): its lifecycle
(`ref`/`computed`/`watch`/`onScopeDispose`) ports to Solid's
`createSignal`/`createMemo`/`createEffect`/`onCleanup` almost 1:1 — the same reason Angular Aria
won the navigation bake-off (§3).

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

### `createFloating` (planned) — overlay positioning

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

Two Solid-2.0 hazards the Vue port won't flag (see `docs/solid-2.0-notes.md`): the watched
reference/floating **elements** are conditionally rendered, so back them with `createSignal` and
track them in the `compute` callback (never read a plain ref accessor there); and `autoUpdate`/
`computePosition` are client-only — effect-gate them (nothing runs under `renderToStringAsync`).

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

---

## 2. Per-component pointers

For each planned component, the references to open, ranked. (These components are follow-up work; the
kernel above is what they compose.)

| Component | References, ranked |
|---|---|
| **Listbox** | Angular Aria `listbox` (canonical) · react-aria `useListBox` · Base UI `listbox` |
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
| overlay positioning (placement/flip/shift/arrow/autoUpdate) | **Wrap** `@floating-ui/dom`; port `@floating-ui/vue` `useFloating`/`arrow` + Base UI `useAnchorPositioning` (API vocab) — see §1 `createFloating` |
| menu-hover intent / safe triangle | **Future port** — Astryx `useMenuHover` (wiring) + floating-ui `safePolygon.ts` (geometry) — see §1 `createHoverIntent` |
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
