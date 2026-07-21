# `createListbox` (listbox hook family)

The headless behavior core of a listbox — the collection widget Select, Combobox and MultiSelect
later wrap. It **composes** the already-built `internal/` list kernel (`createCollection` /
`createVirtualCollection`, `createListFocus`, `createListSelection`, `createListNavigation`,
`createListTypeahead`) into one root state hook plus one hook per part, the shape
`@hope-ui/components`' `Listbox` is a thin JSX layer over. No new behavior primitive — Listbox is
composition. Exported as one subpath, `@hope-ui/primitives/listbox`. Value model + a11y patterns
API-inspired by Base UI's Select and the WAI-ARIA APG Listbox pattern (their public surface and
reasoning, not their code).

| Hook | Owns |
| ---- | ---- |
| `createListbox(options)` | Shared state: item source, focus + selection + navigation + typeahead, the listbox id / label id / pointer fight-guard, `rootProps`. Renders nothing. Call **once**. |
| `createListboxItem(state, props)` | One option: registration, `role="option"`, `aria-selected`/`aria-disabled`, `data-active`/`data-selected`/`data-disabled`, `tabindex`, click + pointer-move. |
| `createListboxGroup(props)` | A `role="group"` wrapper naming itself from its label. |
| `createListboxGroupLabel(group, props)` | Registers its id on the group's `aria-labelledby`. |
| `createListboxSeparator(props)` | A `role="presentation"` divider (not `role="separator"`). |

## Two item-source modes, one seam

The list kernel reads an abstract `ItemSource`, so `createListbox` picks the concrete source **once**
at creation:

- **collection** (default) — `createCollection`, every item mounted and self-registering. Supports
  groups + separators. Idiomatic Solid `<For>`.
- **virtual** — `createVirtualCollection`, windowed. Selected when both `items` **and** `estimateSize`
  are supplied. `getItemData(index)` is derived from `items` + `itemToValue`/`itemToLabel`/
  `getItemDisabled`, so the same value model drives both modes. Flat lists only. Requires the optional
  `@tanstack/virtual-core` peer.

A listbox never switches source type mid-life, so the choice is a one-time read.

## Two focus modes, and Select-ready

`focusMode` toggles `createListFocus` between:

- **`"roving"`** (default) — the active `<li>` holds real DOM focus; the container is `tabindex=-1`;
  no `aria-activedescendant`.
- **`"activedescendant"`** — the focus owner keeps DOM focus (`tabindex=0`) and points
  `aria-activedescendant` at the active option; options are never DOM-focused.

Both are first-class and tested from day one, because **Select cannot be built on roving**: a
collapsible Select/Combobox keeps DOM focus on its trigger/input and the focus owner lives *outside*
the `<ul>`. So the hook exposes the pieces **independently** — `focus.activeDescendant()`,
`focus.getListTabIndex()`/`getItemTabIndex()`, `navigation.onKeyDown`, `typeahead.onKeyDown`,
`focus.focusIndex` — and `createListFocus`'s `element` may point at **any** focus owner. `rootProps`
is only the standalone convenience binding them onto the `<ul>`; Select later attaches the same
pieces to its input and leaves the `<ul>` a passive `role="listbox"` container.

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

## Value & form model (Base UI `itemToValue`, not a comparator)

- **`itemToValue(item) => string`** — the primitive value: selection identity (compared `===`), the
  string a form submits, and each item's `id` in virtual mode. Must be unique per item. Default
  `String(item)`.
- **`itemToLabel(item) => string`** — typeahead/display text feeding the kernel's `textValue`. When
  omitted, collection mode falls back to the element's trimmed `textContent`; virtual mode needs it
  for offscreen typeahead.
- `value`/`defaultValue`/`onChange` are `V[]` here — the primitive mirrors `createListSelection`
  exactly. The consumer-facing `V | V[]` shape is a component-layer concern (`Listbox.Root<V>`), which
  normalizes to `V[]` before calling this hook.
- **Form submission (opt-in).** `formValues()` is the selected items' `itemToValue` strings — always
  strings, so objects serialize cleanly. `name`/`form`/`required` are surfaced for the component to
  render hidden fields (siblings of the `<ul>`, never inside it). Mirrors React Aria's `HiddenSelect`.

## `createListbox(options)`

```ts
function createListbox<V = unknown>(options?: {
  itemToValue?: (item: V) => string;        // default String(item)
  itemToLabel?: (item: V) => string;        // default: textContent (collection)
  value?: V[];                              // controlled; pass a getter for reactive control
  defaultValue?: V[];                       // default []
  onChange?: (value: V[]) => void;
  isItemEqualToValue?: (a: V, b: V) => boolean; // default itemToValue(a) === itemToValue(b)
  selectionMode?: "single" | "multiple" | "none"; // default "single"
  focusMode?: "roving" | "activedescendant";      // default "roving"
  orientation?: "vertical" | "horizontal";        // default "vertical"
  disabled?: boolean;                       // default false
  skipDisabled?: boolean;                   // default true
  wrap?: boolean;                           // default false
  items?: readonly V[];                     // virtual mode (with estimateSize)
  estimateSize?: (index: number) => number; // virtual mode
  overscan?: number;                        // virtual mode, default 5
  getItemDisabled?: (item: V) => boolean;   // virtual mode
  name?: string; form?: string; required?: boolean; // form submission
  id?: string;
}): CreateListboxReturn<V>;
```

Returned surface: `id`, `labelId`/`setLabelId`; `source`, `collection?`, `virtual?`; the sub-instances
`focus`, `selection`, `navigation`, `typeahead`; `itemToValue`, `itemToLabel`, `selectionMode`,
`focusMode`, `orientation`, `disabled`, `value`; `setListboxElement`, `pointerMoved`; `formValues`,
`name`, `form`, `required`; and `rootProps`.

## Keyboard (as wired by `rootProps`, or by a Select's focus owner)

| Key | Action |
|---|---|
| ArrowDown / ArrowUp (vertical) | move active item (`createListNavigation`, skips disabled) |
| ArrowLeft / ArrowRight (horizontal) | move active item (RTL-aware) |
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

Host-element-free and effect-gated: every DOM touch lives in a kernel effect (collection sorting,
focus, virtual measurement), which never runs during SSR. The generated `id` is an SSR-stable
`createUniqueId`. The virtual path is client-only (it measures the DOM) and does nothing meaningful
server-side. See `__internal__/testing.md` for the SSR → hydrate round-trip the component layer pins.
