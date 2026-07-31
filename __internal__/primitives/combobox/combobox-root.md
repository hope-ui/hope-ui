# `createCombobox`

The shared state kernel of the **APG 1.2 combobox pattern**, and the one call at the root of a Select
or Combobox tree. It renders no JSX and no host element.

```ts
function createCombobox<V = unknown, M extends SelectionMode = "single", G = V>(
  options: CreateComboboxOptions<V, M, G>,
): CreateComboboxReturn<V, M>;
```

The pattern it wires: `role="combobox"` on a focus owner that keeps DOM focus, `aria-expanded` /
`aria-controls` pointing at a `role="listbox"` popup, and `aria-activedescendant` naming the active
option. Select and Combobox both get it from here, which is the point — it is what stops them growing
two keyboard/ARIA implementations that drift.

Per-part hooks take this return plus their own props:
[`createComboboxTrigger`](combobox-trigger.md), [`createComboboxValue`](combobox-value.md),
[`createComboboxPositioner`](combobox-positioner.md),
[`createComboboxContent`](combobox-content.md), [`createComboboxList`](combobox-list.md). There is no
`createComboboxItem`: an option is `createListboxItem(state.list, { ref, item })`, unchanged.

## The absence of filtering is the design

There is no `inputValue`, no filtered-vs-original collection, no `commit`/`revert`, no
`allowsCustomValue`, and **no filtering of any kind**. Someone opening this folder expecting them will
not find them.

That is deliberate, and it is the whole reason the kernel is small enough for Select to compose. Base
UI built the same kernel one layer *up*, around an input value (`AriaCombobox.tsx`, 1782 lines) — and
its `SelectRoot` (757 lines) consequently **does not import it**, because a Select has no text value
to build on. Two independent keyboard/ARIA implementations is exactly what this scoping avoids.

The filter seam belongs to Combobox, must be pulled by a real input value, and cannot be guessed at
from Select's side. See [`roadmap.md`](../../roadmap.md) § "The combobox kernel". **Do not add it
here.**

## Options

`CreateComboboxOptions` is `CreateListboxOptions` (`items`, `groupToItems`, `itemToValue`,
`itemToLabel`, `isItemDisabled`, `isItemEqualToValue`, `orientation`, `dir`, `disabled`,
`skipDisabled`, `wrap`, `estimateSize`, `overscan`, `name`, `form`, `required`, `id`) **minus**
`focusMode`, `value`, `defaultValue`, `onChange`, `selectionMode` and `onTypeaheadMatch` — which this
kernel re-shapes or owns — **plus**:

| Option | Default | |
| --- | --- | --- |
| `selectionMode` | `"single"` | `"none" \| "single" \| "multiple"`. Infers `M`, which types the three below. |
| `value` / `defaultValue` / `onChange` | — | `SelectionValue<V, M>`: `V \| null` in single mode, `V[]` in multiple. |
| `open` / `defaultOpen` / `onOpenChange` | `false` | Popup open state. |
| `allowsEmptyCollection` | `false` | Whether a popup with no options may open. |
| `shouldCloseOnSelect` | `selectionMode !== "multiple"` | Whether choosing an option closes the popup. |
| `modal` | `true` | Hide outside content + lock scroll while open. |
| `closeOnEscape` / `closeOnInteractOutside` / `closeOnFocusOutside` | `true` | Forwarded to `createDismissable` by the Content part. |
| `bubbles` | neither channel | Whether a dismissal handled above also closes this. |
| `side` / `align` / `sideOffset` / `alignOffset` / `flip` / `shift` / `collisionPadding` / `collisionBoundary` / `strategy` / `autoUpdate` / `trackAnchorMotion` | `createFloating`'s | Positioning. Popover's set, minus `arrowPadding` — there is no arrow part. |

`focusMode` is **forced** to `"activedescendant"` and therefore absent: the focus owner is the
trigger, not the list.

## The value is scalar in single mode, an array in multiple

```ts
type SelectionValue<V, M extends SelectionMode> = M extends "multiple" ? V[] : V | null;
```

A single Select must not hand back `[apple]`. `M` is inferred from `selectionMode` and defaults to
`"single"` — react-aria spells this the same way (`useSelect<T, M extends SelectionMode = 'single'>`).

**The adapter lives here**, in the same place the `onChange` wrap for close-on-select does, so
`createListbox` keeps its low-level `V[]` contract untouched and both component layers stay pure
pass-throughs. `state.value()` is the adapted shape; `state.list.value()` is still the array.

