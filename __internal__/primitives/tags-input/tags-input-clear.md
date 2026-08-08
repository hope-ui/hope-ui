# `createTagsInputClear`

Clear-all, for the [tags-input hook family](tags-input-root.md). A real `<button>` over `createButton`,
named from the i18n catalog, that empties the row and leaves focus where typing continues.

```ts
function createTagsInputClear<V = string>(
  state: CreateTagsInputReturn<V>,
  props?: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    nativeButton?: boolean; // default true; false when a `render` prop swaps the element
  },
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
  isDisabled: Accessor<boolean>;
  label: Accessor<string>;
};
```

## ARIA

| Attribute | Value |
| --- | --- |
| `aria-label` | consumer's, else `t("tagsInput.clearLabel")` — *"Clear all tags"* |
| `type` | `button`, from `createButton` |
| `tabindex` | `-1`, component-owned |
| `disabled` / `data-disabled` | from `isDisabled`, via `createButton` |

The label is not optional: the glyph inside the button has no accessible name of its own, so without it
axe reports `button-name`. `D12` wrote the string in all thirteen catalogs rather than copying React
Aria's — three short functional strings are cheaper to author than the Apache-2.0 attribution a copied
catalog would owe (`@license` header, two `NOTICE.md` rows, a `LICENSE-APACHE-2.0.txt` in the package).

Everything else a consumer passes is forwarded, and `onClick` composes in front of the built-in clear
so a `preventDefault()` cancels it.

## It clears every **removable** tag

`state.clear()` keeps disabled tags, deliberately: they are not individually removable either, so a
Clear that took them would be the one way to delete a tag the widget says cannot be deleted.

That is also why `isDisabled` asks whether a *removable* tag exists rather than whether the list is
empty — a row of nothing but disabled chips has nothing to clear, and a button that looks live and does
nothing is worse than one that says so. It is likewise disabled whenever the widget is disabled or
read-only.

`isDisabled` is returned so a component can render the button **absent** instead of disabled. Both are
legitimate; the hook takes no position, it just answers the question once.

## The click order is `D10`'s pointer path

```ts
state.focusInput();  // drop the chip highlight, then focus the field
state.clear();       // …and only then mutate
```

Unchanged from the chip's ✕, and for the same reason: with a non-negative active index,
`createListFocus`'s re-homing effect fires on the collection change and — in roving mode — yanks DOM
focus onto a surviving chip. `state.focusInput()` clears the index first, which makes that effect
return early. Reversing the two lines leaves focus somewhere the user did not ask for, with every
assertion about the tag list still passing.

`pointerdown` is cancelled, so the press never moves DOM focus onto a button that is about to become
disabled — otherwise the browser drops focus to `<body>` for a frame. `click` still fires. Same call,
and the same reason, as `combobox-clear.ts` and `tags-input-item-delete.ts`.

## It leaves the draft text alone

Clearing the *tags* and clearing the *field* are two gestures, and this hook owns only the first — it
has no access to the draft, which lives in [`createTagsInputInput`](tags-input-input.md). A component
that wants both passes an `onClick`; it composes first, so it runs before the tags go.

## SSR

`aria-label` resolves from the locale context with no DOM, and `disabled` is derived from the tag list,
so the button's markup is complete server-side — including its disabled state for a widget rendered
with no tags.

## Rejected alternatives

### An `onClear` prop, the way `createComboboxClear` takes one

**Why not:** Combobox needs one because that family owns no value at all — "empty" there could mean the
text, the selection, or both, and only the component knows. Here `state.clear()` is unambiguous and
already the right call, so an `onClear` would be a second name for `onClick` with worse composition
semantics (it could not be cancelled by `preventDefault()`). A consumer wanting to also empty the draft
uses `onClick`, which the hook already composes in front of its own.

### A real tab stop, so keyboard users can reach Clear

**Why not:** `D2` makes the field the widget's single tab stop, and every part of this widget follows it
— the chips, their ✕s, and this button. A second tab stop costs one Tab press per tags input on the
page, on a page where the control's whole point is that Tab crosses it in one. The keyboard path to the
same outcome is holding Backspace on an empty field, which removes one chip per repeat, and that works
today. Base UI's `Combobox.Clear` and React Aria's TagGroup both leave clear-all off the tab order for
the same reason.
**Revisit if:** `max` grows large enough that Backspace-repeat stops being a reasonable clear-all — a
50-tag row is a different gesture from a 5-tag one.

### `CloseButton` instead of an own part

**Why not:** the same three reasons `D8` gives for the chip's ✕. `CloseButton` is a real tab stop, its
label is a flat `common.close` with no way to say *"Clear all tags"*, and its size axis (`sm`/`md`/`lg`)
is independent of the tags input's — its `sm` is already a 24px box, too large beside an `sm` field.

### Disabling only on an empty list, ignoring whether the remaining tags are removable

**Why not:** a row of disabled chips would show a live Clear that does nothing when pressed. The state
is knowable — `isItemDisabled` is already the predicate `state.clear()` filters by — so answering it
in the button costs one `some()` and removes a dead affordance.
