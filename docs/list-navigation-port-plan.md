# Port Angular Aria's signal-based navigation kernel → hope-ui `createX` primitives

> Status: **approved, not yet started.** This is the execution plan for a fresh session.
> Companion deliverable: `docs/reference-implementations.md` (created as part of this work).

## Context

hope-ui has zero collection/list-navigation capability today. Its `packages/primitives/src/internal/`
kernel covers overlays (focus trap, dismissable, presence, hide-outside, scroll-lock, registered
element/id) but nothing for roving focus, `aria-activedescendant`, arrow-key navigation, selection,
or typeahead. Every collection component on the roadmap — Menu, Listbox, Select, Combobox, Tabs,
Toolbar, Accordion, Tree, and a data/calendar Grid — needs this, and `docs/plan.md` already reserves
it (phase 4 Listbox/Select "forces collection/selection state + keyboard navigation/typeahead"; the
kernel is meant to gain `createRovingFocus`/`createTypeahead`/`createCollection`).

Four reference implementations were evaluated (Astryx, react-aria `selection`, floating-ui-react,
Angular CDK key-manager) and one clear winner emerged for the **architecture**: Angular's new
**signal-based** `src/aria/private/behaviors/` kernel. Angular signals ≈ Solid signals, so its
decomposition ports almost 1:1: a foundational `list-focus` that owns the active item and the
`roving | activedescendant` switch, with `list-navigation`, `list-selection`, and `list-typeahead`
each injecting that one focus instance, plus `expansion` and a 2D `grid` layered on top. This plan
ports those six behaviors + the grid, adapted to hope-ui's conventions, and captures every reference
source in a repo doc so future component work knows where to look.

**Three decisions locked with the user:**
1. **Fine-grained, Angular-Aria-aligned names** (`createListFocus`, not a coarse `createRovingFocus`).
   `docs/plan.md`'s reserved names get updated to match.
2. **DOM-first registry (Model A)** driving a **declarative compound API** — `<Listbox.Root>` with
   `<Listbox.Option>` children as the source of truth; each part registers its own element+metadata.
   Explicitly NOT a data-source-props API (`<Listbox options={...} valueKey=...>`). To keep
   virtualization possible, the item source is an **abstract seam** (see below), not hard-wired to the
   DOM registry.
3. **Virtualization is first-class**, built in this port via a `createVirtualCollection` adapter over
   **TanStack Virtual**. It's the right target because it exposes `scrollToIndex(index, {align})` (the
   "bring an unmounted nav target into view" hook) and variable item sizes via `measureElement` —
   both of which `@solid-primitives/virtual` lacks (no `scrollToIndex`, uniform `rowHeight` only).

## Virtualization: the item-source seam

Windowed virtualization renders only the visible slice to the DOM, so a registry of *mounted*
elements can't see the full list — ArrowDown past the window, Home/End over all items, typeahead over
offscreen labels, and `aria-setsize`/`aria-posinset` would all break. TanStack Virtual is
**data-in (count), windowed-DOM-out**, so the full item set is known at the data layer even though the
DOM is windowed. The reconciliation:

- `createListFocus` reads an **abstract ordered `items` source** — `items(): Accessor<Item[]>` where
  each `Item` carries metadata and a **lazy `element` accessor that may be `undefined`** (not yet
  mounted) — plus an optional `scrollIndexIntoView(index)` hook. It does **not** hard-depend on
  `createCollection`.
- Two implementations of that source:
  - `createCollection` (default, DOM-first): every item is mounted, `element` is always present.
    Drives the plain `<Listbox.Option>`-children API. ~95% of usage.
  - `createVirtualCollection` (virtualized): `items` reflects the **full** data (nav/typeahead/setsize
    see everything); `element` resolves only for the mounted window; `scrollIndexIntoView` calls the
    virtualizer's `scrollToIndex`. Focus is applied after the target row mounts.
- **Roving focus must defer the real `.focus()` until the element exists** — which is the *same*
  plumbing `activedescendant` mode already needs (it never moves real focus). So the AD work in this
  port carries most of virtualization's focus story.

