# Button

An accessible, themed button. Renders a native `<button>` by default (with `type="button"`, so it
never accidentally submits a form), stays fully accessible when `render`-ed as a different element,
and is styled by the active theme's `button` recipe read through `useRecipe`. Behavior is composed
from the kernel's `createButton` (element-aware a11y) over `createPress` (the unified press engine).

Because it reads styling from the theme, a `Button` must render under a `<ThemeProvider>` (see
`@hope-ui/theming`). A consumer imports the theme's recipe map and the theme CSS:

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hopeRecipes } from "@hope-ui/themes/hope/recipes";
import { Button } from "@hope-ui/components/button";
// and, in your Tailwind entry CSS: @import "@hope-ui/themes/hope";

<ThemeProvider theme={hopeRecipes}>
  <Button variant="solid" color="primary">Save</Button>
</ThemeProvider>;
```

## API

| Prop              | Type                                                              | Default     | Description                                                                                                    |
| ----------------- | ----------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `variant`         | `'default' \| 'solid' \| 'soft' \| 'outline' \| 'ghost' \| 'link'`| `'default'` | Visual style. `default` is the neutral chrome button and ignores `color`.                                      |
| `color`           | `'primary' \| 'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | Semantic role color. Ignored by `default`. Shadows the native HTML `color` attribute (dropped from the spread).|
| `size`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                            | `'md'`      | Density/scale. Heights 28 / 32 / 36 / 40 / 44px.                                                               |
| `nativeButton`    | `boolean`                                                         | `true`      | Set `false` when `render`-ing a non-`<button>` (an `<a>`, a `<div>`). See "Polymorphism".                      |
| `disabled`        | `boolean`                                                         | `false`     | Native `disabled` on a native button; `aria-disabled` + blocked handlers on a non-native element. Grayed chrome.|
| `loading`         | `boolean`                                                         | `false`     | Shows a loader and blocks activation while keeping the enabled look + tab position. Sets `aria-busy`.          |
| `loadingText`     | `JSX.Element`                                                     | —           | Replaces the label while loading (implies an inline `start` loader, so the text stays visible).               |
| `loader`          | `JSX.Element`                                                     | —           | Custom loader content. Defaults to hope's loader (Lucide `loader-circle`).                                     |
| `loaderPlacement` | `'start' \| 'center' \| 'end'`                                    | `'center'`  | `center` overlays the loader and hides the label (width preserved); `start`/`end` place it inline.             |
| `startDecorator`  | `JSX.Element`                                                     | —           | Leading slot (typically an icon), before the label.                                                            |
| `endDecorator`    | `JSX.Element`                                                     | —           | Trailing slot (typically an icon), after the label.                                                            |
| `fullWidth`       | `boolean`                                                         | `false`     | Stretches to the container width.                                                                              |
| `render`          | `(props) => JSX.Element`                                          | —           | Render as a different element/component. The only polymorphism mechanism (there is no `as` prop).              |
| `type`            | `'button' \| 'submit' \| 'reset'`                                | `'button'`  | Native button type. Applied only to a native button.                                                           |
| `class`           | `string`                                                         | —           | Merged over the recipe's root class (via `cn`), so the consumer's utilities win.                               |
| `...rest`         | `Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>`      | —           | Forwarded to the rendered element (`onClick`, `form`, `ref`, `aria-*`, …).                                     |

The rendered root carries `data-slot="button"`; its internal parts follow the component-prefixed
convention `data-slot="button-<part>"` — `button-label`, `button-start-decorator`,
`button-end-decorator`, `button-loader`. It also carries `data-disabled` (empty string) while
`disabled` and `data-pressed` (empty string) while a press is physically active — both emitted by
`createButton` (not hand-wired here) — plus `aria-busy="true"` while `loading`.
`data-disabled`/`data-pressed` are absent on the server and on the initial client render, so they
are hydration-safe. The theme's recipe styles the single `data-disabled:` variant, never a
`disabled:`/`aria-disabled:` pair.

## Variants & color

`solid`/`soft`/`outline`/`ghost`/`link` take a `color` role; `default` is a color-independent neutral
chrome button (shadcn's outline). `solid` paints the role's solid fill (`bg-{role}` / `text-on-{role}`),
`soft` its tonal fill, and `outline`/`ghost`/`link` paint on the surface using the surface-legible
`on-{role}-soft` token so neutral and warning stay readable in both light and dark. All styling comes
from the theme's `button` recipe; the component itself writes no utility classes.

## Polymorphism (`render` + `nativeButton`)

`render` swaps the underlying element while keeping Button's computed props. There is **no `as`
prop** — its polymorphic typing degrades IDE IntelliSense. Because a non-`<button>` element has none
of a native button's built-in behavior, you must tell Button what you rendered via `nativeButton`:

```tsx
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

## Disabled & loading

| State      | Representation                                                              | Tab order              | Activation |
| ---------- | -------------------------------------------------------------------------- | ---------------------- | ---------- |
| `disabled` | native `disabled` (native) / `aria-disabled="true"` (non-native) + `data-disabled` styling hook; grayed | removed                | blocked    |
| `loading`  | `aria-busy="true"` + loader; keeps the enabled look                        | kept (stays focusable) | blocked    |

A disabled `render`-ed `<a>` should also have its `href` dropped by the consumer so navigation is
impossible; click and keyboard activation are blocked regardless. `loading` blocks activation through
the same `preventDefault` cancel channel the disabled guard uses (see `createPress`) — the consumer's
`onClick` never fires while loading — but without disabling the button, so it keeps its color and tab
position. Use `focusableWhenDisabled` (via the kernel `createButton`) when a disabled control must
stay focusable for a tooltip.

## Keyboard interaction

| Element     | Key             | Action                                                                                      |
| ----------- | --------------- | ------------------------------------------------------------------------------------------- |
| Native      | `Enter`/`Space` | Browser-native activation → fires `onClick`. No extra wiring needed.                         |
| Non-native  | `Enter`         | Activates (native for an `<a>`, synthesized otherwise) → fires `onClick`.                     |
| Non-native  | `Space`         | Synthesized activation → fires `onClick`; page scroll is prevented.                          |

Activation is unified through the real `click` event (see `createPress`), so a mouse click, a native
button's Enter/Space, a touch tap, a screen-reader action, and a synthesized keyboard click all fire
`onClick` exactly once — never twice.
