# `HiddenSelect`

The native form control behind a widget that has no native equivalent — one clipped, real
`<select>` (or, past 300 options, one `<input>` per selected value) carrying a listbox's selection
into `FormData`.

The **second DOM-rendering member of `@hope-ui/primitives`**, after
[`ModalBackdrop`](../modal-backdrop/modal-backdrop.md), and shared for the same reason: `Listbox`
and a future `Select` need it identically, and the obvious hand-rolled version — an
`<input type="hidden">` per value — silently drops `required`, `disabled`, autofill and form reset.
That was `Listbox.Root`'s hidden-field block before this primitive existed, and it is exactly why
`createListbox`'s `required` option was dead plumbing for its whole life.

Structural port of React Aria's `HiddenSelect` (Apache-2.0). See [`NOTICE.md`](../../../NOTICE.md).

## API

```tsx
function HiddenSelect<V>(props: {
  /** The widget state this field mirrors — everything rendered and written back comes from here. */
  state: CreateListboxReturn<V>;
  /** The visible control to focus when a blocked submit reports the field invalid. */
  triggerRef?: Accessor<HTMLElement | null | undefined>;
}): JSX.Element;
```

```tsx
import { HiddenSelect } from "@hope-ui/primitives/hidden-select";

const state = createListbox<Fruit>({ items, name: "fruit", required: true, /* … */ });

<HiddenSelect state={state} triggerRef={listElement} />;
```

It reads eight things off `state` and takes no other configuration: `indexed.items()` +
`itemToValue` (the `<option>`s), `formValues()` (what is selected), `selectionMode()` (`multiple`),
`name()` / `form()` / `required()` / `disabled()` (the field), and `selection.setValue` (the
write-back). Nothing about the field is a separate prop, so a component that renders it cannot
configure it inconsistently with the widget it belongs to.

## Rendering rules, each with a browser behind it

- **Clipped, never `display: none` or `hidden`.** Safari skips a `display: none` `<select>` for
  autofill entirely. The style is React Aria's `useVisuallyHidden` box — 1px, `clip-path: inset(50%)`,
  `overflow: hidden` — at `position: fixed` so a 1px box inside a scrolled container cannot extend
  the scroll area. The two offsets are respelled logical (`inset-block-start` / `inset-inline-start`)
  for `check:rtl-safety`; for a 1px invisible box the side is arbitrary either way.
- **Wrapped in a `<label>`.** Firefox identifies the `<select>` through its label; other engines make
  do with surrounding text. It carries no text of its own — the widget owns the accessible name, and
  this subtree is `aria-hidden` regardless.
- **`aria-hidden` on the container, `tabindex="-1"` on the control.** The widget already exposes the
  real semantics; this must be neither announced nor tabbed into. axe is happy with the pair: the
  control is focusable but not *tabbable*, so `aria-hidden-focus` does not fire (verified — no
  `allowIncomplete` is needed at any call site).
