# Semantic color tokens (`@hope-ui/theming`)

The design-system-agnostic color vocabulary every `@hope-ui/presets/*` preset implements. Components
and recipes reference these names as Tailwind utilities; a preset supplies the values as
`--hope-<token>` CSS variables (see `@hope-ui/presets/hope`).

## API

- `SEMANTIC_COLOR_TOKENS` — readonly array of every semantic token name. The runtime source of
  truth; `checkSemanticTokenConformance` iterates it.
- `SemanticColorToken` — the union of the token names.
- `SemanticColorContract` — `Record<SemanticColorToken, string>`, the completeness shape a JS tool
  can assert against.

## Naming (Tailwind-ergonomic)

No token is ever a bare CSS property, so utilities never double up (`text-text`, `border-border`,
`ring-ring`).

| Group | Tokens | Reads as |
|---|---|---|
| Surfaces | `surface`, `surface-raised`, `surface-overlay`, `surface-sunken`, `surface-inverse` | `bg-surface`, … |
| Standard text | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-disabled` | `text-foreground`, … |
| On-color text | `on-<role>`, `on-<role>-subtle`, `on-inverse` | `text-on-primary`, `text-on-danger-subtle`, `text-on-inverse` |
| Role fills | `<role>`, `<role>-subtle` — roles: `primary`, `neutral`, `success`, `info`, `warning`, `danger` | `bg-primary`, `bg-danger-subtle` |
| Border tints | `subtle-outline`, `strong-outline`, `disabled-outline` (role borders reuse the role color) | `border-subtle-outline`, `border-strong-outline`, `border-primary` |
| Disabled fill | `disabled` (a real background — kept a legible step from `foreground-disabled`) | `bg-disabled` |
| Systemic | `focus`, `scrim` | `ring-focus`, `outline-focus`, `bg-scrim` |

Icons fold into the text tokens (currentColor) — there is no separate `icon` family.

## Pairing (readable-on)

Each fill owns its on-color:

- primary button → `bg-primary text-on-primary`
- soft error alert → `bg-danger-subtle text-on-danger-subtle border-danger`
- card → `bg-surface text-foreground border-subtle-outline`
- tooltip → `bg-surface-inverse text-on-inverse`

Neutral surfaces pair with the `foreground*` ramp.

## Conformance

A preset proves it defines every token with `checkSemanticTokenConformance` /
`assertSemanticTokenConformance` (from `@hope-ui/theming/conformance`) run against the CSS that
declares the `--hope-*` values. `@hope-ui/presets/hope` authors its palette in TS (`index.ts`'s
`hopeTokens`), so `hope.test.ts` runs the check over the CSS that `renderPresetStyle(hope.tokens, …)`
emits; a preset that instead declares values in a `tokens.css` runs it over that file.
An undefined token compiles every referencing utility to an unresolved `var(--hope-…)`.
