# `createListbox` (listbox hook family)

The headless behavior core of a listbox — the collection widget Select, Combobox and Autocomplete
later wrap, through the combobox kernel (`roadmap.md` #21). It **composes** the already-built
`internal/` list kernel (`createDataCollection` / `createVirtualCollection`, `createListFocus`,
`createListSelection`, `createListNavigation`, `createListTypeahead`) into one root state hook plus
one hook per part, the shape `@hope-ui/components`' `Listbox` is a thin JSX layer over. No new
behavior primitive — Listbox is composition. Exported as one subpath, `@hope-ui/primitives/listbox`.
Value model + a11y patterns API-inspired by Base UI's Select and the WAI-ARIA APG Listbox pattern
(their public surface and reasoning, not their code).

| Hook | Owns |
| ---- | ---- |
| `createListbox(options)` | Shared state: item source, focus + selection + navigation + typeahead, the listbox id / label id / pointer fight-guard, `rootProps`. Renders nothing. Call **once**. |
| `createListboxItem(state, props)` | One option: element registration, `role="option"`, `aria-selected`/`aria-disabled`, `data-active`/`data-selected`/`data-disabled`, `tabindex`, click + pointer-move. |
| `createListboxGroup(props)` | A `role="group"` wrapper naming itself from its label. |
| `createListboxGroupLabel(group, props)` | Registers its id on the group's `aria-labelledby`. |
| `createListboxSeparator(props)` | A `role="presentation"` divider (not `role="separator"`). |

## Options are data, never mounted elements

`items` is **required** and holds the whole option set. Nothing self-registers: a row publishes its
*element* once it mounts, but the row itself — its value, its label, its disabled state — exists from
the data alone. That is what a Select is built on, and DOM-registered options can never provide it,
because a closed popup mounts nothing:

| | DOM-registered + lazy | Data-driven |
|---|---|---|
| Closed-trigger typeahead (focus the trigger, type `b` → Banana, popup never opens) | impossible | **works, natively** |
| An `allowsEmptyCollection` open guard | meaningless — the collection is always empty before opening | **meaningful** |
| `<select>` autofill (the browser matches `<option>`s) | only the selected option exists | **the full list, server-side too** |

Two consequences worth knowing:

- **`textValue` never falls back to `element.textContent`.** It comes from `itemToLabel`, else
  `itemToValue`. Offscreen and closed-popup typeahead both need text that is readable before mount.
- **A row's DOM `id` is generated, not the value** (`createItemIds`). See
  `__internal__/primitives/internal/create-collection.md` for why deriving an IDREF from application
  data breaks `aria-activedescendant` silently.

## Two item-source modes, one seam

The list kernel reads the abstract `IndexedItemSource`, so `createListbox` picks the concrete source
**once** at creation and everything downstream is identical:

- **data** (default) — `createDataCollection` over `items`. Supports groups + separators via
  `groupToItems`. Every row is rendered by the consumer and registers its element by index.
- **virtual** — `createVirtualCollection`, windowed. Selected by `estimateSize`. Flat lists only.
  Requires the optional `@tanstack/virtual-core` peer.

Both register rows by **index**, which is why `createListboxItem` has a single code path. A listbox
never switches source type mid-life, so the choice is a one-time read.

## Grouping

`groupToItems` has exactly one job: flattening `items` into **navigation order**, which is what arrow
keys and typeahead traverse and what every index means. The group's *label* never reaches the kernel
— a consumer renders it from its own key — so there is no `groupToLabel` and no `{ label, items }`
shape to conform to.

`items` then holds the **group entries**, and the consumer's per-entry callback goes one level up: it
renders a `Listbox.Group` and iterates that group's own items with a plain `<For>`. Nesting depth is
irrelevant, because a row resolves its position through `indexOfValue` rather than from its place in
the tree.

**The one invariant:** rendered order must match the flattened `items` order. It holds by construction
when the inner iteration walks the array `groupToItems` returned, and `createListboxItem` **warns in
dev when its `item` resolves to `-1`**, which catches the mismatch class at the call site.

`groupToItems` does not combine with `estimateSize` — windowing measures a flat run of rows — and
saying both is a dev warning; `estimateSize` wins.

## Two focus modes, and Select-ready

`focusMode` toggles `createListFocus` between:

- **`"roving"`** (default) — the active option holds real DOM focus; the container is `tabindex=-1`;
  no `aria-activedescendant`.
- **`"activedescendant"`** — the focus owner keeps DOM focus (`tabindex=0`) and points
  `aria-activedescendant` at the active option; options are never DOM-focused.

Both are first-class and tested from day one, because **Select cannot be built on roving**: a
collapsible Select/Combobox keeps DOM focus on its trigger/input and the focus owner lives *outside*
the list. So the hook exposes the pieces **independently** — `focus.activeDescendant()`,
`focus.getListTabIndex()`/`getItemTabIndex()`, `navigation.onKeyDown`, `typeahead.onKeyDown`,
`focus.focusIndex` — and `createListFocus`'s `element` may point at **any** focus owner. `rootProps`
is only the standalone convenience binding them onto the container; Select later attaches the same
pieces to its input and leaves the list a passive `role="listbox"` container. The shape is exercised
by `listbox-harness.tsx`'s `SelectListbox` and by Listbox's "external focus owner" story.

One thing an external owner must bring itself: **the selection keys.** `rootProps.onKeyDown` composes
them, and a Select never spreads `rootProps` — so it rebuilds Enter/Space from
`selection.selectActive()` / `toggleActive()`, which are on the return for exactly that reason.

## One active item — no double highlight

`createListFocus` holds a **single** active index, written by both keyboard nav and pointer, so the
two never diverge into a hovered item *and* a separately keyboard-active item. Guarantees:

- Pointer **moves** the active item; it does not add a second highlight (`createListboxItem`'s
  `onPointerMove` re-targets `focus.focusIndex`).
- The highlight is styled by `data-active` only — never `hover:` — so the cursor's physical position
  can't paint a highlight by itself.
- **Fight guard.** The root tracks the last pointer coords; an item's `onPointerMove` re-targets only
  when the pointer *actually moved*, so a spurious `pointermove` fired by the list scrolling under a
  still cursor (after a keyboard arrow) cannot yank the active item back. See `pointerMoved`.

## The highlight follows focus

The active item paints `data-active` **only while the widget holds focus** — active *and* focused, i.e.
react-aria's `manager.isFocused && manager.focusedKey === key`. `rootProps` wires this on the container:

- `onFocusIn` sets `focus.setFocused(true)` (opening the paint gate) and, **only when focus lands on
  the container itself** (`event.target === event.currentTarget`) with nothing active, calls
  `focus.focusEntry()` to activate the entry row (first selected, else first focusable). In roving mode
  Tab lands on an *item*, whose own `onFocus` syncs the active index, so the container branch is skipped
  there; it is the entry path for activedescendant mode and for a click on the list's padding.
- `onFocusOut` defers to the next task and clears `focus.setFocused(false)` only if focus actually left
  the container — never from `relatedTarget`, which is null when a virtualized row is destroyed under
  the user (same reasoning as `calendar-group`). The **active index is kept**, so returning to the list
  restores the prior position (react-aria keeps `focusedKey` on blur).

A Select whose focus owner is its own input drives `focus.setFocused` from that input instead (zag's
`INPUT.FOCUS` — set the flag, no entry auto-highlight).

## Value & form model (Base UI `itemToValue`, not a comparator)

- **`itemToValue(item) => string`** — the primitive value: selection identity (compared `===`), the
  string a form submits, and the key `indexOfValue` resolves a row by. Must be unique per item.
  Default `String(item)`. It is **not** an item's DOM `id`.
- **`itemToLabel(item) => string`** — typeahead/display text feeding the kernel's `textValue`.
  Defaults to `itemToValue`; there is no `textContent` fallback.
- **`isItemDisabled(item) => boolean`** — spelled `is*` because it is a predicate (the repo's
  convention; `get*` is for value getters). Data-mode *and* virtual mode read it, so disabledness is
  known before a row ever mounts.
- `value`/`defaultValue`/`onChange` are `V[]` here — the primitive mirrors `createListSelection`
  exactly. The consumer-facing `V | V[]` shape is the combobox kernel's job (decision 4 of the
  Select plan), not this hook's.
