# `createComboboxInput`

Combobox's **focus owner**: the `role="combobox"` element that keeps real DOM focus for the widget's
whole lifetime and points `aria-activedescendant` at the active option. It is the same role in the
[combobox hook family](combobox-root.md) that [`createComboboxTrigger`](combobox-trigger.md) plays
for Select — on an `<input>` instead of a `<button>`.

```ts
function createComboboxInput<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value"> & {
    textInput: CreateTextInputReturn<HTMLInputElement>;
    onCommit?: () => void;
    onRevert?: () => void;
  },
): {
  props: JSX.InputHTMLAttributes<HTMLInputElement>;
  setRef: (element: HTMLInputElement) => void;
};
```

`textInput` is a control prop, never spread as an attribute. So are `onCommit` and `onRevert`.

## ARIA

| Attribute | Value |
| --- | --- |
| `role` | `"combobox"` |
| `aria-autocomplete` | `"list"` |
| `aria-expanded` | `"true"` / `"false"` |
| `aria-controls` | the popup's id — **only while open** |
| `aria-activedescendant` | the active option's id — **only while open** |
| `aria-haspopup` | **absent** |

`aria-haspopup` is absent on purpose. ARIA 1.2 gives `role="combobox"` an implicit
`aria-haspopup="listbox"`, and react-aria's `useComboBox` omits it for that reason. The chevron
([`createComboboxToggle`](combobox-toggle.md)) carries an explicit one, because a `<button>` implies
nothing.

Both IDREFs are open-gated for the reason `combobox-trigger.md` spells out at length: the popup is
mounted lazily, and an attribute naming an element that is not in the DOM is an axe
`aria-valid-attr-value` violation on every closed Combobox on the page.

`role="combobox"` **needs an accessible name**. There is no `Label` part (see `combobox-root.md`), so
that means an `aria-label` or `aria-labelledby` from the consumer, on every tree — a nameless one is
an axe `aria-input-field-name` violation, and the `role="listbox"` popup inherits its name from here.

Unlike the trigger, this hook builds **no `aria-labelledby` chain**: Combobox has no `Value` part to
announce ahead of the label, because the field's own text *is* the value.

## The attributes that are not ARIA

`autocomplete="off"`, `autocorrect="off"`, `autocapitalize="none"` and `spellcheck="false"`. The
widget provides its own suggestions and the browser's would overlay the popup with a second,
unrelated list; `spellcheck` in particular is what stops macOS Safari autocorrecting a half-typed
query out from under the filter. All four defer to a consumer's own value.

`spellcheck` is the **string** `"false"`, not a JS `false`. It is an *enumerated* attribute (Solid
types it `EnumeratedPseudoBoolean`), so a boolean serializes to an absent attribute — and an absent
`spellcheck` inherits, which on an `<input type="text">` means enabled. Silent, and exactly the
opposite of the intent. React Aria spells it `'false'` for the same reason.

## Keyboard interaction

| Key | Closed | Open |
| --- | --- | --- |
| `ArrowDown` / `Alt+ArrowDown` | open on the **first** option | next option |
| `ArrowUp` | open on the **last** option | previous option |
| `Alt+ArrowUp` | open on the **last** option | close |
| `Enter` | *unbound* — the form submits | `onCommit()`, close, `preventDefault` |
| `Tab` | *unbound* | `onCommit()`, focus leaves (no `preventDefault`) |
| `Escape` | *unbound* — it belongs to whatever encloses this | `onRevert()`, close |
| `Home` / `End` / `PageUp` / `PageDown` | *unbound* — caret keys | delegate to `list.navigation` |
| `ArrowLeft` / `ArrowRight` | *unbound* | drop the highlight, caret still moves |
| `Space`, any printable character | *unbound* — it types | *unbound* — it types |
| blur | — | `onCommit()` |

Five rows differ from the button trigger's map, and each is a bug if copied across.

**`Space` and every printable key are unbound.** They type. There is **no typeahead** — react-aria
spells the same decision `disallowTypeAhead: true` — because the input *is* the search affordance and
a second buffer would race the one the user can see. This is the one behavior Select has that
Combobox drops.

**`Home`/`End`/`PageUp`/`PageDown` are caret keys while closed** and list keys while open. That is
`useComboBox` chaining its collection handlers behind `state.isOpen &&`. Bound unconditionally, they
would break jump-to-start in a field the user is editing.

**Enter does not `preventDefault()` while closed**, so a combobox in a form still submits it. The
button trigger must always `preventDefault()`, for the *opposite* reason: a native `<button>`
synthesizes a `click` from Enter, which would re-enter the toggle and close what the keydown just
opened.

**`ArrowLeft`/`ArrowRight` drop the highlight** without consuming the event. Moving the caret means
the user is editing text again, so an option that stays highlighted is one Enter away from being
committed by mistake.

**Blur commits.** A click on an option or on a gutter button never reaches it — the list and both
buttons `preventDefault()` their pointerdown to keep focus in the field — so a blur means focus
genuinely left the widget.

## Commit and revert are policy, and policy is the component's