- **A leading empty `<option>`.** It is HTML's [placeholder label
  option](https://html.spec.whatwg.org/multipage/form-elements.html#placeholder-label-option), which
  is what makes `required` fail while nothing is chosen. Its label is a non-breaking space so the
  native picker shows a blank row rather than a zero-height one.
- **Both `onChange` and `onInput`,** on one handler. Engines disagree about which a `<select>` fires.

## Opt-in via `name`

With no `name` it renders **nothing**. A field with no name is never submitted and gives autofill
nothing to match on, so the alternative would be an `aria-hidden`, focusable `<select>` on every
listbox in the app in exchange for nothing. React Aria renders it unconditionally — its Select
always has a field identity; a `Listbox` does not.

## The selection travels on `<option selected>`, not `<select value>`

A `value` attribute on `<select>` is inert HTML — the browser ignores it. So `selected` on each
option is the **only** channel a server render has, and a `<select value={…}>` would submit nothing
before hydration.

On the client, `selected` is a *property* write, and its ordering against the `<select>`'s own
`multiple` property is not guaranteed: options selected while `multiple` is still false collapse to
the last one, and a multi-select field silently submits a single value. So the live element is also
synced from a `createEffect` after render, when both have settled. Two channels, one for each
environment; the effect is the authority on the client.

## The `<select>` has exactly one child expression, deliberately

Placeholder, item options and the empty-collection fallback are one `nativeOptions` memo rendered by
one `<For>`, rather than three sibling blocks. The sibling version reads more directly and **crashes
in any non-hydratable client compile** — a plain Vite app, and Storybook: the compiler omits closing
tags there, so the HTML parser's *"in select"* insertion mode nests the dynamic-child comment
placeholders inside the never-closed static `<option>`, and the generated `nextSibling` walk hits
`null`. Full writeup, including why no test in this repo can see it, in
[`solid-2.0-notes.md`](../../solid-2.0-notes.md).

## Writing back

Autofill and the mobile picker both arrive as a native `change`/`input`, and the widget has to
follow. The handler maps the control's selected values back to items through the same option list it
rendered, and hands them to `state.selection.setValue` in **one** write — see
[`createListSelection`](../internal/create-list-selection.md) § `setValue` for why one. A value not
in the option set (the placeholder's `""`) resolves to nothing and is dropped, which is how
"chose the blank row" becomes "cleared the selection".

Resolution goes through the rendered option list rather than `state.indexOfValue`, which reports
`-1` in virtual mode.

## The >300-option fallback

Above 300 options a real `<select>` stops paying for itself: the autofill it buys is worth less than
several hundred `<option>` nodes, server-rendered on every request. React Aria's cutoff, kept
verbatim. Past it, one `<input type="text" style="display: none">` per selected value.

Two details that look like mistakes and are not:

- **`type="text"`, never `type="hidden"`.** A hidden input is barred from constraint validation, so
  `required` on it would be silently ignored — the whole reason this branch is separate.
- **`required` on the first field only** (React Aria's `i === 0 ? required : false`). One unsatisfied
  constraint is what blocks a submit; putting it on every field would only multiply the `invalid`
  events. The branch always renders at least one field, empty-valued, so a `required` widget with
  nothing selected still has a control to fail on.

## Empty option set

The option set can still be empty on the first render — data streaming in, or a server render that
resolves after this one. `nativeOptions` emits an `<option>` for each *current* value anyway, so the
`<select>` has a value (and a `FormData` read is correct) immediately. Ported from React Aria, which
carries the same case for the same reason.

## What it deliberately does not do

- **No `render` prop and no DOM-prop forwarding.** Nobody writes this in JSX — a component renders
  it — exactly as with `ModalBackdrop`. It is not a public part.
- **No `setCustomValidity`, no realtime validation errors.** Surfacing an error message is a future
  `Field`'s job. This primitive owns *blocking* an invalid submit and putting focus somewhere
  visible, nothing more.
- **No `autocomplete` prop.** `name` is what drives the browser's autofill heuristics, and nothing
  in-repo has a reason to steer them further yet. Additive if that changes.

## SSR

Renders normally on the server — that is the point, since autofill needs the option set in the
initial HTML. The behavior half ([`createHiddenSelect`](create-hidden-select.md)) is entirely inside
`createEffect`, so no listener is attached and no DOM is touched during a server render. The
client-side selection sync is an effect too.

`Listbox`'s round-trip covers it end to end: `listbox.ssr.test.tsx`'s byte snapshot contains the
whole `<select>`, and `listbox.browser.test.tsx` hydrates that exact markup.

## Rejected alternatives

### `<input type="hidden">` per selected value

**Why not:** a hidden input is *barred from constraint validation*, so `required` on it is silently
ignored — which is exactly what `Listbox.Root` shipped before this primitive existed, and why
`createListbox`'s `required` option was dead plumbing for its whole life. Autofill, `disabled`
reflection and form reset go with it:

| | `<input type="hidden">` | clipped `<select>` |
| --- | --- | --- |
| Submits the value | yes | yes |
| Browser autofill | no — nothing to match against | **yes**, against the `<option>`s |
| `required` blocks submission | **no** — barred from constraint validation | **yes** (`valueMissing`) |
| `disabled` removes it from submission | needs a hand-written conditional | native |
| Mobile form navigation | no | native |

Autofill is what makes the data-driven item source load-bearing rather than an implementation
detail: the browser matches the user's stored value against `<option>`s that must *exist*, including
in the server render, before anyone has opened a popup. A DOM-registered collection could never
provide that (see [`createDataCollection`](../internal/create-data-collection.md)).

### `type="hidden"` on the >300-option fallback inputs

**Why not:** the same constraint-validation bar. The fallback exists to keep `required` working past
the point where a `<select>` stops paying for itself, so an input the browser refuses to validate
would defeat the branch it lives in. `type="text"` behind `display: none` validates normally.

### `display: none` (or `hidden`) on the `<select>`

**Why not:** Safari skips a `display: none` `<select>` for autofill entirely — the one thing a real
`<select>` is here to provide. The clip technique keeps it rendered and matchable; see *Rendering
rules, each with a browser behind it* above.

### `<select value={…}>`, React Aria's channel

**Why not:** a `value` attribute on `<select>` is inert HTML, so the server render would carry no
selection at all and a `FormData` read before hydration would submit nothing. `selected` per option
is the only channel a server render has — see *The selection travels on `<option selected>`* above
for why the client is then synced from an effect instead.

### Placeholder, options and fallback as three sibling blocks inside `<select>`

**Why not:** it crashes in any non-hydratable client compile — a plain Vite app, and Storybook.
`babel-preset-solid` omits closing tags there, so the HTML parser's *"in select"* insertion mode
nests the dynamic-child comment placeholders inside the never-closed static `<option>` and the
generated `nextSibling` walk hits `null`. No Vitest project in this repo compiles that way, so
nothing automated can see it. See *The `<select>` has exactly one child expression, deliberately*
above and [`solid-2.0-notes.md`](../../solid-2.0-notes.md).

**Revisit if:** `babel-preset-solid` stops omitting closing tags in the non-hydratable compile — the
sibling form reads more directly and would be the better shape.

### Rendering the field unconditionally, as React Aria does

**Why not:** a field with no `name` is never submitted and gives autofill nothing to match on, so
every listbox in the app would carry an `aria-hidden`, focusable `<select>` — and, past the cutoff,
hidden inputs — in exchange for nothing. React Aria's Select always has a field identity; a
`Listbox` does not.