- **Form submission (opt-in).** `formValues()` is the selected items' `itemToValue` strings — always
  strings, so objects serialize cleanly. `name`/`form`/`required` are surfaced for the component to
  render hidden fields (siblings of the list, never inside it). Mirrors React Aria's `HiddenSelect`.

## `createListbox(options)`

```ts
function createListbox<V = unknown, G = V>(options: {
  items: readonly G[];                            // REQUIRED — the option set (group entries when grouped)
  groupToItems?: (group: G) => readonly V[];       // flattens `items` into navigation order
  itemToValue?: (item: V) => string;               // default String(item)
  itemToLabel?: (item: V) => string;               // default: itemToValue — no textContent fallback
  isItemDisabled?: (item: V) => boolean;           // default false
  value?: V[];                                     // controlled; pass a getter for reactive control
  defaultValue?: V[];                              // default []
  onChange?: (value: V[]) => void;
  isItemEqualToValue?: (a: V, b: V) => boolean;    // default itemToValue(a) === itemToValue(b)
  selectionMode?: "single" | "multiple" | "none";  // default "single"
  focusMode?: "roving" | "activedescendant";       // default "roving"
  orientation?: "vertical" | "horizontal";         // default "vertical"
  dir?: "ltr" | "rtl";                             // default: useLocale().direction()
  disabled?: boolean;                              // default false
  skipDisabled?: boolean;                          // default true
  wrap?: boolean;                                  // default false
  estimateSize?: (index: number) => number;        // presence selects virtual mode
  overscan?: number;                               // virtual mode, default 5
  name?: string; form?: string; required?: boolean; // form submission
  id?: string;
}): CreateListboxReturn<V>;
```

