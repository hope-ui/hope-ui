# Alert

A themeable, accessible status surface — a compound `<div>` with a leading icon, a title, a
description, an optional actions row, and an optional dismiss button. It is **static and
non-interactive** (Badge discipline: no hover/press/focus states); the only behavior is a fully
controllable, animated dismissal. Styling comes from the active preset's `alert` recipe, resolved
through `useSlots` (over `useRecipe`).

Because it reads styling from the preset, an `Alert` must render under a `<ThemeProvider>` (see
`@hope-ui/theming`). A consumer passes the `hope` preset and imports its CSS:

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { Alert } from "@hope-ui/components/alert";
// and, in your Tailwind entry CSS: @import "@hope-ui/presets/hope/tailwind.css";

<ThemeProvider preset={hope}>
  <Alert.Root colorScheme="success" title="Saved" description="Your changes are live." />
</ThemeProvider>;
```

## Anatomy

Alert ships **compound parts** *and* **Root convenience props**. Pass children to control the layout
part-by-part; omit them and Root auto-composes the anatomy from `icon`/`title`/`description`/`closable`.

```tsx
// Convenience (auto-composed)
<Alert.Root colorScheme="danger" title="Payment failed" description="Try another card." closable />

// Compound (explicit)
<Alert.Root colorScheme="danger">
  <Alert.Icon><MyIcon /></Alert.Icon>
  <Alert.Content>
    <Alert.Title>Payment failed</Alert.Title>
    <Alert.Description>Try another card.</Alert.Description>
    <Alert.Actions>
      <button type="button">Retry</button>
    </Alert.Actions>
  </Alert.Content>
  <Alert.Close />
