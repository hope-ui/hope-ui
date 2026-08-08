# `createTagsInputItemDelete`

The chip's ✕. Part of the [tags-input hook family](tags-input-root.md), composed over `createButton`
for the disabled handling and the press engine.

```ts
function createTagsInputItemDelete<V = string>(
  state: CreateTagsInputReturn<V>,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    item: V;               // the tag this chip renders
    nativeButton?: boolean; // default true; false when a `render` prop swaps the element
  },
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
  isDisabled: Accessor<boolean>;
  label: Accessor<string>;
};
```

## *"Remove Apple"* is two ids, not a formatted string (`D1`)

```html
<button id="tag-0-delete" aria-label="Remove" aria-labelledby="tag-0-delete tag-0-text">
  <XIcon aria-hidden="true" />
</button>
```

| Attribute | Value |
| --- | --- |
| `id` | the derived `<chip>-delete`, component-owned |
| `aria-label` | `tagsInput.removeLabel` ("Remove"), consumer-overridable |
| `aria-labelledby` | `` `${own id} ${itemText id}` ``, consumer-overridable |
| `tabindex` | `-1`, component-owned (`D2`) |
| `type` | `button` (from `createButton`) — a chip's ✕ inside a form must never submit it |
| `disabled` / `data-disabled` | the tag is disabled, or the widget is disabled / read-only |

Name computation resolves `aria-labelledby` in order. The **self-reference is not followed
recursively**, so it falls through to this button's own `aria-label` (*"Remove"*), and the second id
contributes the chip's text (*"Apple"*). Nothing is interpolated, so no translator has to know the
word order of a sentence they never see, and nothing pluralizes. React Aria's `useTag` composes the
same pair (against the row rather than a text element — see
[`tags-input-item-text.md`](tags-input-item-text.md)).

The label is not optional: a bare glyph has no accessible name, which is an axe `button-name`
violation. It comes from the locale catalog rather than from the consumer, and the browser test reads
the finished name off the **accessibility tree** rather than reconstructing it from the two ids —
because a pair that points at nothing produces exactly the same markup and a silently shorter name.

`id` is dropped rather than forwarded, for the reason `.ItemText`'s is: it is half of a reference.

## `tabindex="-1"` (`D2`)

The text field is the widget's single tab stop. The ✕ is reached by pointer, or by arrowing to its
chip and pressing Backspace/Delete — which is why the chip carries the removal keymap and this button
carries none of its own.

## The pointer removal ordering (`D10`)

```ts
state.focusInput();          // clears the active index, then focuses the field
state.removeAt(index());     // …and only then does the tag leave
```

The order is the whole point. With a non-negative active index, `createListFocus`'s re-homing effect
fires on the collection change and — in roving mode — pulls DOM focus onto a **surviving chip**, while
a user who just clicked a ✕ expects to keep typing. `focusInput()` sets the index to `-1` first, which
makes that effect return early on `activeAt < 0`. It mirrors Base UI's
`clearActiveIndexForRemovedItem` + `inputRef.current?.focus()`.

This is the exact opposite of the keyboard path, where the re-homing is the *desired* behavior. Both
halves are recorded in [`tags-input-item.md`](tags-input-item.md) and `D10`.

**`pointerdown` is cancelled**, the same rule `combobox-clear.ts` follows: without it the press moves
DOM focus onto a button that is about to be destroyed, and the browser drops focus to `<body>` for a
frame before anything can put it back. `click` still fires, so the removal itself is untouched.

**Divergence from React Aria:** it leaves focus on the row after a pointer removal, and focuses the
*container* when the row empties. Both are right for a standalone TagGroup with no field; a TagsInput
has one, and it is where typing continues.

## Composition and precedence

Consumer handlers run first through `composeEventHandlers`, so a `preventDefault()` in `onClick`
cancels the removal — pinned by a browser test, since that is the only cancel channel this part has.
`nativeButton={false}` switches `createButton` to the `role`/`tabIndex`/`aria-disabled` substitutes a
non-`<button>` render target needs.

`isDisabled` is `!state.isInteractive() || state.isItemDisabled(item)` — the tag's own disabled state
**or** the whole widget being disabled or read-only. `state.removeAt` refuses the same cases again;
the check here is what disables the control rather than leaving a button that reports success and
changes nothing.

## It is not a `CloseButton` (`D8`)

`Dialog.CloseTrigger` and `Alert.CloseTrigger` both render `@hope-ui/components/close-button`; this
part cannot, and the reasons are all three of the ARIA rows above. `CloseButton`'s label is a flat
`common.close` with no way to compose the row's text; it is a real tab stop, which `D2` forbids here;
and its size axis is independent of the chip's, with an `sm` that is already a 24px box around a 16px
glyph — too large inside an `sm` chip.

## SSR

Nothing here reads the DOM. Both ids come from the collection, so the `aria-labelledby` pair resolves
in the HTML a server sends, and the button's name is already *"Remove Apple"* before hydration.

## Rejected alternatives

### Rendering `@hope-ui/components/close-button` for this part

**Why not:** `D8`. Its label cannot compose the chip's text, it is a real tab stop where `D2` needs
`tabindex="-1"`, and its size scale is not the chip's. The accepted cost is one more slot pair on the
`tagsInput` recipe (`itemDelete` + `itemDeleteIcon`), and a preset that restyles CloseButton app-wide
not reaching chip ✕s.

### One interpolated string, `t("tagsInput.removeLabel", { tag })` → *"Remove Apple"*

**Why not:** it makes every locale carry a sentence template whose word order depends on a value the
catalog never sees, and it duplicates the tag's text into a place that has to be kept in sync with the
element already showing it. The two-id pair is what both references converged on, and it localizes one
word.

### Removing first, then focusing the field

**Why not:** with the active index still non-negative, the collection change fires `createListFocus`'s
re-homing and roving focus lands on a surviving chip — the exact yank `D10` exists to prevent. Whatever
ran afterwards would be fighting an effect, and the flush ordering decides who wins.

### Letting the press move focus to the button (no `preventDefault` on `pointerdown`)

**Why not:** the button is destroyed by its own click, so focus lands on an element that is about to
leave the document and the browser drops it to `<body>`. Re-focusing the field afterwards works, but
only after a frame in which nothing is focused — which a screen reader reads as leaving the widget.

### Putting the removal keymap on this button rather than on the chip

**Why not:** the ✕ is never focused (`tabindex="-1"`, and `pointerdown` is cancelled), so a keymap here
would have no events to handle. The chip is what takes focus, which is why Backspace/Delete live in
`createTagsInputItem`.
