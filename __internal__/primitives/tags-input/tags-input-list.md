# `createTagsInputList`

The chip-row container of the [tags-input hook family](tags-input-root.md): the element the chips
live in, the widget's focus-within tracker, and the live region that announces a tag as it arrives.

```ts
function createTagsInputList<V = string>(
  state: CreateTagsInputReturn<V>,
  props?: JSX.HTMLAttributes<HTMLElement>,
): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { "aria-live": "polite" | "off" };
  setRef: (element: HTMLElement) => void;
};
```

`setRef` publishes the element as **both** the collection's scroll container and
`createListFocus`'s container element. Nothing about the row is visible in the DOM until it resolves,
which is why the browser test pins it through the one thing that reads it — the direction warning.

## ARIA

| Attribute | Value |
| --- | --- |
| `role` | `toolbar`, component-owned |
| `aria-orientation` | `horizontal`, component-owned |
| `aria-live` | `polite` while focus is in the widget, else `off` — component-owned |
| `aria-relevant` | `additions`, component-owned |
| `aria-atomic` | `"false"` (the string), component-owned |

Everything else a consumer passes — `id`, `aria-label`, `aria-describedby`, `class`, `style`,
`title`, `data-*`, handlers — is forwarded, and `onFocusIn` / `onFocusOut` are composed in front of
this hook's own, so a `preventDefault()` in either cancels the built-in behavior.

### Why a role at all (`D1`)

NVDA and JAWS intercept arrow keys in *browse mode* and only pass them to the page in *focus mode*,
which they enter for `grid` / `toolbar` / `listbox` / `menu` / `tree` — **not** for a plain `div`, and
not for `list`/`listitem`. So a role-less chip row cannot be arrowed through by a Windows
screen-reader user, and every keyboard test in this repo still passes. That silence is why both
references reach for an unusual role. `toolbar` buys focus mode while keeping the chip row composed
out of primitives this kernel already ships; the full comparison against React Aria's
`grid`/`row`/`gridcell` is in `__internal__/components/decisions.md` § TagsInput.

`aria-orientation` is written explicitly even though `horizontal` is a toolbar's default, so the row
declares the axis its own keymap navigates.

## The live region is three attributes, not a message (`D9`)

```html
<div role="toolbar" aria-live="off" aria-relevant="additions" aria-atomic="false">
```

`aria-relevant="additions"` announces the chip element that just appeared, **verbatim** — there is no
string to compose, none to interpolate, and none to localize. That is the difference from
`createAnnounce` (adopted from `@solid-primitives/a11y` for Calendar): that one appends its regions to
`document.body` and reads out a message *you* wrote, which is right for *"3 dates selected"* and wrong
for *"the thing that just appeared"*. `aria-atomic="false"` keeps the announcement to the new chip
rather than re-reading the whole row.

Removals get no announcement at all: focus moves to the survivor or to the field, and that move **is**
the announcement.

### `aria-live` is derived, never written by an effect

It reads `state.focus.isFocused()`, which starts `false`. Two consequences:

- **The server sends `aria-live="off"`,** and the attribute only becomes `"polite"` after hydration
  when focus arrives. Phase 8's round-trip gates on exactly that string; an effect that set the
  attribute on mount would have produced a hydration mismatch instead.
- **A value change from outside cannot talk over the user.** A server push, or a sibling control
  writing the same tag list, lands in a region that is `off` unless the user is actually in the
  widget.

## Focus-within is the *widget's*, not this element's

The flag this part drives is the same one that gates the chip highlight (`data-active`), and the text
field is part of the widget while sitting **outside** this element. So the deferred focus-out check
asks *"is the document's active element inside this row **or** is it the registered text field?"* —
`owner.contains(...)` alone would drop the flag every time a key handed focus back to the field, and
take the live region with it.

The decision is deferred to the next task rather than read off `event.relatedTarget`, for the reason
`listbox-root.md` gives: removing a chip destroys the element that had focus, which blurs with a null
`relatedTarget` — at that instant indistinguishable from the user tabbing away — and the re-homing
that follows lands within the same flush.

**The other half of the pair is the field part's** ([`createTagsInputInput`](tags-input-input.md)):
this element only ever observes focus crossing *its own* boundary, so focus leaving the field for
good is a transition it cannot see. That hook runs the mirror check on its own deferred blur — *is the
active element the field, or inside `state.listElement()`?* — which is what turns the region back off.

## SSR

Every attribute is a pure read: the role, the orientation and the three live-region attributes all
resolve with no DOM, and `aria-live` is `"off"` because `isFocused()` is `false` on the server.
`setRef` never runs. So the row's markup is complete server-side and hydration only adds behavior.

## Rejected alternatives

### `createAnnounce` for the added-tag announcement

**Why not:** it announces a message you compose, into a region appended to `document.body`. Here the
thing to announce is the chip that just appeared, which `aria-relevant="additions"` reads out
verbatim — so the imperative version would add a string to write, a string to localize, a region
outside the tree, and an ordering hazard between the announcement and the DOM change, in exchange for
nothing. Calendar's *"3 dates selected"* has no element to point at, which is why it keeps
`createAnnounce`.

### `aria-live="polite"` unconditionally

**Why not:** it hands every external write a microphone. A server push, a `<Combobox>` pick made in
another part of the page, or a form reset would each interrupt whatever the user was doing, in a
widget they may not even have focused. Gating on focus-within costs one flag the highlight already
needs.

### Letting a consumer override `aria-live` / `aria-relevant` / `aria-atomic`

**Why not:** this element *is* the live region, so overriding any one of them turns the announcement
off with nothing to fail — no error, no test, and only screen-reader users see the result. Same call
as `combobox-status.ts`, which owns the same three for the same reason. Everything non-structural is
still forwarded.

### Tracking focus-within with `owner.contains(activeElement)` alone

**Why not:** the text field is inside the widget and outside this element, so a containment-only check
reports "focus left" the moment ArrowLeft-past-the-first-chip or Escape hands focus back to it. The
live region would go quiet exactly when the user is about to add a tag, and the chip highlight would
blink off on every return.

### A `tabindex` on the row, so the container itself can be focused

**Why not:** `D2` makes the text field the widget's single tab stop, and a focusable container is a
second one that Tab has to cross. React Aria's TagGroup focuses its container when the last tag is
removed; hope focuses the **field** instead, because it has one and that is where typing continues.