</Alert.Root>
```

| Part                | Element | Notes                                                                                         |
| ------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `Alert.Root`        | `div`   | The styled container + live region. Owns state, variants, and (with no children) auto-compose. |
| `Alert.Icon`        | `span`  | Host wrapper for the leading glyph (`aria-hidden` by default). The glyph is nested inside it.  |
| `Alert.Content`     | `div`   | Column wrapper for the title/description/actions.                                              |
| `Alert.Title`       | `div`   | Registers its id so Root links `aria-labelledby`. Use `render` for a heading element if needed. |
| `Alert.Description` | `p`     | Registers its id so Root links `aria-describedby`.                                             |
| `Alert.Actions`     | `div`   | A row for buttons/links.                                                                       |
| `Alert.Close`       | `button`| Dismisses the alert on click. Renders a [`CloseButton`](../close-button/close-button.md) — a themed, icon-only X, self-labelled from `common.close` (consumer `aria-label` wins). Because it is recipe-styled, it **requires a `<ThemeProvider>`** ancestor. Accepts all `CloseButton` props. |

The rendered root carries `data-slot="alert"` and `data-state` (the presence status: `entered` /
`exiting` / `exited`); parts follow the component-prefixed convention `data-slot="alert-<part>"`.

## `Alert.Root` props

| Prop             | Type                                                                     | Default     | Description                                                                                              |
| ---------------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| `variant`        | `'default' \| 'solid' \| 'soft' \| 'subtle' \| 'outline'`                | `'default'` | Visual style. See "Variants".                                                                           |
| `colorScheme`    | `'primary' \| 'neutral' \| 'success' \| 'info' \| 'warning' \| 'danger'` | `'neutral'` | Semantic role color scheme. Named `colorScheme` (matching Badge/Button), never `status`.                |
| `size`           | `'sm' \| 'md' \| 'lg'`                                                    | `'md'`      | Density/scale.                                                                                          |
| `title`          | `JSX.Element`                                                             | —           | Convenience: auto-composed into `Alert.Title` when Root has no children.                                |
| `description`    | `JSX.Element`                                                             | —           | Convenience: auto-composed into `Alert.Description`.                                                    |
| `icon`           | `JSX.Element \| false`                                                    | —           | Convenience leading glyph. `false` hides it; omitting it falls back to the preset/built-in status glyph. |
| `closable`       | `boolean`                                                                 | `false`     | Convenience: render an `Alert.Close`. Requires a `<ThemeProvider>` ancestor.                            |
| `open`           | `boolean`                                                                 | —           | Controlled open state.                                                                                  |
| `defaultOpen`    | `boolean`                                                                 | `true`      | Initial open state when uncontrolled.                                                                   |
| `onOpenChange`   | `(open: boolean) => void`                                                 | —           | Fires whenever the open state should change (dismiss click, controlled or not).                        |
| `onExitComplete` | `() => void`                                                              | —           | Fires after the exit transition finishes and the alert has unmounted (Ant's `afterClose`).             |
| `role`           | `'alert' \| 'status' \| 'none'`                                           | `'alert'`   | Live-region politeness. See "Accessibility".                                                            |
| `render`         | `(props) => JSX.Element`                                                  | —           | Render as a different element/component. The only polymorphism mechanism (there is no `as` prop).      |
| `class`          | `string`                                                                  | —           | Merged over the recipe's root class (applied last), so the consumer's utilities win.                    |
| `slotClasses`    | `SlotClasses<'alert'>`                                                    | —           | Per-instance class overrides per slot. Use literal classes so Tailwind can scan them.                   |
| `...rest`        | `JSX.HTMLAttributes<HTMLDivElement>`                                      | —           | Forwarded to the rendered element (`id`, `ref`, `aria-*`, …).                                           |

## Variants

| Variant   | Fill / chrome                                              | Role color                                     |
| --------- | --------------------------------------------------------- | ---------------------------------------------- |
| `default` | `bg-surface-raised` + `border-subtle`, **no shadow**       | Only the **icon + title** get `text-{role}-emphasis`; body stays `text-foreground`. |
| `solid`   | `bg-{role}` + `text-on-{role}`                             | Whole surface.                                 |
| `soft`    | `bg-{role}-soft` + `text-{role}-emphasis`                  | Whole surface.                                 |
| `subtle`  | `soft` + `border-{role}-subtle-line`                      | Whole surface.                                 |
| `outline` | transparent + `text-{role}-emphasis` + `border-{role}-subtle-line` | Whole surface.                        |

`default` is the odd one out: it is a role-*neutral* raised card that draws the eye with a colored
icon + title only. The other four are Badge's fills (minus `dot`/`inverted`) applied to the whole
surface.

## Default status icons

For `info`/`success`/`warning`/`danger`, Alert ships a built-in glyph (hand-inlined Lucide paths — no
icon-library dependency). `primary`/`neutral` ship none. Precedence is **instance `icon` ?? preset
`{role}Icon` ?? built-in**:

- **Per usage** — `icon={<MyIcon />}` overrides for one alert; `icon={false}` hides it.
- **App-wide** — a preset sets a role's default glyph via `defaultProps`, as a **factory** (a bare
  node would move if reused). The four keys are flat (`infoIcon`/`successIcon`/`warningIcon`/
  `dangerIcon`) so a partial override leaves the others' built-ins intact:

```tsx
import { definePreset } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";

const themed = definePreset(hope, {
  components: { alert: { defaultProps: { successIcon: () => <CheckCircle /> } } },
});
```

## Dismissal

`Alert.Close` (rendered by `closable`, or placed explicitly) closes the alert. `createControllableState`
supports both uncontrolled (`defaultOpen`) and controlled (`open` + `onOpenChange`) use;
`createPresence` plays the recipe's exit transition (opacity + slide, `motion-reduce`-aware) before
unmounting, then `onExitComplete` fires. The consumer's own `onClick` on `Alert.Close` runs **first**,
so `event.preventDefault()` cancels the close.

## Accessibility

- `role="alert"` (default) is an **assertive** live region — the browser announces it immediately.
  Use it for errors and time-sensitive warnings. `role="status"` is **polite** (announced when the
  user is idle) — use it for success/info that shouldn't interrupt. `role="none"` renders no role
  (a purely visual notice).
- The title and description are linked as `aria-labelledby` / `aria-describedby`. In the auto-compose
  path the link is present in the server HTML; in the compound path the parts register their ids after
  hydration.
- The leading icon is decorative (`aria-hidden`); the accessible name comes from the title/description,
  so keep meaningful text there.
- `Alert.Close` is self-labelled from the localized `common.close` (a consumer `aria-label` wins).
