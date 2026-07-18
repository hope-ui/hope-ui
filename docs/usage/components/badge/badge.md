# Badge

A themeable, static inline label — a styled `<span>` for statuses, counts, and tags. It is
**non-interactive** by design (no focus, keyboard, or press behavior); for a closable/keyboard-nav
tag see the future `Tag`, and for a notification overlay see the future `Indicator`. Styling comes
from the active preset's `badge` recipe, resolved through `useSlots` (over `useRecipe`).

Because it reads styling from the preset, a `Badge` must render under a `<ThemeProvider>` (see
`@hope-ui/theming`). A consumer passes the `hope` preset and imports its CSS:

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { Badge } from "@hope-ui/components/badge";
// and, in your Tailwind entry CSS: @import "@hope-ui/presets/hope/tailwind.css";

<ThemeProvider preset={hope}>
  <Badge variant="soft" colorScheme="success">Active</Badge>
</ThemeProvider>;
```

## API

| Prop             | Type                                                                        | Default     | Description                                                                                                    |
| ---------------- | --------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `variant`        | `'solid' \| 'inverted' \| 'soft' \| 'subtle' \| 'outline' \| 'dot'`         | `'soft'`    | Visual style. Every variant honors `colorScheme`. See "Variants".                                              |
| `colorScheme`    | `'primary' \| 'neutral' \| 'success' \| 'info' \| 'warning' \| 'danger'`    | `'neutral'` | Semantic role color scheme. Named `colorScheme` (not `color`) so it never shadows the native HTML `color` attribute, which passes through `...rest` untouched. |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg'`                                              | `'sm'`      | Density/scale.                                                                                                  |
| `shape`          | `'sharp' \| 'rounded' \| 'pill' \| 'circle'`                               | `'rounded'` | Corner treatment. `circle` squares the aspect and drops horizontal padding (for a single glyph/count).         |
| `fullWidth`      | `boolean`                                                                    | `false`     | Stretches to the container width.                                                                              |
| `startDecorator` | `JSX.Element`                                                                | —           | Leading slot (typically an icon), before the label.                                                            |
| `endDecorator`   | `JSX.Element`                                                                | —           | Trailing slot (typically an icon), after the label.                                                            |
| `render`         | `(props) => JSX.Element`                                                     | —           | Render as a different element/component (e.g. an `<a>` for a linkable tag). The only polymorphism mechanism (there is no `as` prop). |
| `class`          | `string`                                                                    | —           | Merged over the recipe's root class (applied last), so the consumer's utilities win.                           |
| `slotClasses`    | `SlotClasses<'badge'>` (`{ root?, label?, startDecorator?, endDecorator?, dot? }`) | —     | Per-instance class overrides per slot. Folded in after the recipe base and the preset's global `slotClasses`, before `class` (root only). Use literal classes so Tailwind can scan them. |
| `children`       | `JSX.Element`                                                                | —           | The badge label.                                                                                              |
| `...rest`        | `JSX.HTMLAttributes<HTMLSpanElement>`                                        | —           | Forwarded to the rendered element (`id`, `title`, `ref`, `aria-*`, the native `color`, …).                     |

The rendered root carries `data-slot="badge"`; its internal parts follow the component-prefixed
convention `data-slot="badge-<part>"` — `badge-dot` (dot variant only), `badge-start-decorator`,
`badge-label`, `badge-end-decorator`. Each part is `<Show>`-gated, so an empty part contributes no
node. Badge writes no state `data-*`/`aria-*` attributes of its own — it is static.

## Variants

| Variant    | Fill              | Text                   | Border                        | Notes                                        |
| ---------- | ----------------- | ---------------------- | ----------------------------- | -------------------------------------------- |
| `solid`    | `bg-{role}`       | `text-on-{role}`       | —                             | The role's solid fill.                       |
| `inverted` | `bg-on-{role}`    | `text-{role}`          | —                             | The literal swap of `solid` (see below).     |
| `soft`     | `bg-{role}-soft`  | `text-{role}-emphasis` | —                             | Tonal fill.                                  |
| `subtle`   | `bg-{role}-soft`  | `text-{role}-emphasis` | `border-{role}-subtle-line`   | `soft` plus a soft role border.              |
| `outline`  | transparent       | `text-{role}-emphasis` | `border-{role}-subtle-line`   | Border-only.                                 |
| `dot`      | transparent       | `text-foreground`      | `border-neutral-subtle-line`  | Neutral chrome + a role-colored status dot.  |

The `soft`/`subtle`/`outline` label is `text-{role}-emphasis` — the role's legible *content* color —
so neutral and warning stay readable in both light and dark. `dot` is a **variant**, not a separate
prop: it renders neutral chrome with the role color moved onto the `badge-dot` slot.

### `inverted` — the honest swap

`inverted` is exactly the `solid` pair with fill and text exchanged: the on-color becomes the fill
(`bg-on-{role}`) and the role color becomes the text (`text-{role}`). This needs **no new token** and
is legible by construction — `solid`'s contrast is symmetric, so swapping the two keeps it. Because
`warning` is a light-fill role (its `on-warning` is dark), `warning` honestly inverts to a **dark
chip** with amber text — the documented consequence of a symmetric swap, not a special case. Use
`inverted` on a solid, colored surface where a `solid` chip would disappear.

## Polymorphism (`render`)

`render` swaps the underlying element while keeping Badge's computed props (class, `data-slot`,
forwarded attributes). There is **no `as` prop** — its polymorphic typing degrades IDE IntelliSense.
A common use is a linkable tag:

```tsx
<Badge variant="soft" render={(p) => <a href="/tags/new" {...p} />}>Linkable</Badge>
```

## Accessibility

Badge is a decorative, static label with no interactive semantics, so there is **no ARIA pattern,
role, or keyboard interaction** to implement — it is a plain `<span>` with text. Two consequences
worth noting:

- The `dot` variant's dot is purely decorative and carries `aria-hidden="true"`; the accessible name
  comes from the label text, so keep meaningful text in `children` (a color alone is not an
  accessible status).
- When a badge conveys status that isn't obvious from its text (e.g. a count that means "unread"),
  give it an `aria-label` via `...rest`, or pair it with adjacent text.
