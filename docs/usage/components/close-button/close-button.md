# CloseButton

A themeable, accessible **close affordance** — an always-icon-only `<button>` that ships a built-in X
glyph and self-labels. It is the reusable close leaf every dismissible surface renders: `Dialog.Close`
today, and the future `Popover`/`Sheet`/`Alert` close parts. Behavior comes from the `createButton`
primitive (element-aware a11y, disabled-gating, the press engine); styling comes from the active
preset's `closeButton` recipe, resolved through `useSlots` (over `useRecipe`).

Because it reads styling from the preset, a `CloseButton` must render under a `<ThemeProvider>` (see
`@hope-ui/theming`):

```tsx
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { CloseButton } from "@hope-ui/components/close-button";
// and, in your Tailwind entry CSS: @import "@hope-ui/presets/hope/tailwind.css";

<ThemeProvider preset={hope}>
  <CloseButton onClick={() => setOpen(false)} />
</ThemeProvider>;
```

## Surface-adaptive by design — no `variant`, no `colorScheme`

CloseButton's defining decision: a close affordance must **never assert its own semantic color** — it
defers to whatever surface it sits on. So — unlike `Button` and `Badge` — it has **no `variant` and no
`colorScheme`** axis. Instead:

- the glyph inherits **`currentColor`** (the recipe sets no text-color class), and
- the hover/press wash and focus ring are **derived from `currentColor`** — finished tokens the preset
  authors (`--hope-close-overlay-hovered` / `-pressed`, `--hope-close-focus`, all
  `color-mix(in oklab, currentColor …%, transparent)`), surfaced as `bg-close-overlay-hovered` /
  `bg-close-overlay-pressed` / `ring-close-focus`.

The result: one component reads correctly on light, soft-tinted, solid-colored, and dark surfaces with
zero configuration, in both light and dark themes (there is deliberately no `.dark` counterpart for
the wash tokens — `currentColor` already flips per surface). The recipe still computes no color —
the `color-mix` lives in the preset's `tokens.css`, so it stays recipe-pure.

## API

| Prop           | Type                                     | Default  | Description                                                                                                          |
| -------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `size`         | `'sm' \| 'md' \| 'lg'`                   | `'sm'`   | Density/scale — a compact corner affordance. Scales the box and the glyph together.                                |
| `icon`         | `JSX.Element \| (() => JSX.Element)`      | built-in X | Overrides the built-in Lucide `x`. A factory form is what a preset supplies as an app-wide `defaultProps.icon` (reuse-safe; resolved via `runIfFunction`). |
| `disabled`     | `boolean`                                | `false`  | Disables the button. Native `<button>` uses the `disabled` attribute; a non-native element uses `aria-disabled` + blocked handlers. Dimmed via `opacity-disabled`. |
| `nativeButton` | `boolean`                                | `true`   | Set `false` when `render`-ing a non-`<button>` (an `<a>`, a `<div>`): switches to `role="button"` + `tabIndex` + `aria-disabled` and synthesizes keyboard activation. Per-usage, not a themeable default. |
| `render`       | `(props) => JSX.Element`                 | —        | Render as a different element/component while keeping CloseButton's computed props. The only polymorphism mechanism (there is no `as` prop). |
| `class`        | `string`                                 | —        | Merged over the recipe's root class (applied last), so the consumer's utilities win.                               |
| `slotClasses`  | `SlotClasses<'closeButton'>` (`{ root?, icon? }`) | — | Per-instance class overrides per slot. Folded in after the recipe base and the preset's global `slotClasses`, before `class` (root only). Use literal classes so Tailwind can scan them. |
| `aria-label`   | `string`                                 | `common.close` | Accessible name. Defaults to the localized `common.close` message; a consumer `aria-label` (or `aria-labelledby`) wins. |
| `...rest`      | `JSX.ButtonHTMLAttributes<HTMLButtonElement>` | —   | Forwarded to the rendered element (`onClick`, `ref`, `id`, `aria-*`, …). `type` is forced to `"button"`.           |

The rendered root carries `data-slot="close-button"`; the glyph is wrapped in a host `<span
data-slot="close-button-icon">`. That wrapper is not cosmetic: it keeps the hydration-keyed
`<button>`'s first child a host element (never a component), which the SSR → hydration round-trip
depends on. `data-disabled` / `data-pressed` are emitted by `createButton`.

## The glyph (`icon`)

CloseButton ships a hand-inlined Lucide `x` (hope has no icon-library dependency). Override it per
instance with a bare element, or app-wide via a preset's `defaultProps.icon` **factory**:

```tsx
// per instance
<CloseButton aria-label="Remove" icon={<TrashIcon />} />

// app-wide default (factory — a single shared node would move between instances)
definePreset(hope, {
  components: { closeButton: { defaultProps: { icon: () => <XCircleIcon /> } } },
});
```

## Polymorphism (`render`)

`render` swaps the underlying element while keeping CloseButton's computed props (class, `aria-label`,
`data-slot`, forwarded attributes). There is **no `as` prop**. When rendering a non-`<button>`, pass
`nativeButton={false}` so the accessibility model switches to `role="button"`:

```tsx
<CloseButton nativeButton={false} render={(p) => <a href="#" {...p} />} />
```

## Accessibility

- **Name.** An icon-only button has no visible text, so CloseButton always sets an `aria-label` — the
  localized `common.close` message by default. It therefore can never be nameless (no dev-time guard is
  needed, unlike `Button`'s icon-only warning). A consumer `aria-label`/`aria-labelledby` wins.
- **Glyph.** The `<svg>` is `aria-hidden` and decorative; the accessible name comes from the label.
- **Keyboard.** A native `<button>` activates on <kbd>Enter</kbd>/<kbd>Space</kbd>. A non-native
  render target (`nativeButton={false}`) gets synthesized keyboard activation via `createButton`.
- **Focus.** The focus ring is `:focus-visible` only (keyboard focus), via the `currentColor`-derived
  `ring-close-focus` token — legible on any surface without a fixed accent color.

## i18n

The default accessible name is the two-segment `common.close` message (promoted from the former
`dialog.close`, since it was never dialog-specific). It resolves through `useLocale`, which has a
default context, so a `CloseButton` outside an `I18nProvider` still labels in the default locale.
Under `<I18nProvider locale="fr-FR">` the default becomes "Fermer".