The kernel owns no text value, so it cannot know what "commit" means: whether free text is allowed,
what the highlighted option's label is, what the last committed text was. What it *does* own is the
**binding** — which keys mean commit, whether each one `preventDefault()`s, and that closing
accompanies them — because a keymap split across two layers is exactly the drift this kernel exists
to prevent.

So `onCommit`/`onRevert` arrive as callbacks. `onCommit` **must be idempotent**: Tab fires it and the
blur that follows fires it again.

The same seam appears twice already in this family: `createListTypeahead`'s `onMatch`, and
`createCombobox`'s `shouldCloseOnSelect` wrapping the selection's `onChange`.

## The text value is spread, never bound

`textInput.inputProps` is merged in whole — its `value` snapshot and its `onInput` /
`onCompositionStart` / `onCompositionEnd`. This hook composes the consumer's handlers *in front of*
each, so the order is **consumer → kernel → the text primitive's own write**, and a consumer's
`preventDefault()` still cancels the map.

`value` is an untracked snapshot and a reconcile effect owns every write after the first — see
[`createTextInput`](../internal/create-text-input.md). **Never add a second `value={…}`**: it puts
the write where that file cannot veto it, and both of its fixes (the mid-composition suppression and
the caret restore) depend on choosing when *not* to write.

`onBeforeInput` is deliberately **never consumed**, by this hook or by `createTextInput`. The native
`input` event is not cancelable, so the repo-wide `preventDefault()` veto cannot work there;
`onBeforeInput` is cancelable and forwards untouched, which is how a consumer rejects a keystroke.

## `setRef`

Registers the element as `state.triggerElement` — the focus owner, and the fallback positioning
anchor — **and** hands it to `textInput.setRef`, which is what the reconcile effect writes into.
A render target that drops function refs therefore leaves the popup unpositioned *and* the field
unwritable, both silently.

A Combobox that renders a `Control` shell registers *that* as `state.anchorElement`, and the
positioning and dismissal both prefer it. See `combobox-root.md`.

## SSR

Every attribute is computed from props and state, so server and client markup agree. The value
snapshot is computed from props on both sides. `createRegisteredId` never runs during SSR, so a
consumer `id` is simply used directly on the server.

## Rejected alternatives

### Parameterizing `createComboboxTrigger` with an `as: "button" | "input"` option
**Why not:** the two agree on the ARIA and disagree on nearly everything else, so the option would not
be one branch — it would be seven. `createButton` composition is trigger-only; typeahead composition
is trigger-only; the `aria-labelledby` value-first chain is trigger-only; and five of eight keymap
rows differ (Space, Enter-when-closed, Tab, Escape's meaning, the Home/End gate), each in a direction
where the button's behavior is a bug on an input and vice versa. The return type would also have to
widen to `HTMLAttributes<HTMLElement>` or become a union, losing the input-specific typing at every
call site. One hook with two personalities is what the kernel exists to prevent — it is the shape
Base UI's `SelectRoot` ended up in, one layer up.

**Revisit if:** a third focus owner appears whose divergence from one of these two is a genuine
single axis.

### Extracting the shared ARIA into a helper both hooks call
**Why not:** measured, it is five getters — `role`, `aria-expanded`, `aria-controls`,
`aria-activedescendant`, and the focus-tracking `onFocus`/`onBlur` pair — and even those are not
identical (the trigger adds `aria-haspopup` and the value-first `aria-labelledby`; the input adds
`aria-autocomplete`). A helper would save under a dozen lines and cost a third file that both hooks
have to be read against to know what they emit. The duplication is small, visible, and pinned by
tests on both sides.

### Owning the text value here, so `commit`/`revert` need no callbacks
**Why not:** it is the one thing `combobox-root.md` says this kernel must not do, and the reason is
structural rather than stylistic — an `inputValue` in the kernel is what forced Base UI's `SelectRoot`
into 757 lines that cannot import its own combobox. It would also make the hook unusable by Select,
which shares every line of ARIA here and has no text at all.

### Binding Enter/Tab/Escape in the component instead, composed behind this hook's `onKeyDown`
**Why not:** it splits one keymap across two layers, which is the drift this kernel exists to prevent
— and the split lands exactly where the subtleties are. Whether Enter `preventDefault()`s depends on
`open()`, which the component would have to re-derive; whether Tab does *not* is the difference
between a working Tab and a trapped one. The binding is mechanism and belongs here; only the meaning
of "commit" is policy.

### Reverting on a **closed** Escape, as react-aria does
**Why not:** react-aria reverts unconditionally and then negotiates propagation per case
(`!selectionManager.isEmpty || inputValue === '' || allowsCustomValue`), which needs state this hook
does not have. A closed combobox must let Escape reach whatever encloses it — a Dialog — and
`createComboboxTrigger` already draws that line. The cost is that text typed and then dismissed
without opening survives until the next commit, which is the rarer case.

### `spellcheck={false}` rather than `spellcheck="false"`
**Why not:** it silently does nothing. The attribute is enumerated, a boolean `false` serializes to
"absent", and absent means inherit — which is enabled. Caught by reading the SSR byte snapshot, not by
a type error.
