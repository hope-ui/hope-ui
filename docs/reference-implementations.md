# Reference implementations

Where to look when building or debugging a collection/navigation component. This captures the
sources evaluated while porting the signal-based navigation kernel (see
[`list-navigation-port-plan.md`](list-navigation-port-plan.md)) so future work doesn't re-derive the
map.

**References policy** (see also `CLAUDE.md`): Angular Aria, Astryx, react-aria and floating-ui-react
are **adapt-and-credit** references — read their reasoning and public API, adapt, and credit any
verbatim borrowing. Kobalte and Corvu are **anti-pattern case studies only** — never copy their code
or keep the shape of anything from them.

---

## 1. Per-behavior source map

The kernel primitives live in `packages/primitives/src/internal/` (and `utils/`). For each, the
reference file(s) that informed it.

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
| menu-hover intent | **Future port** — Astryx `useMenuHover` |
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
the calendar month-flip pattern. Kobalte/Corvu were consulted only as anti-patterns (Corvu's
`@corvu/popover` depending on `@corvu/dialog` is the cross-component-import mistake this kernel avoids
by design).
