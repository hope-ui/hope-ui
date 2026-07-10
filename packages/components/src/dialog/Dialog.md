# Dialog

A headless, accessible dialog (modal or non-modal). Implements the
[WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
API-inspired by Base UI's Dialog. Composes `createControllableState`, `createFocusRestore`,
`createFocusTrap`, `createHideOutside`, `createRegisteredElement`, `createDismissable`, `createPresence`,
`createScrollLock`, `createRegisteredId`, `composeEventHandlers` and
`createComponentContext` from `@solid-zero/primitives` — see each primitive's own `.md` for
the behavior it contributes. Dialog owns none of them.

Uncontrolled by default (`defaultOpen`); pass `open`/`onOpenChange` to control it.

## Parts

| Part                 | Renders  | Purpose                                                                 |
| -------------------- | -------- | ------------------------------------------------------------------------ |
| `Dialog.Root`        | —        | Owns open state and shares context with the other parts. No DOM output. |
| `Dialog.Trigger`     | `button` | Opens the dialog on click. Wires `aria-haspopup`/`aria-expanded`/`aria-controls`. |
| `Dialog.Portal`      | —        | Portals `Backdrop`/`Popup` to `document.body` (or `mount`). Renders the internal pointer-blocking backdrop when `modal`. Renders nothing during SSR. |
| `Dialog.Backdrop`    | `div`    | Optional *visible* overlay behind the popup. Clicking it dismisses the dialog (it's outside `Popup`, so `createDismissable`'s outside-pointerdown check fires). Not what makes a modal dialog inert — see "Modality". |
| `Dialog.Popup`       | `div`    | The dialog surface. `role="dialog"`, dismissable while open, focus-trapped while `modal`. |
| `Dialog.Title`       | `h2`     | Registers its `id` on `Popup`'s `aria-labelledby`. |
| `Dialog.Description` | `p`      | Registers its `id` on `Popup`'s `aria-describedby`. |
| `Dialog.Close`       | `button` | Closes the dialog on click. |

Every part except `Root` accepts a `render` prop for polymorphic rendering (see
`@solid-zero/primitives`'s `renderElement`).

## Modality

`modal` (the default) means four mechanisms, because no single one covers every input channel:

| Channel | Mechanism | Where |
| ------- | --------- | ----- |
| Assistive technology | `aria-modal="true"` **and** `createHideOutside`'s `aria-hidden` | `Popup` |
| Focus order | `createHideOutside`'s `inert` | `Popup` |
| Tab cycling inside the popup | `createFocusTrap` | `Popup` |
| Pointer, unconditionally | `ModalBackdrop` — always present, invisible | `Portal` |

`aria-modal` alone is not enough (long-standing VoiceOver/Safari gaps), which is why React
Aria ships `ariaHideOutside` and Base UI ships floating-ui's `markOthers`. `aria-hidden` alone
leaves the background focusable and clickable. `inert` fixes both of those — but only on the
elements the layer actually marked, so `ModalBackdrop` covers the viewport unconditionally as
a backstop. And `inert` does not remove content from the accessibility tree as far as ARIA
tooling is concerned, so `aria-hidden` isn't redundant either. See `hide-outside.md` for the
measurements.

`Dialog.Backdrop` is optional and purely visual; it is **not** what makes a modal dialog
inert. Both it and `ModalBackdrop` are *spared* from `inert` — an inert element is transparent
to hit testing, so a backdrop that hid itself would stop blocking anything.

All four live in `@solid-zero/primitives`, so a future modal Popover or Select composes the
same four rather than reimplementing them.

With `modal={false}`, none of them apply: the page behind stays interactive and focusable,
scroll stays unlocked, `aria-modal` is absent, and nothing is hidden from assistive technology.
The dialog is still dismissable, and it still restores focus.

All modal behavior is gated on `open()`, not on `Popup`'s presence. If your popup has an exit
transition, the page becomes interactive again when `open` flips false, rather than when the
transition finishes.

### A modal `Dialog.Popup` must be positioned

`ModalBackdrop` is `position: fixed`. CSS paints positioned elements above non-positioned
ones regardless of DOM order, so a `position: static` popup lands *underneath* it and its own
buttons stop responding to the mouse. Give the popup `position: fixed` (or
`absolute`/`relative`) — which every real dialog does anyway. The
`Modal with an unpositioned Popup` story demonstrates the failure mode on purpose.

The same has always been true of a `position: fixed` `Dialog.Backdrop`; with `modal` there is
now always a fixed backdrop, whether or not you render one.

`ModalBackdrop` is the Portal's first child, so a `Dialog.Backdrop` you render stays above it
and keeps its hover styles, transitions and pointer handlers.

### `Dialog.Backdrop`'s `onClick` never fires

`createDismissable` closes the dialog from a **capture-phase `pointerdown`**, which unmounts
the backdrop before the browser ever dispatches `click`. Use `onPointerDown` if you need a
handler on the backdrop itself, or `onOpenChange` on `Root` to observe the dismissal. This is
independent of `ModalBackdrop` — it has always been the case.

## API

### `Dialog.Root`

| Prop           | Type                        | Default | Description                                                        |
| -------------- | --------------------------- | ------- | -------------------------------------------------------------------- |
| `open`         | `boolean`                   | —       | Controlled open state. Omit for uncontrolled usage via `defaultOpen`. |
| `defaultOpen`  | `boolean`                   | `false` | Initial open state for uncontrolled usage.                          |
| `onOpenChange` | `(open: boolean) => void`   | —       | Called whenever the dialog would open or close.                     |
| `modal`        | `boolean`                   | `true`  | Traps focus, locks page scroll, sets `aria-modal`, hides the page behind from assistive technology, and blocks pointer interaction with it. When `false`, the dialog is still dismissable (Escape/outside click) and still restores focus, but the page behind stays fully interactive. See "Modality". |

### `Dialog.Trigger` / `Dialog.Close`

| Prop      | Type                                           | Default  | Description                              |
| --------- | ----------------------------------------------- | -------- | ------------------------------------------ |
| `render`  | `RenderProp<JSX.ButtonHTMLAttributes<...>>`     | —        | Render as a different element/component. |
| `...rest` | `JSX.ButtonHTMLAttributes<HTMLButtonElement>`   | —        | Forwarded to the rendered element.       |

Both default to `type="button"` so they never accidentally submit a form.

`Trigger` only ever **opens** the dialog — it never toggles (matching Base UI). Close it with
`Dialog.Close`, Escape, an outside click, or a controlled `open`.

Your `onClick` runs **before** the component's own handler, and `event.preventDefault()`
cancels it (via `composeEventHandlers`). On a `<button type="button">` `preventDefault()` has
no other effect, so it's an unambiguous cancel channel:

```tsx
<Dialog.Trigger onClick={(event) => hasUnsavedChanges && event.preventDefault()}>
  Open
</Dialog.Trigger>
```

`Dialog.Close` works the same way, cancelling the close.

### `Dialog.Portal`

| Prop    | Type      | Default             | Description                     |
| ------- | --------- | -------------------- | -------------------------------- |
| `mount` | `Element` | `document.body`      | Where to portal `Backdrop`/`Popup`. |

### `Dialog.Backdrop` / `Dialog.Popup`

| Prop           | Type                                      | Default | Description                                                        |
| -------------- | ------------------------------------------ | ------- | -------------------------------------------------------------------- |
| `render`       | `RenderProp<JSX.HTMLAttributes<...>>`     | —       | Render as a different element/component.                            |
| `initialFocus` | `() => HTMLElement \| null \| undefined`   | —       | (`Popup` only) Explicit element to focus on open, instead of the first focusable descendant. |
| `...rest`      | `JSX.HTMLAttributes<HTMLDivElement>`      | —       | Forwarded to the rendered element.                                   |

Both expose their `createPresence` status as a `data-status` attribute
(`"entering" | "entered" | "exiting" | "exited"`) for CSS transitions.

#### Prop precedence

A prop you pass wins over the value the component would compute, except where the computed
value is the whole point:

| Prop on `Popup`    | Precedence                                                                |
| ------------------ | --------------------------------------------------------------------------- |
| `id`               | Yours. `Popup` registers it with `Root`, so `Trigger`'s `aria-controls` points at it. |
| `role`             | Yours — this is how you reach the APG **alertdialog** pattern (`role="alertdialog"`). |
| `aria-labelledby`  | Yours; otherwise `Dialog.Title`'s `id`, if a Title is rendered.            |
| `aria-describedby` | Yours; otherwise `Dialog.Description`'s `id`.                              |
| `aria-modal`       | Component-owned. Derived from `Root`'s `modal`, and must be *absent* on a non-modal dialog. |
| `data-status`      | Component-owned. Derived from `createPresence`.                            |
| `ref`              | Merged with the component's internal ref — both fire.                      |

`Backdrop` follows the same rule: `role` defaults to `"presentation"`, and yours wins.

A dialog with neither a `Dialog.Title`, an `aria-labelledby`, nor an `aria-label` has no
accessible name. That's an authoring error the component deliberately doesn't paper over.

### `Dialog.Title` / `Dialog.Description`

| Prop      | Type                                                                        | Default | Description                    |
| --------- | ---------------------------------------------------------------------------- | ------- | --------------------------------- |
| `render`  | `RenderProp<JSX.HTMLAttributes<HTMLHeadingElement \| HTMLParagraphElement>>` | —       | Render as a different element/component. |
| `id`      | `string`                                                                    | auto-generated (`createUniqueId`) | Also used to link `Popup`'s `aria-labelledby`/`aria-describedby`. |
| `...rest` | `JSX.HTMLAttributes<...>`                                                   | —       | Forwarded to the rendered element. |

## Keyboard interaction

| Key            | Action                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| `Enter`/`Space` on Trigger | Opens the dialog (native `<button>` activation).             |
| `Tab`          | Moves focus to the next focusable descendant of `Popup`; cycles from the last back to the first **while `modal`** (via `createFocusTrap`). With `modal={false}`, `Tab` leaves the popup like any other content. |
| `Shift+Tab`    | Same as `Tab`, reversed direction.                                       |
| `Escape`       | Closes the dialog (via `createDismissable`), then returns focus to whatever had it before opening — **whether or not the dialog is modal** (via `createFocusRestore`). |

Focus restore is gated on `open()` alone; the focus *trap* is gated on `open() && modal()`.
They're separate primitives precisely so a non-modal dialog still hands focus back. Restore
is skipped when the remembered element has left the document, or when nothing had focus.

## ARIA pattern reference

Follows the [WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

- `Popup` gets `role="dialog"`, `aria-modal="true"` when `modal` (omitted otherwise),
  `aria-labelledby` pointing at `Title`'s `id` (if rendered), and `aria-describedby`
  pointing at `Description`'s `id` (if rendered).
- `Trigger` gets `aria-haspopup="dialog"`, `aria-expanded` reflecting open state, and —
  **only while open** — `aria-controls` pointing at `Popup`'s `id`.

  `Popup` is unmounted while closed, so a persistent `aria-controls` would be an IDREF
  resolving to nothing, which ARIA defines as an invalid attribute value (axe reports
  `aria-valid-attr-value`). Base UI emits it unconditionally; this is the one place Dialog
  deliberately diverges from it. `Popup` still registers a consumer-pinned `id` with `Root`
  on mount, so the first `aria-controls` emitted on open already names the right element.
- While `modal`, everything outside `Popup` gets `aria-hidden="true"` — including `Trigger`.
  A role-based query (`getByRole`, and any screen reader) correctly stops seeing them.
- On open, focus moves into `Popup` while `modal` (`initialFocus`, or the first focusable
  descendant, or the popup itself as a last resort). On close, focus returns to the trigger,
  modal or not.

### axe-core reports one `incomplete`, by design

While a modal dialog is open, the background is `aria-hidden` but still focusable — the focus
trap, not `inert`, is what keeps the keyboard out. axe-core's `aria-hidden-focus` rule can't
know that, so it resolves to **incomplete** rather than a violation (its `focusable-modal-open`
check recognizes the open modal and declines to judge). `expectNoA11yViolations` reads
`violations` only, so this is expected and green.

## SSR

`Dialog.Portal` renders `null` server-side — `@solidjs/web`'s `Portal` throws on the
server rather than degrading gracefully, so this is a manual `isServer` guard rather than
a primitive's own concern. Everything else renders normally during SSR (`Trigger`'s
`aria-expanded` reflects the initial `open`/`defaultOpen` state). See
`Dialog.test.tsx` for the SSR round-trip test (`renderToStringAsync` under the real
"node" build of `@solidjs/web` — not simulated); a full in-browser hydration round-trip
test is a known gap, deliberately `it.skip`'d in `Dialog.browser.test.tsx` — see
`docs/session-handoff-dialog.md` for the investigation and options.

## Example

```tsx
import { Dialog } from "@solid-zero/components/dialog";

<Dialog.Root>
  <Dialog.Trigger>Open dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Dialog title</Dialog.Title>
      <Dialog.Description>Dialog description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>;
```

Controlled:

```tsx
const [open, setOpen] = createSignal(false);

<Dialog.Root open={open()} onOpenChange={setOpen}>
  ...
</Dialog.Root>;
```
