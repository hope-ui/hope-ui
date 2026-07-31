# `createComboboxToggle`

The chevron button beside a Combobox's input: a pointer affordance for opening the popup, and nothing
else. Part of the [combobox hook family](combobox-root.md).

```ts
function createComboboxToggle<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { nativeButton?: boolean },
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
};
```

## This is what `Combobox.Trigger` assembles — not `createComboboxTrigger`

The naming crosses over once, and it is worth stating plainly:

| Component part | Hook | Is it the focus owner? |
| --- | --- | --- |
| `Select.Trigger` | [`createComboboxTrigger`](combobox-trigger.md) | **yes** — `role="combobox"` |
| `Combobox.Input` | [`createComboboxInput`](combobox-input.md) | **yes** — `role="combobox"` |
| `Combobox.Trigger` | **`createComboboxToggle`** | no |

The parts are named after what a user sees (a chevron that opens a list); the hooks are named after
what they are in the pattern. Using `createComboboxTrigger` here would put a second `role="combobox"`
in the tree — two fields to a screen reader, two `aria-activedescendant`s, two keymaps.

## ARIA

| Attribute | Value |
| --- | --- |
| `aria-label` | `combobox.triggerLabel` ("Show suggestions"), consumer-overridable |
| `aria-haspopup` | `"listbox"` — **explicit** |
| `aria-expanded` | `"true"` / `"false"` |
| `aria-controls` | the popup's id — **only while open** |
| `tabindex` | `-1`, component-owned |

`aria-haspopup` is explicit here and absent on the input: ARIA 1.2 gives `role="combobox"` an implicit
`listbox` popup, a `<button>` implies nothing.

The label is not optional. A bare chevron is an axe `button-name` violation and unreachable by voice
control. It comes from the locale catalog rather than from the consumer, because it is a string the
consuming app does not author — the same argument `common.close` makes.

There is deliberately **no `aria-activedescendant`**: the attribute belongs on the element that holds
DOM focus, and this one never does.

## It is not in the tab order, and it never takes focus

Two rules, both structural, both easy to lose:

**`tabindex="-1"`.** The input is the widget's single tab stop. A second one doubles the presses it
takes to cross a form of comboboxes, for behavior that is already bound to the input (ArrowDown opens;
Alt+ArrowUp closes). React Aria spells it `excludeFromTabOrder: true`. It is merged **after** the
consumer's props, so it is not forwardable — a consumer who puts this button back in the tab order
gets a stop that does nothing new.

**`preventDefault()` on `pointerdown`.** A click that moved DOM focus here would blur the input, drop
the highlight's paint gate (`focus.isFocused()`), fire the input's blur-commit, and leave
`aria-activedescendant` naming an option from an element that is no longer focused. React Aria spells
it `preventFocusOnPress: true`.

The click handler still calls `state.triggerElement()?.focus()` first, for the case the
`preventDefault` does not cover: the widget was not focused at all when the button was pressed.

## Opening lands on the selected option

A pointer open uses `focusStrategy: "selected"` — APG, and what a native `<select>` does.
`createComboboxTrigger` does the same, so Select and Combobox enter their lists identically.

## Composition and precedence

`createButton` is composed for the disabled handling and the press engine, so `nativeButton={false}`
switches to `role`/`tabIndex`/`aria-disabled` and synthesized keyboard activation for a `render`
target that is not a real `<button>`. This hook's own `tabIndex: -1` still wins in that mode — the
tab-order exclusion is not negotiable.

Consumer handlers run first in every chain, so a `preventDefault()` in `onClick` cancels the toggle.

## SSR

Nothing here reads the DOM or registers anything, so the server render is the closed button with its
label and `aria-expanded="false"`. `tabindex="-1"` is emitted server-side too — otherwise a page that
has not hydrated yet takes three Tab presses to cross one field.

## Rejected alternatives

### Reusing `createComboboxTrigger` for this button
**Why not:** it would put a second `role="combobox"` — with its own `aria-activedescendant` and the
entire keymap — beside the real one. A screen reader would report two fields, and the keymap on a
`tabindex="-1"` element is unreachable anyway.

### Sharing one hook with [`createComboboxClear`](combobox-clear.md)
**Why not:** the two overlap on exactly the two structural rules above and nothing else. Clearing is
not opening, so `aria-expanded`/`aria-controls`/`aria-haspopup` would have to be conditional — and a
shared hook whose ARIA half is behind a flag is the "one hook, two personalities" shape
`combobox-input.md` rejects for the focus owner. Both files are under a hundred lines and each reads
top to bottom.

### `aria-hidden` on the button instead of a label
**Why not:** it is a real, operable control. Hiding it from the accessibility tree makes it
unreachable by voice control and by a screen reader's own pointer, while leaving it clickable for
everyone else — the worst combination. Every option it offers is duplicated on the input, but "the
keyboard has another way" is not a reason to hide a visible control.

### Letting the button take focus and moving `aria-activedescendant` with it
**Why not:** the APG combobox pattern has exactly one focus owner. Two would mean the highlight's
paint gate, the keymap and the IDREF all have to agree about which element is live, which is state
this family deliberately does not carry.
