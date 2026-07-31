# `createComboboxClear`

The clear button inside a Combobox's control: empties the field and hands focus back to the input.
Part of the [combobox hook family](combobox-root.md).

```ts
function createComboboxClear<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClear?: () => void;
    nativeButton?: boolean;
  },
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
};
```

## ARIA

| Attribute | Value |
| --- | --- |
| `aria-label` | `combobox.clearLabel` ("Clear"), consumer-overridable |
| `tabindex` | `-1`, component-owned |

That is the whole list, and the absences are the point. There is **no `aria-expanded`, no
`aria-controls`, no `aria-haspopup`**: clearing is not opening, and asserting any of them here would
claim this button owns the listbox when the input already does.

The label is not optional — a bare ✕ is an axe `button-name` violation. It comes from the locale
catalog rather than from the consumer, for the reason `combobox-toggle.md` gives.

## It shares the chevron's two structural rules

**`tabindex="-1"`**, because the input is the widget's single tab stop, and
**`preventDefault()` on `pointerdown`**, because a click that moved DOM focus here would blur the
input and fire its blur-commit — which, with nothing highlighted and `allowsCustomValue` off, puts
back the very text the user asked to remove. The long form of both is in
[`combobox-toggle.md`](combobox-toggle.md).

The click handler calls `onClear()` **before** re-focusing the input, not after: re-focusing first
would let a blur-commit race the clear on the paths where focus was elsewhere.

## What "clear" means is the consumer's

`onClear` is a callback for the same reason `createComboboxInput`'s `onCommit` is: the kernel owns no
text value, so it cannot empty one. It does not own the *selection* either in the sense that matters
here — whether clearing the text should also clear the selection is a product decision, and
`Combobox.Clear` makes it (both halves, because a field showing nothing while still reporting `apple`
to its `onChange` is exactly the mismatch `allowsCustomValue` exists to make deliberate).

## It is not a `CloseButton`

`@hope-ui/components/close-button` is a themed, surface-adaptive dismissal affordance with its own
recipe and its own size scale. This is a slot inside another control's box, and the two want
different metrics and different labels ("Close" vs "Clear" — several locales inflect for the object).
`Combobox.Clear` renders `XIcon` directly.

## Composition and precedence

`createButton` is composed for the disabled handling and the press engine; `nativeButton={false}`
switches it for a non-`<button>` render target. Consumer handlers run first, so a `preventDefault()`
in `onClick` cancels the clear.

## SSR

Nothing here reads the DOM. Whether the button renders at all is the component's call —
`Combobox.Clear` hides itself while the field is already empty, which is a `<Show>` in the component
layer, not a concern of this hook.

## Rejected alternatives

### Sharing one hook with [`createComboboxToggle`](combobox-toggle.md)
**Why not:** covered there. The overlap is two rules; the divergence is the entire ARIA surface.

### Clearing the value in this hook rather than calling out
**Why not:** the kernel owns no text value — the invariant `combobox-root.md` is built around. It also
could not decide the selection half: `allowsCustomValue`, and whether a multi-select clear means "drop
every pick" or "drop the query", are both Combobox policy.

### Rendering `CloseButton` for this part
**Why not:** the label is wrong ("Close" is not "Clear", and the two inflect differently across the
catalog), the recipe is wrong (a standalone dismissal affordance, sized on its own scale, not a gutter
glyph inside a bordered shell), and it would couple a leaf part to a heavier sibling for a `<button>`
and an icon.

### Keeping the button mounted when there is nothing to clear
**Why not:** a control that does nothing is worse than an absent one — it is a click target that
reports success and changes nothing. The component exposes `alwaysVisible` for a consumer who wants a
stable gutter width instead.
