# Button

A headless button. Renders a native `<button>` by default, with `type="button"` so it
never accidentally submits a form. Supports the shared `render` prop for polymorphic
rendering (e.g. as a link that looks like a button).

## API

| Prop       | Type                                                          | Default    | Description                                   |
| ---------- | -------------------------------------------------------------| ---------- | ---------------------------------------------- |
| `disabled` | `boolean`                                                     | `false`    | Sets `disabled` and `aria-disabled` together. |
| `render`   | `JSX.Element \| ((props) => JSX.Element)`                     | —          | Render as a different element/component.      |
| `...rest`  | `JSX.ButtonHTMLAttributes<HTMLButtonElement>`                 | —          | Forwarded to the rendered element.            |

## Keyboard interaction

| Key             | Action                          |
| --------------- | -------------------------------- |
| `Enter`/`Space`  | Native `<button>` activation (no extra wiring needed — this is why Button doesn't need a keyboard primitive from the behavior kernel). |

## Example

```tsx
import { Button } from "@enara-ui/button";

<Button onClick={() => console.log("clicked")}>Click me</Button>

<Button render={(p) => <a href="/docs" {...p} />}>Link styled as a button</Button>
```
