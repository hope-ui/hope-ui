# `createComboboxTrigger`

The trigger part of the [combobox hook family](combobox-root.md), and the **focus owner**: it keeps
real DOM focus for the widget's whole lifetime — open or closed — and points `aria-activedescendant`
at the active option.

```ts
function createComboboxTrigger<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: CreateComboboxTriggerProps,
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
};
```

`CreateComboboxTriggerProps` is `JSX.ButtonHTMLAttributes` plus `nativeButton?: boolean` — a control
prop for `createButton`, never spread as an attribute.

## ARIA

| Attribute | Value |
| --- | --- |
| `role` | `"combobox"`, always — it overrides `createButton`'s (`undefined` native, `"button"` otherwise) |
| `aria-haspopup` | `"listbox"` |
| `aria-expanded` | `"true"` / `"false"` |
| `aria-controls` | `state.popupId()` **only while open** |
| `aria-activedescendant` | the active option's id, **only while open** |
| `aria-labelledby` | `[valueId, the consumer's label]`, when a `Value` part is mounted |
| `id` | the consumer's, else `state.triggerId()`; a consumer's is published up |
| `type` / `disabled` / `data-disabled` / `data-pressed` | from `createButton` |

**`role="combobox"` on a Select's trigger is Base UI's choice, not react-aria's** — react-aria puts
the role only on Combobox's input and leaves Select's trigger a plain button. Roadmap #21 sides with
Base UI and APG 1.2, which is what lets one kernel serve both components.

**A nameless `role="combobox"` is an axe `aria-input-field-name` violation.** There is no `Label`
part by design (see [`combobox-root.md`](combobox-root.md)), so an `aria-label` or `aria-labelledby`
from the consumer is mandatory — on every story and every test tree.

### Both IDREFs are open-gated

`aria-controls` and `aria-activedescendant` both name elements inside a popup that is mounted lazily.
Left ungated they would dangle on **every closed Select on the page** — an invalid IDREF, which axe
reports as `aria-valid-attr-value`. The active index also survives a close (closed typeahead sets one
in multiple mode), so gating on `open()` rather than on "is something active" is what actually covers
it.

**axe cannot decide `aria-controls` while open, by construction.** `ariaValidAttrValueEvaluate`'s
pre-check returns *incomplete* for **any** element carrying both `aria-haspopup` and `aria-controls`,
without ever resolving the IDREF — a popup may be added on demand, so it defers to a human. Since
`expectNoA11yViolations` fails on `incomplete` too, tests that run axe against an open combobox pass
`allowIncomplete: ["aria-valid-attr-value"]` with that reason at the call site; the closed assertion
runs strict, and the IDREF itself is pinned by a direct assertion.

### `aria-labelledby` puts the value first

When a [`Value`](combobox-value.md) part is mounted, its id is **prepended** so a screen reader
announces the current selection before the field's label — react-aria's `useSelect` ordering. Content-
based naming would read them the other way round, which is backwards for a field whose whole purpose
is its value.

When the consumer named the trigger with `aria-label` (rather than `aria-labelledby`), the trigger also
names **itself**: `aria-labelledby` outranks `aria-label` in the accname algorithm, so without the
self-reference the consumer's label would simply vanish.

With no `Value` mounted there is nothing to prepend, and the consumer's own labelling is forwarded
untouched rather than joined to a dangling id.

## Keyboard interaction

The trigger owns the **entire** keymap, because there is nowhere else for it to live: no option is
ever focused, so no option ever receives a keydown.

