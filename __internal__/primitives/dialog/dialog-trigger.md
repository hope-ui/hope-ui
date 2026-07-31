# `createDialogTrigger`

The trigger part of the [dialog hook family](dialog-root.md). Opens the dialog and
advertises it to assistive technology.

```ts
function createDialogTrigger(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Returns fully-merged button `props`: `type` defaults to `"button"`, `aria-haspopup="dialog"`,
`aria-expanded` reflecting `state.open()`, and `aria-controls` naming `state.popupId()` **only while
open** (a dangling IDREF while closed is an invalid attribute value — axe `aria-valid-attr-value`).
The returned `onClick` opens the dialog, composed **behind** the consumer's own `onClick` (via
`composeEventHandlers`), so `event.preventDefault()` cancels the open. The trigger only ever opens —
never toggles (matching Base UI); close via `createDialogCloseTrigger` or controlled `open`.

## Rejected alternatives

### `aria-controls` emitted unconditionally, as Base UI's `DialogTrigger` does
**Why not:** the content is unmounted while closed, so a persistent IDREF resolves to nothing — which
ARIA defines as an invalid attribute value. Verified against axe-core 4.12: a dangling `aria-controls`
reports `aria-valid-attr-value` (as `incomplete`) whether `aria-expanded` is `"true"` or `"false"`, and
reports nothing once removed. The bug survived because axe only ever ran against the *open* state, so
the corollary is part of the pattern now: a11y checks run against the closed state too (`e518779`).
`plan.md` had recorded the opposite decision on Base UI's authority; it is corrected there.

### Reading raw `props` after `withDefaults`
**Why not:** `withDefaults` copies nothing — it exposes defaults as getters over a *new* object — so
`omit(props, "onClick")` drops the `type="button"` default while `omit(merged, "onClick")` carries it,
and the trigger silently becomes a submit button inside a `<form>`. Nothing catches it: no type error,
and no test failure unless one exercises the prop-omitted path. This file is the reference shape
CLAUDE.md cites for the rule (`74b360d`).

### An `isServer` branch for the `defaultOpen` + SSR + portaled-content IDREF
**Why not:** it puts a rendering-environment check inside a primitive to paper over a portal concern —
the real fix needs the trigger to know whether its content rendered, which the trigger cannot know.
The case is recorded as a known limit instead, shared verbatim with `createPopoverTrigger`; see *Known
limit: `defaultOpen` + SSR + a portaled popup* in [`popover-trigger.md`](../popover/popover-trigger.md).
**Revisit if:** a portal-aware primitive can tell the trigger whether its popup rendered on the server.
