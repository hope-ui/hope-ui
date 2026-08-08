# `createTagsInputItemText`

The chip's text. Part of the [tags-input hook family](tags-input-root.md), and the smallest part in
it: no behavior, no state, no handlers. What it owns is **an id, and the fact that nothing else may
set it**.

```ts
function createTagsInputItemText<V = string>(
  state: CreateTagsInputReturn<V>,
  props: JSX.HTMLAttributes<HTMLElement> & {
    item: V; // the tag this chip renders — the same value its `.Item` was handed
  },
): {
  props: JSX.HTMLAttributes<HTMLElement>;
  label: Accessor<string>;
};
```

`label` is `itemToLabel(item)`, falling back to `itemToValue(item)` — the element's default children.

## The id is the whole part (`D1`)

```html
<span id="tag-0-text">Apple</span>
<button id="tag-0-delete" aria-label="Remove" aria-labelledby="tag-0-delete tag-0-text">…</button>
```

That second `aria-labelledby` token is this element, and it is what makes the ✕ announce *"Remove
Apple"* instead of a bare *"Remove"*. The id is derived from the chip's collection id by
`resolveTagsInputItem` (see [`tags-input-item.md`](tags-input-item.md)), so both parts compute the
same string from the same tag with no context and no prop between them.

**A consumer's `id` is therefore dropped rather than forwarded.** Honoring it would leave the ✕
pointing at an element that no longer exists, and the browser would silently fall back to naming the
button *"Remove"* — nothing throws, nothing fails a test, and only screen-reader users see the result.
Same call, and the same reason, as `createListboxItem`'s `id`.

Every other native attribute — `class`, `style`, `title`, `data-*`, `aria-*`, `ref`, event handlers —
is forwarded untouched.

## Truncation is CSS

Long tags are the recipe's problem (`text-overflow`, a `max-width` on the slot), not this hook's. It
writes no styles and measures nothing.

## SSR

Pure data: the id comes from the collection, the label from the tag. Both render server-side, which is
what keeps the ✕'s `aria-labelledby` pair resolvable in the HTML a server sends.

## Rejected alternatives

### Forwarding a consumer's `id`

**Why not:** it is an IDREF target. The ✕ derives the id it points at from the tag, so a consumer's own
id silently unlinks the pair and demotes the button's name from *"Remove Apple"* to *"Remove"*. Every
other attribute is forwarded; this one is a reference, not decoration.

### Pointing the ✕ at the **chip** instead, the way React Aria does

**Why not:** `useTag.ts:126` composes `` `${buttonId} ${rowProps.id}` `` — the row, whose name comes
from its contents. In hope's shape the chip carries an `aria-label` of its own and contains the ✕, so
pointing there would either duplicate the label computation or, once a chip renders anything beside
the text (an avatar, a count), fold that content into the button's name. A dedicated text element is
the one node that holds exactly the noun. It is also why this part exists at all rather than being a
plain `<span>` the component writes.

### Folding this part into `.Item` and letting the chip render its own text

**Why not:** the ✕ needs an element to point at, and "the chip minus the button" is not addressable.
Merging them would put the tag's text and the remove control inside one named node, so the button's
accessible name would grow whatever the chip renders — including, recursively, the button's own label.

### A `label` prop, so a consumer can override the displayed text per chip

**Why not:** the root already owns that mapping (`itemToLabel`), and it has to: the label is read
before any chip mounts — for the chip's `aria-label`, and for whatever a later phase matches against.
A per-chip override would let the two disagree, so a chip could announce one thing and display
another.