**Dependency note:** adopt **`@tanstack/virtual-core`** (framework-agnostic, no Solid version
coupling) and write the thin Solid reactive binding ourselves inside `createVirtualCollection`, rather
than depending on `@tanstack/solid-virtual` (compiled for Solid 1.x; may not clear our Solid-2.0-beta
compile pipeline — the adopted-primitive hazard in `docs/solid-primitives-eval.md`). Verify
empirically before committing to either. Virtualization is inherently client-only (it measures the
DOM), so hydration is not a concern for the virtualized path.

**`@hope-ui/primitives` is currently dependency-free** (`"dependencies": {}`). To preserve that lean
kernel, `@tanstack/virtual-core` goes in as an **optional `peerDependency`** (+ a catalog/devDependency
for building and browser tests) — only consumers who actually use `createVirtualCollection` install
the virtualizer; everyone else keeps a zero-dep primitives install. This matches the opt-in framing.

## Key constraint found during exploration

`createRegisteredElement` (`packages/primitives/src/internal/registered-element/registered-element.ts`)
is a **one-directional publisher** — it calls the ancestor's `register`/`unregister` callbacks but
does **not** return a collection and gives **no ordering guarantee** (registration = effect-creation
order, not DOM order). So the navigation family needs a new **ordered** collection primitive on top of
it, sorting by `compareDocumentPosition`. That is `createCollection` below — the foundation Model A
depends on. Angular's `SortedCollection` is the reference.

## Conventions to follow (verified in-repo)

- **New primitive** lives at `internal/<kebab>/<kebab>.ts`; options are one `CreateXOptions` interface
  with reactive inputs typed as `Accessor<T>` and callbacks as plain fns; effects use the
  `createEffect((deps)=>…, (vals)=>…)` split form with refs backed by signals and **tracked in
  compute** (see registered-element.ts). Add each export to `internal/index.ts`
  (`export { type CreateXOptions, createX } from "./x/x"`); reachable via `@hope-ui/primitives/internal`.
- **Definition of Done for a pure primitive** (`scripts/check-coverage-parity.mjs`): each `src` file
  needs a matching **test** + a matching **`.md`**. Stories, SSR tests, hydration tests are
  **components-only** — not required here. Any `*.browser.test.*` that calls `mount()` must also call
  `expectNoA11yViolations()` (both from `@hope-ui/internal-test-utils`).
- **Test project**: keyboard/focus/pointer behavior → `*.browser.test.tsx` (real Chromium); pure
  logic → `*.test.ts` (node/unit). Most of these are browser tests.
- **Prop precedence** (for the eventual component parts, mirroring `dialog-trigger.ts`): start from
  consumer props, getter-merge owned ARIA on top, compose handlers with `composeEventHandlers`, apply
  defaults with `withDefaults` (never `merge`).

## Primitives to build

All under `packages/primitives/src/internal/` unless noted. Fine-grained names; each injects the
shared `focus` instance exactly as Angular injects one `ListFocus`.

| # | Primitive | Purpose | Injects | Test | Angular ref |
|---|---|---|---|---|---|
| 0a | `createCollection<M>` | **Default item source (seam impl).** Ordered (DOM-position-sorted) reactive registry over `createRegisteredElement`; `register(entry) → Item`, `items(): Accessor<Item[]>` with always-present `element` | — | browser | `SortedCollection` + `private/behaviors/list` |
| 0b | `createVirtualCollection<M>` | **Virtualized item source (seam impl).** Thin Solid binding over `@tanstack/virtual-core`; `items()` = full data (lazy/undefined `element` for unmounted rows), `scrollIndexIntoView` → `scrollToIndex` | — | browser | react-aria virtualizer + TanStack Virtual |
| 0c | `createKeyboardHandler` *(in `utils/`)* | Declarative modifier-aware keymap builder: `.on("mod+a", fn).onText(fn)` → an `onKeyDown` handler; complements `composeEventHandlers` | — | `private/behaviors/event-manager` |
| 1 | `createListFocus<M>` | **Foundation.** Reads the abstract item source (seam); active item + `focusMode: "roving" \| "activedescendant"`; owns `getItemTabIndex`/`getListTabIndex`/`activeDescendant`/`focus`/`isActive`/`isFocusable`. Roving **defers `.focus()` until the item's `element` exists** (shared with the virtualized/AD paths) | items source | browser | `list-focus` |
| 2 | `createListNavigation` | Arrows/wrap/orientation/RTL, skip-disabled; `next/prev/first/last` (+ peek) | focus | browser | `list-navigation` |
| 3 | `createListTypeahead` | Type-to-focus over item `textValue`, buffered + debounced; `search(char)`, `isTyping` | focus | browser | `list-typeahead` |
| 4 | `createListSelection<V>` | single/multi, follow/explicit, range; `isSelected/select/toggle/selectOne/selectRange/selectAll` | focus | browser (unit for pure range math) | `list-selection` |
| 5 | `createListExpansion` | single/multi expand for Accordion/Tree/Disclosure; `isExpanded/toggle/expandAll/collapseAll` | collection.items | browser | `expansion` |
| 6 | `createGridNavigation` | 2D over a row/cell collection; `rowWrap`/`colWrap` = `continuous\|loop\|nowrap`; `up/down/left/right`, `firstInRow/lastInRow`, `first/last`; roving⇆AD; span-aware | focus (over 2D collection) | browser | `private/grid` (+ Astryx `useGridFocus` for the calendar month-flip via `onNavigateBefore/After`) |

