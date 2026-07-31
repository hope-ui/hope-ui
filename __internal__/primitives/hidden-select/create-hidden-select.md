# `createHiddenSelect`

The two native-form behaviors a hidden field owes its widget, neither of which comes for free once
the real control is clipped out of sight: **restore on form reset**, and **cancel the browser's
error UI on a blocked submit, moving focus somewhere visible**.

Split out of [`HiddenSelect`](hidden-select.md) because it is about the control's *form*, not about
the control: it knows nothing of listboxes, options or selections, and works against any
constraint-validated element. Structural port of React Aria's `useFormReset` and the listener half
of `useFormValidation` (Apache-2.0). See [`NOTICE.md`](../../../NOTICE.md).

## API

```ts
function createHiddenSelect<T>(options: {
  /** The hidden control — the `<select>`, or the FIRST `<input>` of the fallback path. */
  element: Accessor<HTMLSelectElement | HTMLInputElement | null | undefined>;
  /** The value to restore when the owning `<form>` is reset. */
  defaultValue: Accessor<T>;
  /** Called with `defaultValue()` on the form's `reset`. */
  onReset?: (value: T) => void;
  /** Focuses the VISIBLE control this field stands in for. */
  focusTrigger?: () => void;
}): void;
```

```ts
createHiddenSelect<Fruit[]>({
  element: control,
  defaultValue: () => defaultSelection,
  onReset: (value) => state.selection.setValue(value),
  focusTrigger: () => triggerRef()?.focus(),
});
```

`element` must be a **real signal accessor**, tracked in the effect's compute. A hidden field is
rendered as a consequence of `name` (and of the option count crossing the `<select>` cutoff), so an
untracked read would catch it `undefined`, forever — the same hazard
[`createFocusTrap`](../internal/create-focus-trap.md) and
[`createRegisteredElement`](../internal/create-registered-element.md) document.

## Reset

`form.reset()` reverts the hidden control's own DOM state and tells the widget nothing, so the two
would drift apart on the very first reset. A `reset` listener on the owning form calls `onReset` with
`defaultValue()`.

- **`defaultValue()` is sampled at reset time, not at creation time** — deliberately `untrack`ed, so
  the listeners are not torn down and reattached on every selection change. It is spelled rather than
  left implicit because `form.reset()` can be called from inside an effect, where the read would
  trip `[STRICT_READ_UNTRACKED]` (the argument `createDismissable` makes for its `exclude` read).
- **A reset another listener already cancelled is ignored** (`event.defaultPrevented`). Same-target
  listeners fire in registration order, so "already cancelled" in practice means a capture-phase
  listener on an ancestor.

What "default value" means for a widget is the caller's decision. `HiddenSelect` samples the
selection the field was **created** with — the `defaultValue` prop, or the initial controlled `value`
— because that is the moment the "markup" existed, which is what native reset semantics restore.

## Invalid

A blocked submit fires `invalid` on the offending control, and the browser then tries to anchor a
validation bubble to it — a 1px clipped `<select>`, or a `display: none` `<input>` it refuses to
point at at all (*"An invalid form control is not focusable"*). So the listener cancels the report
and moves focus somewhere a user can see.

**Cancelling `invalid` suppresses the report, never the constraint.** Submission stays blocked either
way; all that changes is that no bubble appears against an invisible element.

Focus is taken **only when this is the form's first invalid control** — the same control the browser
itself would have focused. A form with an empty required text field above the widget must land on
that field, not here. The scan walks `form.elements` for the first `validity.valid === false`, which
is React Aria's `getFirstInvalidInput`.

An `invalid` event that arrives already cancelled leaves focus to whoever cancelled it.

## Out of scope

`setCustomValidity` and realtime validation errors — surfacing an error *message* is a future
`Field`'s job. This hook owns blocking and focus, nothing more.

## Lifetime

Both listeners live in one `createEffect` keyed on `element`. The form is sampled alongside the
element (`element.form`), which is React Aria's shape too: a control moved to a different form is
remounted, which re-runs the effect with a fresh element. Disposing the owner removes both listeners.

## SSR

Everything is inside `createEffect`, which never runs server-side — no listener is attached and no
DOM is touched during a server render.

## Rejected alternatives

### Letting the browser report the invalid control itself

**Why not:** the browser anchors its validation bubble to the control that failed, which here is a
1px clipped `<select>` — or, past the option cutoff, a `display: none` `<input>` it refuses to point
at at all (*"An invalid form control is not focusable"*). The user gets a blocked submit with no
visible explanation, or none at all. Cancelling the report suppresses only the bubble; the
constraint still blocks submission, and focus moves to the visible control instead. See *Invalid*
above.

### Taking focus on every `invalid` event

**Why not:** a form with an empty required text field above the widget would land the user on the
widget rather than on the first field they have to fix — the browser's own behavior is to focus the
first invalid control, and a hidden field that jumps the queue silently reorders the form. The scan
matches it (React Aria's `getFirstInvalidInput`).

### Tracking `defaultValue()` as an effect dependency

**Why not:** both listeners would be torn down and reattached on every selection change, for a value
only ever read at reset time. It is `untrack`ed rather than left implicit because `form.reset()` can
be called from inside an effect, where a plain read trips `[STRICT_READ_UNTRACKED]` and `mount()`
fails the test.