Returned surface: `id`, `labelId`/`setLabelId`; `indexed`, `virtual?`, `indexOfValue`; the
sub-instances `focus`, `selection`, `navigation`, `typeahead`; `itemToValue`, `itemToLabel`,
`selectionMode`, `focusMode`, `orientation`, `direction`, `disabled`, `value`; `setListboxElement`,
`pointerMoved`; `formValues`, `name`, `form`, `required`; and `rootProps`.

### `indexed` / `virtual` / `indexOfValue` — why those three

`indexed` is the item source, and it is an `IndexedItemSource<V>` rather than a bare `ItemSource<V>`
because *both* concrete sources register rows by index — so a part reads one thing whichever mode it
is in. It subsumes what used to be two members (`source` + `collection`).

`virtual` stays because `virtualItems()` / `totalSize()` are windowing metadata the `ItemSource` seam
deliberately has no room for, and a sizer cannot render without them. It is `undefined` in data mode.

`indexOfValue` is hoisted onto the return rather than buried in a per-mode object, so
`createListboxItem` reads exactly two things (`indexed` + `indexOfValue`) and never learns which
source it is talking to. It is always `-1` in virtual mode, where a recycled row's position changes
under it and `index` is the only honest answer.

## Reading direction

`direction()` resolves the consumer's `dir` prop, else `useLocale().direction()` — the same shape
`createCalendar` uses, and the reason `@hope-ui/primitives` depends on `@hope-ui/i18n` at all. It is
threaded into `createListNavigation` as `textDirection`, which is what flips ArrowLeft/ArrowRight for
a **horizontal** listbox. A vertical listbox is unaffected: RTL mirrors the inline axis only.

**It drives behavior only and is never written to the DOM.** The layout mirrors from the cascade
instead, so a `dir` on an ancestor (or the document root) reaches the list on its own. `Listbox.Root`
writes the consumer's `dir` *prop* onto the element — that one is a real HTML attribute and a
per-instance instruction — but never the locale-derived value, which would stamp `dir="ltr"` on an
en-US browser and override the `<div dir="rtl">` around it. Same line Base UI and React Aria draw; the
full comparison, and the dev warning that catches the resulting split, are in
`__internal__/primitives/internal/create-text-direction-warning.md`.

The keyboard half was un-threaded until a sweep caught it, and the failure mode is why the kernel
prefers a locale default over an opt-in flag: `createListNavigation` defaults `textDirection` to
`"ltr"`, so a horizontal listbox silently walked backwards for every Arabic/Hebrew/Farsi reader while
every test stayed green. Pinned by `listbox-root.browser.test.tsx` § "horizontal orientation and RTL",
which drives both the `dir` prop and a bare `<I18nProvider locale="ar-EG">`, and by
`listbox.browser.test.tsx` § "Listbox — RTL" for the no-write contract and the dev warning.

## Keyboard (as wired by `rootProps`, or by a Select's focus owner)

| Key | Action |
|---|---|
| ArrowDown / ArrowUp (vertical) | move active item (`createListNavigation`, skips disabled) |
| ArrowLeft / ArrowRight (horizontal) | move active item; swapped under `direction() === "rtl"` |
| Home / End | first / last focusable item |
| type a character | typeahead to the first match (`createListTypeahead`) |
| Space | `selection.toggleActive()` |
| Enter | `selection.selectActive()` |
| mod+A | `selection.selectAll()` (multiple only) |
| Shift+ArrowDown / ArrowUp | extend the range from the anchor (multiple only) |

`rootProps.onKeyDown` composes the selection keys in front of `navigation.onKeyDown` then
`typeahead.onKeyDown`; `createKeyboardHandler` matches modifiers exactly, so `shift+ArrowDown` and the
plain `ArrowDown` never collide, and Space is caught before typeahead's text fallback can type it.

## Call it once, in an owner scope

`createListbox` runs inside a reactive owner (a component body or `createRoot`). Call it **once** and
share the result: `Listbox.Root` puts it on context; a headless consumer holds it and threads it into
whichever part hooks it needs. The id-registering part hooks must be called from the part that owns
the id, so cleanup is scoped to that part's unmount.

## SSR

Host-element-free and effect-gated: every DOM touch lives in a kernel effect (element registration,
focus, virtual measurement), which never runs during SSR. The generated `id` is an SSR-stable
`createUniqueId`, and so is each row's (`createItemIds`).

Data mode server-renders **more** than the old DOM-registered mode did, and that is the point:
`items()`, `textValue()`, `disabled()` and every row id are pure data reads, so the server already
knows the full option list. One visible consequence — the roving tab stop is correct in the server
HTML (exactly one option carries `tabindex="0"`, the selected one), where a DOM-registered source
emitted `0` on every row because nothing had registered yet.

The virtual path is client-only (it measures the DOM) and does nothing meaningful server-side. See
`__internal__/testing.md` for the SSR → hydrate round-trip the component layer pins.
