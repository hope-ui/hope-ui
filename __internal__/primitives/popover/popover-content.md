# `createPopoverContent`

The content part of the [popover hook family](popover-root.md) — the popup surface, and the behavior
hub.

```ts
function createPopoverContent(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    // Element to focus on open, instead of the first focusable descendant. A control prop, not an
    // attribute: it's read by this part's autofocus and dropped from the spread onto the surface.
    initialFocus?: Accessor<HTMLElement | null | undefined>;
  },
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-presence": PresenceStatus;
    "data-side": Side;
    "data-align": FloatingAlign;
  };
  mounted: Accessor<boolean>;                 // gate the content's render on this
  setRef: (element: HTMLDivElement) => void;  // registers the element on `state`
};
```

## Keyboard interaction

| Key | Result |
| --- | --- |
| <kbd>Escape</kbd> | Closes the popover, and focus returns to the trigger. Suppressed by `closeOnEscape: false`. |
| <kbd>Tab</kbd> | Moves through the popup's focusable content, then **out of it** — Tab is not trapped. Focus landing outside closes the popover (`closeOnFocusOutside`, default `true`). |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | The same, backwards — with one exception: landing on the **trigger** keeps the layer open, because the trigger is dismiss-excluded. |

On open, focus moves into the popup: `initialFocus` if given, else the first focusable descendant,
else the container itself under a temporary `tabindex="-1"`. On close it returns to whatever was
focused before.

## ARIA pattern

`role="dialog"` (or `"alertdialog"`), from `createPopover`'s `role` option — a non-modal
[dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), named by its own Title and
described by its own Description.

| Attribute | Value |
| --- | --- |
| `role` | `props.role ?? state.role()` |
| `id` | `props.id ?? state.popupId()` |
| `aria-labelledby` | `props["aria-labelledby"] ?? state.titleId()` |
| `aria-describedby` | `props["aria-describedby"] ?? state.descriptionId()` |
| `aria-modal` | **absent, always** |
| `data-presence` / `data-side` / `data-align` | state-derived, owned here |

Internal values **fall back** to the consumer's rather than overwriting them. `merge` gives the last
source precedence and treats a getter returning `undefined` as a real value, so a bare
`get "aria-labelledby"()` would erase a consumer's own value whenever no Title is mounted — stripping
the accessible name. `role="dialog"` with no accessible name is an axe `aria-dialog-name` violation,
so every test tree and story carries a Title or an `aria-label`.

**There is no `aria-modal`, and its absence is deliberate** — not `"false"`. This layer is non-modal:
it never traps focus, locks scroll, hides the page from assistive technology or blocks the pointer.
`aria-modal="false"` would describe a dialog that *chose* not to be modal; absence describes one that
never was.

## Reflects the shared presence; does not create one

`createPopover` owns the single shared overlay presence (`state.contentPresence`) eagerly; this hook
*mirrors* it — `mounted` and `data-presence` come straight from it, and `setRef` registers the
element on `state.setContentElement` so that presence can time its exit off it. Creating a presence
*here* would break the enter animation: this part is mounted lazily on open, so a presence created
here would see `present` already `true` on its first run and latch straight to `entered`. The
Positioner consumes the same one. See [`popover-root.md`](popover-root.md) and
[`create-presence.md`](../internal/create-presence.md).

## The effect stack, in creation order

```ts
createFocusRestore({ active: state.open });
createAutoFocus({ active: () => state.open() && state.floating.isPositioned(), ref, initialFocus });
createDismissable({ active: state.open, ref, exclude: state.dismissExclusions, … });
createRegisteredId({ id: () => props.id, register: state.setPopupId });
```

All four are created in **this hook's** scope (the content's), so each tears down when the content
unmounts. `ref` is `state.contentElement` — the signal, never a local: the content is conditionally
rendered by the very signal these effects key on, which is the recorded ref hazard
([`create-auto-focus.ts`](../internal/create-auto-focus.md)).

**The order is load-bearing, not stylistic.**

1. **`createFocusRestore` first**, so its `document.activeElement` snapshot is taken before anything
   below moves focus. Sibling effects run in creation order; this is the constraint
   [`create-focus-restore.md`](../internal/create-focus-restore.md) states, and the one
   `dialog-content.ts` follows for the same reason.
