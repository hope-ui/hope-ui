# `createPopoverCloseTrigger`

The close-trigger part of the [popover hook family](popover-root.md). Injects the popover's
close-on-click behavior onto a button — and nothing else.

```ts
function createPopoverCloseTrigger(
  state: CreatePopoverReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Returns merged button `props`: an `onClick` that closes the popover, composed **behind** the
consumer's own (via `composeEventHandlers`) so `event.preventDefault()` cancels it — the mirror of
[`createPopoverTrigger`](popover-trigger.md), whose composed handler *toggles*. Every other prop
passes through unchanged.

## Minimal by design — no label, no `type` default

It sets **no** `aria-label` and **no** `type="button"`. Those defaults live one layer up, in the
`CloseButton` component (over the `createButton` primitive) that `@hope-ui/components`'
`Popover.CloseTrigger` renders, so each default has a single owner and there is no double-ownership
between the hook and the component. A **headless** consumer wiring this onto a bare `<button>`
supplies both itself.

Identical to [`createDialogCloseTrigger`](../dialog/dialog-close-trigger.md), for the same reasons.

## Not the only way to close

A popover closes on Escape, on an outside pointerdown and on focus leaving — all three owned by
`createPopoverContent`'s `createDismissable` — and by clicking the trigger again. This part exists for
an explicit affordance inside the popup, and is opt-in: nothing renders one automatically.

## SSR

Handler composition only — no DOM access, no effects, no `isServer` branch.

## Rejected alternatives

### A `type="button"` and an accessible name defaulted on the hook
**Why not:** both defaults already have an owner one layer up in `CloseButton`, so spelling them here
gives one default two owners that can disagree — and the name is the localized `common.close` message,
which would put an `@hope-ui/i18n` lookup inside a hook family that otherwise takes no locale. A headless
consumer wiring this onto a bare `<button>` supplies both itself.
