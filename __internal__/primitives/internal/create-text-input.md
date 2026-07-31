# `createTextInput`

Text-entry value state for `<input>` and `<textarea>`: the controlled/uncontrolled dance, plus the
two things a hand-rolled `onInput` gets wrong — **IME composition** and **caret preservation**.

Roadmap #9. `Combobox.Input` is the first consumer; `Input`, `Textarea`, `TagsInput` and
`NumberInput` are the rest, so nothing here is combobox-shaped.

## API

```ts
function createTextInput<T extends TextInputElement = HTMLInputElement>(
  options?: {
    value?: Accessor<string | undefined>;
    defaultValue?: Accessor<string>;
    onChange?: (value: string) => void;
    onInput?: Accessor<JSX.InputEventHandlerUnion<T, InputEvent> | undefined>;
    onCompositionStart?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
    onCompositionEnd?: Accessor<JSX.EventHandlerUnion<T, CompositionEvent> | undefined>;
  },
): {
  inputProps: { value: string; onInput; onCompositionStart; onCompositionEnd };
  value: Accessor<string>;
  setValue: (value: string, selection?: TextInputSelection) => void;
  isComposing: Accessor<boolean>;
  setRef: (element: T) => void;
};
```

`TextInputElement` is `HTMLInputElement | HTMLTextAreaElement` — the whole selection API is shared.
`TextInputSelection` is `{ start: number; end: number; direction?: "forward" | "backward" | "none" }`,
in the UTF-16 code units `setSelectionRange` speaks.

`value`/`defaultValue`/`onChange` are [`createControllableState`](create-controllable-state.md)'s,
unchanged: controlled-ness is decided per read by `value() === undefined`, so `""` is a perfectly
good controlled value, and `onChange` fires on every *requested* change — typing, each composition
update, `compositionend`, and a programmatic `setValue`.

`setRef` follows [`createButton`](create-button.md): the primitive emits the props for the element,
so it owns the element signal and hands back one ref to wire.

## The DOM value is owned here, not by a JSX binding

`inputProps.value` is an **untracked snapshot** — enough for the server's markup and the hydrated
element to agree — and a single reconcile effect performs every write after that.

That is the load-bearing choice, because both fixes below are about deciding *when not to write*, and
a live `value={…}` binding puts the write somewhere this file cannot veto it. It is still a getter
rather than a captured constant, so a remounted element renders the current value.

## IME composition

Assigning `input.value` during an active composition destroys the candidate buffer: the half-typed
CJK word is replaced by whatever the controlled round-trip produced, mid-word. So **no write happens
between `compositionstart` and `compositionend`** — the DOM is authoritative for that window.

`onChange` still fires per composition update, so a consumer that filters as you type sees the
intermediate text. One that shouldn't gates on `isComposing()`; that policy is the consumer's, not
this primitive's.

`compositionend` re-reads the element rather than trusting an ordering: **Chrome fires the final
`input` before `compositionend`, Safari after**, and re-reading commits the same text under both.

## Selection preservation

`input.value = next` moves the text entry cursor to the end whenever the new value differs (HTML
standard, the `value` setter). That is invisible until a controlled consumer **transforms** what it
is handed — uppercases it, trims it — at which point every keystroke in the middle of a word
teleports the caret to the end. It is what makes autocomplete-as-you-type feel broken.

So the caret is captured on `input` and reapplied after the write. Two consequences:

- **Only a change that came through an input event restores.** A purely programmatic `setValue`
  with no `selection` leaves the caret where the browser puts it, which is the behavior a user
  expects when a field is replaced out from under them.
- **`setValue(next, selection)` places it explicitly** — the inline-autocomplete shape, so `"ca"` →
  `"café"` can leave `"fé"` selected.

Offsets past the end of a shorter new value need no clamping: "set the selection of a text control"
clamps both to the API value's length. Input types with no text-entry cursor (`email`, `number`,
`color`) read `selectionStart` as `null` and throw `InvalidStateError` from `setSelectionRange`, so
that `null` is the type check on both the capture and the apply.

## The reconcile runs per write request, not per value change

A controlled consumer that **rejects** a change leaves `value` untouched, so a value-change-only
effect would never run and the element would keep text the component does not report. A counter
bumped by every write request is what makes the effect run anyway and snap the DOM back.

## `onInput` is not a cancel channel

The repo-wide `preventDefault()` veto ([`composeEventHandlers`](../../../packages/primitives/src/utils/events.ts))
needs a cancelable event, and the native `input` event is not one — `defaultPrevented` stays `false`
and the behavior runs regardless. A consumer that must reject a keystroke sets **`onBeforeInput`** on
the element: cancelable, and never consumed here, so it forwards untouched and stops the DOM change
before `input` ever fires.

## SSR

`inputProps.value` is computed from props only, so server and client markup agree. Every DOM read and
write lives inside the reconcile effect, which never runs server-side.

## Rejected alternatives

### A live `value={…}` binding, with the caret restored in a following effect

**Why not:** it makes both fixes depend on Solid internals instead of on this file. Suppressing the
mid-composition write would have to be done by *masking* the reported value (report the DOM's own
text so the binding writes an identical string), which leans on the `value` setter being a no-op for
an equal value **during an active composition** — true per spec for the caret, unverified for the IME
session. And the caret restore would have to run strictly after the binding's render effect, an
ordering guarantee that is real but is one more undocumented dependency. Owning the write costs a
counter and a getter, and puts every "when not to write" decision in one place.

### Suppressing `onChange` during composition, as Base UI's `ComboboxInput` does

**Why not:** it is a Combobox policy wearing a text-input's clothes. Base UI suppresses so its
`Empty` state does not flash while a CJK word is half-typed — a real concern, but one that belongs to
whoever renders `Empty`. Propagating and exposing `isComposing()` lets that consumer make the call
while an `Input` or `Textarea` that wants every keystroke still gets them. Base UI's own code carries
an Android caveat for exactly this coupling (Samsung's predictive keyboard reports as always
composing), which a primitive shouldn't inherit.

### `beforeinput`-based validation, as react-aria's `useFormattedTextField` has

**Why not:** that hook exists to *reject* input against a format — it computes the would-be next
value per `inputType` and cancels the event. This primitive has no format to validate against, and
the `inputType` switch is ~50 lines of per-browser deletion semantics that would be dead code here.
`onBeforeInput` is left unconsumed so a consumer (a future `NumberInput`) can do exactly that, and
`createFormattedTextInput` is where the switch belongs if one is ever ported.

### Mapping the caret through the transform instead of restoring the raw offset

**Why not:** a transform that changes length before the caret (inserting thousands separators) does
need a mapping, but there is no general way to derive one from a `string => string` function — the
consumer would have to supply it, which is `NumberInput`'s formatter, not this. Restoring the raw
offset is what React does for controlled inputs and it is exactly right for the length-preserving
transforms (case, trim-trailing, character filtering) that motivate the fix at all.

**Revisit if:** a formatter-shaped consumer lands and wants `onChange` to return a caret alongside
the value.