2. **`createAutoFocus` before `createDismissable`.** `.focus()` dispatches `focusin` **synchronously**,
   and focus-out now dismisses — so on a reopen that finds the layer still positioned, the focus lands
   before the dismissable effect attaches its document listener, and the layer cannot dismiss itself
   on the way in.

### Autofocus is gated on `isPositioned`, not on `open` alone

Until the first measurement lands, `floating.floatingStyles()` serves its pre-positioned branch —
`{ position, left: 0, top: 0, visibility: "hidden" }` — and **an element inside a
`visibility: hidden` subtree is not focusable**. `.focus()` on it is a silent no-op: no error, no
warning, focus simply stays on the trigger. Keyed on `open` alone the autofocus effect fires inside
that window, loses the focus, and never re-runs, because its dependencies never change again.
Verified against the installed Chromium.

Base UI avoids the same trap from the other side, pre-positioning with `opacity: 0` at
`position: fixed` rather than hiding — `useAnchorPositioning.ts` says so by name ("Default to `fixed`
when not positioned to prevent `autoFocus` scroll jumps"). hope-ui's kernel chose `visibility` over
`opacity` deliberately, because an `opacity: 0` layer stays hit-testable
([`create-floating.ts`](../internal/create-floating.md)), so the gate lives here instead.

Focus therefore arrives once the layer is *measured*, which is what the supported assembly gives it:
a Positioner around the content, and an anchor (a Trigger, or an `Popover.Anchor`). Popover's parts,
like Dialog's, are only supported in their intended assembly.

This also splits the two guards against the layer dismissing itself on open across two paths, and
both are needed:

| Path | Guard |
| --- | --- |
| Cold open (not yet measured) | Autofocus runs *after* the dismissable listener attaches, so the listener's own `container.contains(target)` early return is what holds. |
| Reopen while still positioned | Both fire in the same flush, and creation order puts the `.focus()` before the attach. |

## The three dismissal toggles come from the root

`dismissOnEscape` / `dismissOnOutsidePointerDown` / `dismissOnFocusOutside` are forwarded from
`state.closeOnEscape()` / `state.closeOnInteractOutside()` / `state.closeOnFocusOutside()`, so a
consumer sets them **once** on `createPopover` / `Popover.Root`. They are forwarded as **getters**,
not one-time reads: `createDismissable` reads them live inside its keydown/pointerdown/focusin
handlers, so a getter keeps them reactive (and avoids a `STRICT_READ_UNTRACKED` read in this body).

`closeOnFocusOutside` defaults `true` **on Popover**, while the kernel option defaults `false` — see
[`popover-root.md`](popover-root.md).

## `exclude` is what makes a toggling trigger possible

`exclude: state.dismissExclusions` — `[trigger]`, and nothing else. Without it, a pointerdown on the
trigger dismisses in the capture phase and the trigger's own `click` reopens, so **the popover could
never be closed by the control that opened it**. `createPopoverTrigger` toggles precisely because
this is wired; the two are one feature spelled in two files.

It governs the focus half too: Shift+Tab back onto the trigger keeps the layer open and
`aria-expanded` truthful, while a *click* on it still toggles closed. A `Popover.Anchor` is
deliberately **not** excluded — [`popover-root.md`](popover-root.md) § *Why a `Popover.Anchor` is
deliberately not excluded*.

## `initialFocus` and `id`

`initialFocus` is a **control prop**, read lazily by the autofocus at focus time (after mount, so the
target may live inside the content) and dropped from the spread onto the surface. It belongs here,
not on `createPopover`: this part owns the autofocus effect and nothing else in the family reads it.

A consumer-supplied `props.id` is published up via `createRegisteredId`, so the trigger's
`aria-controls` names the element that actually exists rather than the generated fallback.
`createRegisteredId` defers the write past Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban, and
running it here scopes its cleanup to the content's unmount.

## SSR

Every effect is client-only by construction — `createFocusRestore`, `createAutoFocus` and
`createDismissable` reach the DOM from effect bodies alone, and `createRegisteredId` uses `onSettled`,
which never runs on the server. So nothing here needs an `isServer` branch. Because
`createRegisteredId` does not run server-side, a consumer `id` is not registered during SSR; the
server-visible value is `createPopover`'s generated `popupId` fallback.
