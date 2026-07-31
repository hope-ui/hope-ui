# `createComboboxList`

The list part of the [combobox hook family](combobox-root.md): the `role="listbox"` element the
options live in, and the **scroll container** an offscreen highlighted option is scrolled inside.

```ts
function createComboboxList<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): {
  props: JSX.HTMLAttributes<HTMLElement>;
  setRef: (element: HTMLElement) => void;
};
```

Options inside it are `createListboxItem(state.list, { ref, item })` — unchanged, with no combobox
part hook of their own.

## Five props, built by hand — **not** `state.list.rootProps`

| Prop | Value |
| --- | --- |
| `id` | the consumer's, else `state.popupId()`; a consumer's is published up so `aria-controls` follows |
| `role` | `"listbox"` |
| `aria-labelledby` | the consumer's, else `state.triggerId()` |
| `aria-multiselectable` | `"true"` in multiple mode, absent otherwise |
| `aria-orientation` | `state.list.orientation()` |

`createListbox` returns a `rootProps` for the **standalone** case, where the container itself is the
focus owner. Spreading it here would be wrong three times over:

- **`tabindex: 0`** — a second tab stop, inside a popup that is only reachable because the trigger
  kept focus;
- **its own `onKeyDown`** — a second, competing keymap. No option is ever focused here, so no keydown
  could reach it anyway; [the trigger](combobox-trigger.md) owns the map;
- **its own `aria-activedescendant`** — the attribute belongs on the element that holds DOM focus, and
  a second one would claim this element is focused too.

`aria-hidden`/`aria-disabled`/`onFocusIn`/`onFocusOut` from `rootProps` are equally inapplicable, for
the same underlying reason: **this element is not the focus owner.**

**`role="listbox"` needs an accessible name** — axe's `aria-input-field-name` covers `listbox` as well
as `combobox` — and there is no `Label` part by design, so it borrows the name of the element the popup
belongs to.

## The scroll container

`setRef` registers the element through `state.setListElement` → `state.list.setListboxElement`, which
is what `createDataCollection` scrolls in `scrollIndexIntoView`.

This matters more here than in a standalone listbox. In **roving** focus mode the browser's own
`.focus()` scrolls the active row into view; in **activedescendant** mode nothing moves DOM focus, so a
mounted-but-clipped option would sit offscreen while `aria-activedescendant` names it — with every test
green. `createListFocus` therefore asks the source for **every** move in this mode, and this
registration is what gives it somewhere to scroll.

The pointer path is the exception: an option's `onPointerMove` activates with `{ scroll: false }`,
because the row is already under the cursor and scrolling to it would slide the list and hand the
highlight to whatever ends up beneath the pointer.

## A mousedown inside the list must not move focus

Options carry `tabindex="-1"` in activedescendant mode, which still makes them **click**-focusable — so
clicking one would blur the trigger, drop the highlight's paint gate (`data-active` is "active *and*
the widget is focused") and hand DOM focus to an element the pattern says never has it.

`preventDefault()` on `mousedown` is how every reference implementation stops that. `click` still
fires, so an option's own selection handler is untouched. The consumer's `onMouseDown` runs first, so
their `preventDefault()` cancels — which here means "I have already handled it".

## SSR

Attribute computation only. `createRegisteredId` runs in `onSettled` and never server-side; `popupId`
falls back to `list.id()`, which is `createUniqueId`-generated and SSR-stable, so the trigger's
`aria-controls` and this element's `id` agree across the round-trip. In practice the list renders
inside a `Portal`, which does not render server-side at all.

## Rejected alternatives

### Spreading `state.list.rootProps`
**Why not:** it would put a second tab stop, a second keymap and a second `aria-activedescendant` on a
popup whose entire pattern depends on the trigger keeping focus. `rootProps` is the standalone
convenience binding, for the case where the container *is* the focus owner — which is exactly what this
element is not.

### Leaving `aria-labelledby` off, since the trigger already has a name
**Why not:** the popup is a separate element with its own role, and a nameless `role="listbox"` is an
axe `aria-input-field-name` violation — the same rule that catches a nameless `role="combobox"`. There
is no Label part to point at, so the trigger is the only honest referent.

### Giving the list its own `Label` part to name it
**Why not:** decision 1 keeps labelling out of scope for the whole family — a `Label` here would be the
thin end of the field-chrome wedge, and a future `Field` component is what should own it. Borrowing the
trigger's id costs one line and no API.

### Not preventing the mousedown default, and re-focusing the trigger afterwards instead
**Why not:** it is a repair rather than a prevention — the blur still happens, so the highlight flickers
off and back, `focusout`-driven dismissal can fire in between, and the restore races anything else that
moved focus in the same task. Preventing the default means DOM focus never leaves in the first place.

### Registering the Content as the scroll container instead of the List
**Why not:** the card is what a Combobox's `Empty` and `Status` share with the list, so scrolling it
would scroll those too — and the element that actually overflows, and carries `--available-height`'s
`max-height`, is the list. Only one of the two can be `overflow: auto`, and it is this one.
