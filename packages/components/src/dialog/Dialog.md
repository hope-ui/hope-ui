# Dialog

A headless, accessible dialog (modal or non-modal). Implements the
[WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
API-inspired by Base UI's Dialog. Composes `createFocusTrap`, `createDismissable`,
`createPresence`, `createScrollLock`, and `createComponentContext` from
`@solid-zero/primitives` — see each primitive's own `.md` for the behavior it
contributes.

Uncontrolled by default (`defaultOpen`); pass `open`/`onOpenChange` to control it.

## Parts

| Part                 | Renders  | Purpose                                                                 |
| -------------------- | -------- | ------------------------------------------------------------------------ |
| `Dialog.Root`        | —        | Owns open state and shares context with the other parts. No DOM output. |
| `Dialog.Trigger`     | `button` | Opens the dialog on click. Wires `aria-haspopup`/`aria-expanded`/`aria-controls`. |
| `Dialog.Portal`      | —        | Portals `Backdrop`/`Popup` to `document.body` (or `mount`). Renders nothing during SSR. |
| `Dialog.Backdrop`    | `div`    | Optional overlay behind the popup. Clicking it dismisses the dialog (it's outside `Popup`, so `createDismissable`'s outside-pointerdown check fires). |
| `Dialog.Popup`       | `div`    | The dialog surface. `role="dialog"`, focus-trapped and dismissable while open. |
| `Dialog.Title`       | `h2`     | Registers its `id` on `Popup`'s `aria-labelledby`. |
| `Dialog.Description` | `p`      | Registers its `id` on `Popup`'s `aria-describedby`. |
| `Dialog.Close`       | `button` | Closes the dialog on click. |

Every part except `Root` accepts a `render` prop for polymorphic rendering (see
`@solid-zero/primitives`'s `renderElement`).

## API

### `Dialog.Root`

| Prop           | Type                        | Default | Description                                                        |
| -------------- | --------------------------- | ------- | -------------------------------------------------------------------- |
| `open`         | `boolean`                   | —       | Controlled open state. Omit for uncontrolled usage via `defaultOpen`. |
| `defaultOpen`  | `boolean`                   | `false` | Initial open state for uncontrolled usage.                          |
| `onOpenChange` | `(open: boolean) => void`   | —       | Called whenever the dialog would open or close.                     |
| `modal`        | `boolean`                   | `true`  | Traps focus, locks page scroll, and sets `aria-modal` when `true`. When `false`, the dialog is still dismissable (Escape/outside click) but doesn't trap focus or block page interaction. |

### `Dialog.Trigger` / `Dialog.Close`

| Prop      | Type                                           | Default  | Description                              |
| --------- | ----------------------------------------------- | -------- | ------------------------------------------ |
| `render`  | `RenderProp<JSX.ButtonHTMLAttributes<...>>`     | —        | Render as a different element/component. |
| `...rest` | `JSX.ButtonHTMLAttributes<HTMLButtonElement>`   | —        | Forwarded to the rendered element.       |

Both default to `type="button"` so they never accidentally submit a form.

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
| `Tab`          | Moves focus to the next focusable descendant of `Popup`; cycles from the last back to the first while `modal` (via `createFocusTrap`). |
| `Shift+Tab`    | Same as `Tab`, reversed direction.                                       |
| `Escape`       | Closes the dialog (via `createDismissable`), then returns focus to whatever had it before opening. |

## ARIA pattern reference

Follows the [WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):

- `Popup` gets `role="dialog"`, `aria-modal="true"` when `modal` (omitted otherwise),
  `aria-labelledby` pointing at `Title`'s `id` (if rendered), and `aria-describedby`
  pointing at `Description`'s `id` (if rendered).
- `Trigger` gets `aria-haspopup="dialog"`, `aria-expanded` reflecting open state, and
  `aria-controls` pointing at `Popup`'s `id`.
- On open, focus moves into `Popup` (`initialFocus`, or the first focusable descendant,
  or the popup itself as a last resort). On close, focus returns to the trigger.

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
