# `createTagsInputControl`

The bordered shell of the [tags-input hook family](tags-input-root.md): the box the chip row, the text
field and the clear button sit inside. It renders no ARIA at all — the row is the `toolbar`, the field
is the `textbox` — and owns exactly two things.

```ts
function createTagsInputControl<V = string>(
  state: CreateTagsInputReturn<V>,
  props?: JSX.HTMLAttributes<HTMLElement>,
): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-disabled"?: string;
    "data-readonly"?: string;
    "data-invalid"?: string;
    "data-focus"?: string;
  };
  isFocused: Accessor<boolean>;
};
```

There is no `setRef`: this part needs no element of its own. `ref` is omitted from the *declared* type
so a consumer can put one straight on the element they render without the `Ref<HTMLElement>` /
`Ref<HTMLDivElement>` mismatch; a `ref` passed in props still forwards.

## `data-*`

| Attribute | Value |
| --- | --- |
| `data-disabled` | `""` while the widget is disabled |
| `data-readonly` | `""` while read-only |
| `data-invalid` | `""` while `invalid` |
| `data-focus` | `""` while focus is anywhere in the widget |

`data-focus` reads `state.focus.isFocused()` — the **widget's** flag, driven by the row and the field
together — rather than this element's `:focus-within`. The difference shows up on every removal:
removing a chip destroys the element that had focus, and the CSS pseudo-class drops for the frame
before focus is re-homed, so a `:focus-within` ring blinks. The flag does not, because both parts
resolve their focus-out on the next task (see [`tags-input-input.md`](tags-input-input.md)).

Everything else a consumer passes — `id`, `class`, `style`, `title`, `data-*`, `aria-*`, handlers — is
forwarded, and `onPointerDown` is composed in front of this hook's own so a `preventDefault()` cancels
the built-in behavior.

## Click anywhere focuses the field

The shell is padding around a field that is narrower than it, and gets narrower as chips fill the row.
Without this, a click on that padding lands on a `<div>`, focus goes nowhere, and the user has to aim
at the one part of the control that keeps moving.

```ts
onPointerDown: if the press is not already claimed and its target is not interactive
                 → preventDefault(), then state.inputElement()?.focus()
```

**`pointerdown`, not `click`:** the default action of a press is what moves DOM focus, so cancelling it
and focusing explicitly is what stops the ring flashing on the shell first. `click` still fires,
untouched — which is what keeps the ✕'s own removal working.

**`event.defaultPrevented` is checked first.** The chip's ✕ cancels its own `pointerdown` to keep focus
where it was, and that press still bubbles to this element; without the check, the shell would undo it
mid-press. Base UI spells the same guard `event.baseUIHandlerPrevented`.

### The interactive-target bail

Adapted from Base UI's `handleInputPress.ts` (its reasoning, not its code). A press that lands on the
✕, on a chip, on the clear button, or **in the field itself** is left alone — stealing it would cancel
the chip's own focus, or move the caret to the end of the text the user just clicked into. The test is
one `closest()`, scoped to this element's subtree so an interactive *ancestor* of the whole control
never matches:

```
button, a[href], input, select, textarea, [role="button"],
[contenteditable]:not([contenteditable="false"]), [tabindex]
```

`[tabindex]` is **unqualified**, where Base UI writes `[tabindex]:not([tabindex="-1"])`. Every chip and
every ✕ here is `tabindex="-1"` (`D2` — the field is the widget's single tab stop) *and* `D2` makes a
chip reachable **by pointer**; the narrower selector would pull focus straight back out of the chip the
user just clicked. Base UI can afford it because its chips are not pointer-focusable.

### `disabled` cancels, `readOnly` still focuses

A press on a disabled control is cancelled but focuses nothing, so the shell does not drag-select its
own chrome. A **read-only** one still focuses the field — a deliberate divergence from
`handleInputPress`, which returns early on `readOnly`. A read-only field is focusable and its text
selectable by definition, that being the whole difference from `disabled`, and there is no popup here
for the press to have opened (which is most of what Base UI's early return is protecting).

## SSR

Pure reads: four `data-*` derived from state, and a handler that attaches on hydration. `data-focus` is
absent server-side because `isFocused()` starts `false`, matching the `aria-live="off"` the row sends
for the same reason.

## Rejected alternatives

### A `<label>` wrapping the control instead of a press handler

**Why not:** a `<label>` re-targets *every* click inside it, including clicks on the chips and their
✕s — which is exactly the set the bail exists to protect. It also cannot express "cancel the press,
then focus", so the focus ring lands on the label first. And a `label` whose `for` names the field
would give the field an accessible name made of the whole chip row's text, which changes on every add.

### `onClick` rather than `onPointerDown`

**Why not:** by `click` the browser has already moved focus wherever the press said, so this would be a
second focus move rather than the only one — visible as a ring flashing on the shell, and on a press
that started a drag-selection it would yank focus after the selection was made. `pointerdown` is also
where the ✕'s own cancellation lives, so both decisions land in one phase of the same event sequence.

### Base UI's exact selector, `[tabindex]:not([tabindex="-1"])`

**Why not:** it treats a `tabindex="-1"` element as inert scenery, which is right for Base UI (its
chips are not pointer-focusable) and wrong here. `D2` reaches a chip *by pointer or by ArrowLeft*, so
under that selector every chip click would end with the caret in the field and the chip unfocused — a
silent failure, since the click still "works" and nothing throws.

### Tracking focus-within here, with this element's own `focusin`/`focusout`

**Why not:** it would be a third implementation of a flag the row and the field already own between
them, and `.Control` is the one part a consumer can omit — a widget without it would lose the flag
entirely. Reading `state.focus.isFocused()` keeps one source of truth, and the shell is a consumer of
it rather than a third author.

### `role="group"` on the shell, to name the whole widget

**Why not:** the chips are already `role="group"`, so a group of groups adds a nesting level a screen
reader reads through on the way to every chip, for a name the field's own `aria-label` already carries.
`D1` puts the widget's structure on the row (`toolbar`) and its name on the field; the shell is
presentation.