| Key | Closed | Open |
| --- | --- | --- |
| `ArrowDown`, `Alt+ArrowDown` | open, `focusStrategy: "first"` | `list.navigation.next()` |
| `ArrowUp` | open, `focusStrategy: "last"` | `list.navigation.prev()` |
| `Alt+ArrowUp` | open, `focusStrategy: "last"` | **close** |
| `Enter`, `Space` | open, `focusStrategy: "selected"` | `list.selection.selectActive()` (the root's wrapped `onChange` closes) |
| `Escape` | — (not consumed) | close |
| `Home` / `End` | — | `list.navigation.first()` / `.last()` |
| `PageUp` / `PageDown` | — | `list.navigation.pagePrev()` / `.pageNext()` |
| printable | typeahead → **select**, popup stays shut | typeahead → highlight |

Three details are easy to get wrong, and each is pinned by a test:

**Enter and Space `preventDefault()`.** On a native `<button>` the browser synthesizes a `click` from
both, which would re-enter the toggle and close what the keydown just opened.

**The navigation keys call `list.navigation` directly rather than composing `navigation.onKeyDown`.**
That handler binds the arrows too, so composing it would run `next()` twice per ArrowDown. Only
`typeahead.onKeyDown` is composed — its printable-character fallback fires exclusively for keys no
`on(...)` binding above claimed.

**A closed Escape is not consumed** — no `preventDefault`, no handling — so a Select inside a Dialog
does not swallow the Dialog's Escape.

## Composition and precedence

`createButton` supplies `type`, the disabled behavior (native `disabled`, or `role`/`tabIndex`/
`aria-disabled` under `nativeButton: false`), the press engine, and `data-disabled`/`data-pressed`.

The consumer's handler runs **first** in every chain, so `event.preventDefault()` cancels the kernel's
behavior — and for `onKeyDown`, cancels the whole keymap at once (`composeEventHandlers` stops on
`defaultPrevented`).

`onFocus`/`onBlur` drive `list.focus.setFocused`, the **paint gate** for the option highlight
(`data-active` is "active *and* the widget is focused" — react-aria's `manager.isFocused`). This
element is the only one the widget's focus ever lands on, so it is the only place that can report it.

`setRef` registers the element on `state` — the positioning anchor, the one spared/excluded element —
**and** hands it to `createButton`, which consults it at event time for keyboard synthesis and the
dev-only element/`nativeButton` mismatch warning.

## SSR

Attribute computation only — no DOM access, no effects beyond `createRegisteredId` (which never runs
server-side). `triggerId` comes from `createCombobox`'s `createUniqueId` fallback, so the id is stable
across the round-trip; `aria-labelledby` gains the value id only after hydration, which is an
attribute change rather than a structural one.

## Rejected alternatives

### react-aria's shape — a plain `<button>` with no `role="combobox"`
**Why not:** the role is what makes one kernel serve both Select and Combobox. Without it the trigger
and the input would need different ARIA wiring, different `aria-activedescendant` plumbing and, in
practice, different keymaps — which is the drift roadmap #21 exists to prevent. Base UI puts the role
on Select's trigger (and re-asserts it defensively), and APG 1.2 describes exactly this pattern.

### Composing `list.navigation.onKeyDown` instead of calling the instance
**Why not:** that handler binds ArrowDown/ArrowUp itself, so every arrow would move the highlight
twice — and the closed-state branches (open on first/last) could never be expressed, because the
handler would act before the kernel's branch could decide. Calling `navigation.first()`/`next()`
directly delegates to the same instance without inheriting its keymap.

### Letting Enter/Space fall through to the browser's synthesized `click`
**Why not:** the click re-enters the toggle, so Enter opens and then immediately closes. Measured, not
theorized — the test *"selects with Enter — and the synthesized click does NOT reopen what it just
closed"* fails without the `preventDefault()`.

### `aria-controls` and `aria-activedescendant` emitted unconditionally
**Why not:** the popup is mounted lazily, so both would name elements that are not in the DOM — a
dangling IDREF on every closed Select on the page, which axe reports as `aria-valid-attr-value`. Base
UI's `DialogTrigger` ships the unconditional form; verified against axe-core 4.12 that it reports
whether `aria-expanded` is `"true"` or `"false"`, and reports nothing once the attribute is removed.

### Gating `aria-activedescendant` on "something is active" rather than on `open`
**Why not:** it does not cover the case that motivates the gate. Closed typeahead in multiple mode sets
an active index while the popup is shut, so "something is active" is true with nothing mounted to point
at.

### Appending the value id to `aria-labelledby` instead of prepending it
**Why not:** the announcement order is the entire reason the id is registered at all — content-based
naming already produces label-then-value. react-aria prepends for the same reason.

### Driving `focus.setFocused` from the list's `focusin`/`focusout`, as `createListbox` does
**Why not:** in activedescendant mode with an external focus owner, focus never enters the list at all,
so those events never fire and the highlight would never paint. The standalone listbox uses container
focus because there the container *is* the focus owner.
