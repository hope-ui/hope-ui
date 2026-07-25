# `createPopoverTrigger`

The trigger part of the [popover hook family](popover-root.md). Toggles the popover and advertises it
to assistive technology.

```ts
function createPopoverTrigger(
  state: CreatePopoverReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): {
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  setRef: (element: HTMLButtonElement) => void;
};
```

Returns fully-merged button `props`: `type` defaults to `"button"`, `aria-haspopup="dialog"`,
`aria-expanded` reflecting `state.open()`, and `aria-controls` naming `state.popupId()` **only while
open**. The returned `onClick` toggles, composed **behind** the consumer's own `onClick` (via
`composeEventHandlers`), so `event.preventDefault()` cancels it.

## Two deliberate differences from `createDialogTrigger`

### It toggles, where Dialog's only ever opens

Closing a non-modal layer by clicking the control that opened it is the behavior every reference
ships (Radix, Base UI, Ark), and it is only reachable because `createDismissable` can `exclude` the
trigger. Without that exclusion the two halves fight: the capture-phase pointerdown dismisses, then
the trigger's own `click` reopens, and **the popover can never be closed by its own trigger**. Dialog
never hit this because it is modal by default, and its trigger only opens.

So the toggle and `state.dismissExclusions` are one feature spelled in two files. `createPopoverContent`
is the other half — see [`popover-content.md`](popover-content.md).

### It returns a `setRef`

Dialog's trigger registers nothing. Popover's element is load-bearing twice over:

- it is the **default anchor** — `state.anchorElement()` is `customAnchorElement() ?? triggerElement()`,
  so with no `Popover.Anchor` mounted this is what `createFloating` positions against;
- it is the **sole dismiss exclusion** — `state.dismissExclusions()` is `[trigger]`.

Hand `setRef` to the element's `ref`; it registers through `state.setTriggerElement`.

## `aria-haspopup` is `"dialog"` for both roles

`createPopover`'s `role` option takes `"dialog"` or `"alertdialog"`, but ARIA defines **no
`alertdialog` token for `aria-haspopup`** — the legal values are `menu`, `listbox`, `tree`, `grid`,
`dialog`, `true`, `false`. So the trigger advertises `dialog` either way, while the popup itself
carries the real role.

## `aria-controls` is present only while open

`aria-controls` naming an element that isn't in the DOM is an invalid IDREF (axe
`aria-valid-attr-value`), and the popup is mounted lazily, so the attribute is omitted when closed
rather than left dangling. Same rule and same reason as `createDialogTrigger`.

**axe cannot decide this attribute while open, by construction.** `ariaValidAttrValueEvaluate`'s
`aria-controls` pre-check returns *incomplete* for **any** element carrying both `aria-haspopup` and
`aria-controls`, without ever resolving the IDREF — a popup may be added on demand, so it defers to a
human. Since `expectNoA11yViolations` fails on `incomplete` too, a test that runs axe against an
**open** popover passes `allowIncomplete: ["aria-valid-attr-value"]` with that reason at the call
site; the closed assertion runs strict, and the IDREF itself is pinned by a direct assertion.

## Known limit: `defaultOpen` + SSR + a portaled popup

A popover that is **open on the server** and whose popup is inside a `Portal` renders an
`aria-controls` IDREF for an element the server never emitted. The markup is briefly invalid until
hydration mounts the portal.

This is **pre-existing and shared with `createDialogTrigger`** — the same shape, the same cause — so
it is recorded here rather than papered over with an `isServer` import inside a primitive. The
default (`defaultOpen: false`) renders no `aria-controls` at all, which is what the SSR fixture
asserts; only the deliberately-open-on-the-server case is affected. Fixing it properly means the
trigger knowing whether its popup rendered, which is a portal concern, not a trigger one.

## SSR

Attribute computation only — no DOM access, no effects, and no `isServer` branch. The `popupId` it
names comes from `createPopover`'s `createUniqueId` fallback, which is SSR-stable and reserved before
the presence and floating layers so the trigger's `_hk` hydration key does not shift.
