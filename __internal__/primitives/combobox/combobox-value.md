# `createComboboxValue`

The value part of the [combobox hook family](combobox-root.md): the element inside the trigger that
displays the current selection.

```ts
function createComboboxValue<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): {
  props: JSX.HTMLAttributes<HTMLElement> & { "data-placeholder": "" | undefined };
  isPlaceholder: Accessor<boolean>;
};
```

It does two things, and deliberately not a third: it **registers its id** so the trigger can announce
the value before the label, and it emits **`data-placeholder`**. It does not render or format the
value — the consumer's `children` do that, because "how a selection reads" is a component and app
concern, not a kernel one.

## Why the id is registered

`createComboboxTrigger` prepends `state.valueId()` to the trigger's `aria-labelledby`, so a screen
reader announces the current selection **before** the field's label — react-aria's `useSelect`
ordering. Content-based naming produces the opposite order, which is backwards for a field whose whole
purpose is its value. Details, including what happens to a consumer's `aria-label`, are in
[`combobox-trigger.md`](combobox-trigger.md).

The id is the consumer's `props.id` when given, else a generated `createUniqueId()`. Registration goes
through `createRegisteredId`, whose deferral is what keeps a descendant writing an ancestor-owned
signal from throwing `[REACTIVE_WRITE_IN_OWNED_SCOPE]` — and whose cleanup is what stops the trigger
pointing at a removed node once this part unmounts.

**The hook must be called from the part that renders the element**, not from an ancestor. Called
higher up, a tree with no value element would still publish a `valueId`, and the trigger's
`aria-labelledby` would dangle. The test harness makes this concrete: its value part is a nested
component for exactly this reason.

## `data-placeholder`

Present-empty (`""`) when nothing is selected, absent otherwise — so a recipe styles one
`data-placeholder:` variant and the empty state needs no slot of its own.

Emptiness is read off **`state.list.value()`**, the listbox's own `V[]`, not the adapted scalar: it is
one condition there (an empty array) where the adapted shape spells it `null` in single mode and `[]`
in multiple.

## SSR

Attribute computation plus one `createUniqueId()`, which is SSR-stable. `createRegisteredId` runs in
`onSettled` and therefore never server-side, so a server render leaves the trigger named by its own
contents — which contain this element anyway. Nothing to disagree about across the round-trip; the
trigger simply gains `aria-labelledby` after hydration, an attribute change rather than a structural
one.

## Rejected alternatives

### Generating `valueId` on the root, as `popupId` is
**Why not:** the root cannot know whether a `Value` part exists, so the trigger would either always
prepend the id (dangling whenever no value element is rendered) or need a second "is one mounted?"
signal to go with it. Registering from the part's own scope answers both questions with one mechanism.
`popupId` is different only because `aria-controls` must be correct in the server's markup, and the
list's id already has a generated fallback via `list.id()`.

### Leaving the value out of the accessible name entirely (content-based naming only)
**Why not:** the value element sits inside the trigger, so it is *already* part of the name — the
question is only the order, and content order puts the label first. A field whose purpose is its value
should announce the value first, which is why react-aria registers the id rather than relying on
containment.

### A `placeholder` option on the kernel, rendered when nothing is selected
**Why not:** it makes the kernel own a string it cannot localize, style or truncate, and it duplicates
what `children` already expresses. `data-placeholder` gives a recipe the styling hook without the
kernel taking a position on the text.

### A boolean `data-placeholder="true"` instead of the present-empty form
**Why not:** it would need a recipe to spell `data-[placeholder=true]:` where every other state hook in
this repo (`data-active`, `data-selected`, `data-disabled`) is present-empty and targeted with
`data-placeholder:`. One convention, uniformly.