**API shape** is the one approved with the user (compound, prop-getter based; each `Option`/`Cell`
part calls `collection.register({ ref, disabled, value, textValue })` and reads
`focus.getItemTabIndex(item)` / `selection.isSelected(item)` / `focus.activeDescendant()`). Target
end-user ergonomics:

```tsx
<Listbox.Root multiple value={value} onChange={setValue}>
  <For each={fruits}>{f => <Listbox.Option value={f.id}>{f.name}</Listbox.Option>}</For>
</Listbox.Root>
```

**Composite (optional, deferred):** a thin `createList` that wires one `createListFocus` into
navigation/selection/typeahead (mirrors Angular's `list`). Not required — component part-hooks can
compose the pieces directly. Build only if duplication proves it out.

**Build order (dependency-driven):** 0a + 0c → 1 (defines the item-source seam) → 0b (virtual
source against that seam) → 2 → 3 → 4 → 5 → 6.

## Reference doc to write: `docs/reference-implementations.md`

Flat kebab-case file in `docs/` (matches existing `solid-2.0-notes.md`, `solid-primitives-eval.md`).
Captures every source found during evaluation so component work knows where to look. Three sections:

1. **Per-behavior source map** — for each primitive above, the exact reference file(s) + URL:
   - Angular Aria — `github.com/angular/components/tree/main/src/aria/private/behaviors/{list-focus,list-navigation,list-selection,list-typeahead,expansion,event-manager}` and `src/aria/private/grid`. **Primary architectural reference.**
   - react-aria `selection` — `github.com/adobe/react-spectrum/tree/main/packages/react-aria/src/selection` (`useSelectableCollection`, `useSelectableItem`, `useTypeSelect`, `ListKeyboardDelegate`, `DOMLayoutDelegate`). **Behavior/edge-case checklist** (selectOnFocus, Ctrl+A, shift-extend, virtual-mode tabindex-omit for iOS VoiceOver, typeahead-from-focusedKey).
   - Angular CDK key-manager — `github.com/angular/components/tree/main/src/cdk/a11y/key-manager` (`list-key-manager`, `focus-key-manager`, `activedescendant-key-manager`, `typeahead`, `tree-key-manager`). Validates the split + standalone typeahead.
   - floating-ui-react (via Base UI) — `github.com/mui/base-ui/tree/main/packages/react/src/floating-ui-react/hooks` (`useListNavigation`, `useTypeahead`, `gridNavigation`). Ref-array + `virtual` dual-mode.
   - Astryx — `github.com/facebook/astryx/tree/main/packages/core/src/hooks` (`useListFocus`, `useGridFocus`, `useTreeFocus`, `useTypeahead`, `useAnnounce`, `useMenuHover`, `useInputContainer`). **Calendar grid** (`useGridFocus`) + caret-guard details.
2. **Per-component pointers** — for each planned component, which refs to open, ranked:
   - Listbox → Angular Aria `listbox` (canonical) · react-aria · Base UI `listbox`.
   - Menu → Angular Aria `menu` (+ `expansion`/`popup`) · Base UI `menu` · Astryx `useMenuHover`.
   - Select / Combobox → Angular Aria `combobox` (pluggable-widget popup) · react-aria · Base UI.
   - Tabs, Toolbar, Accordion, Tree → Angular Aria same-named patterns.
   - Calendar Grid → **Astryx `useGridFocus`**; data/composite Grid → Angular Aria `private/grid`.
3. **Port/reference/skip verdict table** — the consolidated verdicts (announce, menu-hover,
   input-container = future ports; media-query/hotkeys/overflow = adopt `@solid-primitives`; focus-trap/
   scroll-lock/presence = already have; streaming-text/image-mode/keyboard-hint = skip). Plus the
   references policy note: Angular/Astryx/react-aria/floating-ui = adapt-and-credit; Kobalte/Corvu =
   anti-pattern only.

## Also update

- `docs/plan.md` kernel section (~lines 217-222): rename reserved `createRovingFocus`/`createTypeahead`/
  `createCollection`/`createSelectionState` to the fine-grained names above, and link the new
  reference doc.

## Files to create/modify

Create (per primitive: `.ts` + `.md` + test):
- `packages/primitives/src/internal/collection/collection.{ts,md}` + `collection.browser.test.tsx`
- `packages/primitives/src/internal/virtual-collection/virtual-collection.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/internal/list-focus/list-focus.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/internal/list-navigation/list-navigation.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/internal/list-typeahead/list-typeahead.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/internal/list-selection/list-selection.{ts,md}` + `.browser.test.tsx` (+ optional `.test.ts` for range math)
- `packages/primitives/src/internal/list-expansion/list-expansion.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/internal/grid-navigation/grid-navigation.{ts,md}` + `.browser.test.tsx`
- `packages/primitives/src/utils/keymap/keymap.{ts,md}` + `keymap.browser.test.tsx`
- `docs/reference-implementations.md`

Modify:
- `packages/primitives/src/internal/index.ts` — add the eight new `internal/` exports (barrel).
- `packages/primitives/src/utils/index.ts` — add `createKeyboardHandler`.
- `packages/primitives/package.json` + `pnpm-workspace.yaml` catalog — add `@tanstack/virtual-core` as
  an **optional `peerDependency`** (primitives is dependency-free today — keep it so) plus a
  catalog/devDependency for build + tests. No `exports` change — the `@hope-ui/primitives/internal`
  and `/utils` subpaths already exist; new primitives are reachable by adding barrel lines. Build is
  now **`tsdown`** (`tsdown.config.base.ts`), not Vite library mode — adding a primitive needs no
  build-config change; tsdown builds whatever the barrel exports.
- `docs/plan.md` — reconcile kernel names + link reference doc.

## Verification

- `pnpm check:coverage-parity` — every new `src` file has its test + `.md`.
- `pnpm test:browser packages/primitives/src/internal/list-focus/list-focus.browser.test.tsx`
  (and siblings) — each browser test uses `mount()` + `expectNoA11yViolations()`, drives real
  ArrowUp/Down/Home/End/typeahead/Tab via `page` from `vitest/browser`, and asserts:
  - roving mode: exactly one item `tabindex=0`, `document.activeElement` follows navigation, container has no `aria-activedescendant`.
  - activedescendant mode: container keeps `tabindex=0` + `aria-activedescendant` = active item id, items have **no** tabindex, `document.activeElement` stays on the container.
  - `createGridNavigation`: 2D movement + `colWrap:"continuous"` crosses rows; wire a throwaway calendar-like harness to confirm month-flip callbacks.
  - `createVirtualCollection`: a large-dataset (e.g. 10k) windowed harness — ArrowDown past the mounted window `scrollToIndex`es the target in and focuses it; Home/End reach the true first/last; typeahead finds an item whose row was never mounted; `aria-setsize`/`aria-posinset` reflect the full count.
- `pnpm typecheck` + `pnpm lint`.
- **End-to-end proof**: a small in-test Listbox harness composing `createCollection` + the four
  list-* primitives + `createKeyboardHandler`, exercised with keyboard, is the concrete evidence the
  kernel is usable before any real `@hope-ui/components` component is built. (Actual Listbox/Menu
  components are follow-up work, not part of this port.)