`null` and `undefined` mean different things and the conversion respects it: `undefined` is
"uncontrolled" (`createControllableState`'s rule), `null` is a controlled "nothing selected".

## `createListbox` is created eagerly, here

Nothing renders until open — tabbing a form with ten Selects must not mount ten option lists. A
`createListbox` created inside the popup would therefore leave the trigger with no `navigation`, no
`typeahead` and no `focus.activeDescendant()` to read *while closed*, which is the state
closed-trigger typeahead lives in. Same argument as Popover's root-owned `createPresence`.

It works only because the options are **data** (`items`), not mounted elements — see
[`create-data-collection.md`](../internal/create-data-collection.md). Three things follow from it:

- **closed-trigger typeahead selects** (below),
- **`allowsEmptyCollection` means something** — a DOM-registered collection is *always* empty before
  opening, so the guard could never have been written against one,
- a server-rendered `<select>` for autofill is possible without mounting a row the user may never
  open (that is `HiddenSelect`'s job, at the component layer).

## Closed-trigger typeahead **selects**

`createListbox` forwards an `onTypeaheadMatch` to `createListTypeahead`'s `onMatch` seam, and this
kernel intercepts it:

| | Single mode | Multiple / none |
| --- | --- | --- |
| **Open** | highlight the match | highlight the match |
| **Closed** | **select** the match, popup stays shut | highlight it (applied on the next open) |

Closed and single is native `<select>` behavior, react-aria's `onTypeSelect → setSelectedKey`, and
Base UI's `onMatch`. There is no row to highlight with the popup shut, so highlighting would be a
keystroke that does nothing visible.

Multiple mode is deliberately excluded: toggling per keystroke would make a repeated letter select
and immediately deselect. Diacritics fold either way — `createListbox` passes a
`{ usage: "search", sensitivity: "base" }` collator, so typing `acai` matches `Açaí`.

## Close-on-select is one wrap, not one branch per key

`shouldCloseOnSelect` is applied by wrapping the selection's `onChange`, so it covers **every** path
that selects — Enter, Space, and an option's own click — without each repeating it, and without the
kernel needing to touch `createListboxItem`.

`createControllableState` notifies on every *request*, not only on a changed value, so re-picking the
option that is already selected still closes the popup. `setOpen` drops a request that matches the
current state, so the closed-typeahead path (which selects while shut) emits no phantom
`onOpenChange(false)`.

## The entry effect

One `createEffect` over `[open(), floating.isPositioned(), focusStrategy()]`:

| `focusStrategy` | Set by | Lands on |
| --- | --- | --- |
| `"selected"` (default) | a click on the trigger, Enter, Space | the selected option, else the first focusable one (`focus.focusEntry()`) |
| `"first"` | ArrowDown, Alt+ArrowDown | the first option |
| `"last"` | ArrowUp, Alt+ArrowUp | the last option |

Closing clears the highlight, so reopening applies its own strategy instead of flashing the previous
session's row.

**`isPositioned` is the load-bearing gate**, the same one `createAutoFocus` needs in
`popover-content.ts`: until the first measurement lands, `floatingStyles()` is the pre-positioned
`visibility: hidden` branch, and scrolling a row into view inside a hidden subtree measures nothing.
No collection-length gate is needed — the options are data, so they exist before the popup does.

`focusStrategy` is tracked in the effect's **deps**, not read in its callback: deps is the tracking
scope (reading it in the callback is `[STRICT_READ_UNTRACKED]`, which `mount()` fails a test on), and
it also means "set the strategy, then open" settles into a single run.

## Modality is two mechanisms, not four

`modal` (default `true`) gates `createHideOutside` + `createScrollLock`, both created by
[`createComboboxContent`](combobox-content.md). There is deliberately **no focus trap** — focus never
leaves the trigger in activedescendant mode, so there is nothing to trap — and **no `ModalBackdrop`**,
which would cover the trigger, making it unclickable and breaking toggle-to-close. React Aria's Select
composes exactly this pair (`usePreventScroll` + `ariaHideOutside`).

`state.sparedElements` is the trigger, and it feeds **both** `createHideOutside`'s `spare` and
`createDismissable`'s `exclude`. It is one requirement wearing two mechanisms: drop it from either and
toggle-to-close breaks, in a different way each time.

## No `omit` list — and that absence is deliberate

A component-layer `Select.Root` / `Combobox.Root` renders **no element**, exactly as `Popover.Root`
and `Dialog.Root` do not. So there is nothing to forward native attributes onto, and therefore **no
hand-kept `omit` key list** — the kind `Calendar.Root` (29 keys) and `Listbox.Root` carry, and which
[`roadmap.md`](../../roadmap.md) §3 tracks as a drift bug.

That absence looks like an oversight to anyone auditing the family against its siblings. It is not.
**Do not "fix" it by adding one** — the fix would be adding a host element, which is the thing being
avoided. The escape hatch for a native attribute is `Select.Trigger` / `Select.Positioner` /
`Select.Content`, each of which forwards its own.

The one key list inside this hook (`omit(options, "value", "defaultValue", "onChange",
"selectionMode")`) is a different animal: it names what this kernel **re-shapes**, mirrors the
`Omit<…>` on `CreateComboboxOptions` exactly, and cannot rot as `createListbox` grows — everything
else rides through on `merge`.

## SSR

Host-element-free and effect-gated. `createFloating` reaches `computePosition`/`autoUpdate` from
effect bodies alone, `createPresence` from an effect, and `createHideOutside`/`createScrollLock`/
`createDismissable` never run server-side — so no `isServer` import is needed here.

The one server-visible id is `triggerId`'s `createUniqueId()` fallback: the trigger renders eagerly
and its id feeds two IDREFs. `popupId` falls back to `list.id()` rather than reserving a second
generated id for the same element. `valueId` is registered client-side only (`createRegisteredId` runs
in `onSettled`), so a server render leaves the trigger named by its own contents — which contain the
value element anyway.

## Rejected alternatives

### Base UI's scoping — a kernel built around an input value
**Why not:** it is measurably the split this design exists to avoid. `AriaCombobox.tsx` is 1782 lines
and presumes `inputValue` / a filtered collection / `commit` / `revert`, none of which a Select has, so
Base UI's own `SelectRoot` (757 lines) does not import it and shares only `internals/`. Routing Select
through it would also be what CLAUDE.md forbids — *"never couple a component's behavior to a heavier
sibling."* Scoping the kernel **below** the input value is what makes one keymap serve both.

### A `multiple: boolean` prop instead of `selectionMode`
**Why not:** `createListbox` and `Listbox.Root` already expose `"none" | "single" | "multiple"`, and a
boolean cannot say `"none"` — the browsing-list mode where `role="option"` carries no `aria-selected`
at all. Two vocabularies for one concept in one package is the cost, for no gain.

### Adapting scalar ⇄ array in `select-root.tsx` instead of the kernel
**Why not:** Combobox would have to reimplement it, and the two would drift on exactly the edge cases
that matter (`null` vs `undefined` vs `[]`). Keeping it here also keeps both component layers pure
pass-throughs, which is what makes `Select.Root` an element-free Root with no `omit` list.

### Teaching `createListbox` the scalar shape instead
**Why not:** it is the low-level primitive, and `Listbox` itself is genuinely multi-valued — a
standalone multi-select listbox is its main use. Bending its contract to suit one consumer would push
the discrimination into every other caller.

### Creating `createListbox` inside the popup, where the options are rendered
**Why not:** the popup mounts lazily, so a closed trigger would have no `navigation`, no `typeahead`
and no `focus.activeDescendant()` to read — and closed-trigger typeahead, the `allowsEmptyCollection`
guard and a server-rendered `<select>` all live in exactly that state. Same reasoning as Popover's
root-owned `createPresence`.

### Force-mounting the options so a DOM-registered collection could work
**Why not:** it makes every closed Select on a page pay for a list the user may never open, which is
what decision 8 ("nothing renders until open") exists to prevent. The data-driven source gets the same
three capabilities for one `ItemSource` implementation. See
[`create-data-collection.md`](../internal/create-data-collection.md).

### Modality as Dialog does it — focus trap + `ModalBackdrop`
**Why not:** both are actively wrong here. Focus never leaves the trigger in activedescendant mode, so
a trap has nothing to cage; and a backdrop covers the trigger, so the control that opened the popup
can no longer close it — the exact fight `createDismissable`'s `exclude` exists to end. React Aria's
Select composes `usePreventScroll` + `ariaHideOutside` and nothing else, for the same reasons.

### Closing on select inside each keymap branch
**Why not:** it would have to be repeated in Enter, in Space, and — impossibly — inside
`createListboxItem`'s own `onClick`, which the kernel deliberately reuses unchanged. Wrapping the
selection's `onChange` covers every path in one place, including paths added later.

### A hand-written getter per forwarded `createListbox` option
**Why not:** ~20 lines of boilerplate that silently stops forwarding whatever `createListbox` gains
next, with no type error and no failing test — the same rot `roadmap.md` §3 records for hand-kept
`omit` lists. `merge(options, …)` forwards everything and the four re-shaped keys are named once.

### Letting the kernel create its own `createListTypeahead` rather than threading `onMatch`
**Why not:** two typeahead instances over one focus instance, each with its own buffer and its own
timeout, one of them dead. `onMatch` was added to `createListTypeahead` in the first place so a
composed widget could intercept it; forwarding it through `createListbox` is what makes that seam
reachable.
