# Button

An accessible button. Renders a native `<button>` by default (with `type="button"`, so it never
accidentally submits a form), and stays fully accessible when `render`-ed as a different element.
Behavior is composed from the kernel's `createButton` (element-aware a11y) over `createPress`
(the unified press engine).

## API

| Prop           | Type                                                        | Default    | Description                                                                                          |
| -------------- | ----------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `nativeButton` | `boolean`                                                   | `true`     | Set `false` when `render`-ing a non-`<button>` (an `<a>`, a `<div>`). See "Polymorphism" below.      |
| `disabled`     | `boolean`                                                   | `false`    | Native `disabled` on a native button; `aria-disabled` + blocked handlers on a non-native element.    |
| `render`       | `(props) => JSX.Element`                                    | —          | Render as a different element/component. The only polymorphism mechanism (there is no `as` prop).    |
| `type`         | `'button' \| 'submit' \| 'reset'`                           | `'button'` | Native button type. Applied only to a native button.                                                 |
| `...rest`      | `JSX.ButtonHTMLAttributes<HTMLButtonElement>`               | —          | Forwarded to the rendered element (`onClick`, `form`, `ref`, `aria-*`, …).                           |

The rendered element also carries `data-pressed` (empty string) while a press is physically active
— absent on the server and on the initial client render, so it is hydration-safe.

## Polymorphism (`render` + `nativeButton`)

`render` swaps the underlying element while keeping Button's computed props. There is **no `as`
prop** — its polymorphic typing degrades IDE IntelliSense. Because a non-`<button>` element has none
of a native button's built-in behavior, you must tell Button what you rendered via `nativeButton`:

```tsx
import { Button } from "@hope-ui/components/button";

// Native button (default).
<Button onClick={() => console.log("clicked")}>Click me</Button>

// Rendered as a link that behaves and announces as a button.
<Button nativeButton={false} render={(p) => <a href="/docs" {...p} />}>
  Link button
</Button>
```

When `nativeButton={false}`, Button applies `role="button"`, `tabIndex={0}`, and synthesizes
keyboard activation. In dev, a mismatch between `nativeButton` and the element actually rendered logs
a warning.

## Disabled

| Element     | Disabled representation                                              | Tab order              |
| ----------- | ------------------------------------------------------------------- | ---------------------- |
| Native      | native `disabled` attribute (no redundant `aria-disabled`)          | removed by the browser |
| Non-native  | `aria-disabled="true"` + blocked click/keyboard handlers            | removed (`tabIndex` dropped) |

A disabled `render`-ed `<a>` should also have its `href` dropped by the consumer so navigation is
impossible; click and keyboard activation are blocked regardless. Use `focusableWhenDisabled` (via
the kernel `createButton`) when a disabled control must stay focusable for a tooltip.

## Keyboard interaction

| Element     | Key            | Action                                                                                       |
| ----------- | -------------- | -------------------------------------------------------------------------------------------- |
| Native      | `Enter`/`Space`| Browser-native activation → fires `onClick`. No extra wiring needed.                          |
| Non-native  | `Enter`        | Activates (native for an `<a>`, synthesized otherwise) → fires `onClick`.                      |
| Non-native  | `Space`        | Synthesized activation → fires `onClick`; page scroll is prevented.                           |

Activation is unified through the real `click` event (see `createPress`), so a mouse click, a native
button's Enter/Space, a touch tap, a screen-reader action, and a synthesized keyboard click all fire
`onClick` exactly once — never twice.
