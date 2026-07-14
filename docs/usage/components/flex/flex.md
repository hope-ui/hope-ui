# Flex

A `Box` that lays its children out with flexbox. `<Flex>` renders a `<div>` with `display: flex`
(or `inline-flex` via `inline`) and exposes Chakra's flexbox **shorthands** — `direction`, `align`,
`justify`, `wrap`, `basis`, `grow`, `shrink` — on top of the full Box style-prop surface. It renders
through the shared `renderStyled`, so `as` / `render` polymorphism, ref merging, the `css` escape
hatch, and consumer `class` merging all work exactly as on `Box`.

The shorthand → CSS mapping is **Panda's own `flex` pattern** (`flex.raw`), reused verbatim rather
than re-implemented, so hope-ui never drifts from what the consumer's `panda codegen` extracts.

## API

| Prop        | Type                                  | Maps to           | Default | Description                                    |
| ----------- | ------------------------------------- | ----------------- | ------- | ---------------------------------------------- |
| `direction` | `SystemStyleObject["flexDirection"]`  | `flexDirection`   | —       | Main-axis direction.                           |
| `align`     | `SystemStyleObject["alignItems"]`     | `alignItems`      | —       | Cross-axis alignment.                          |
| `justify`   | `SystemStyleObject["justifyContent"]` | `justifyContent`  | —       | Main-axis distribution.                        |
| `wrap`      | `SystemStyleObject["flexWrap"]`       | `flexWrap`        | —       | Whether children wrap.                         |
| `basis`     | `SystemStyleObject["flexBasis"]`      | `flexBasis`       | —       | Initial main size.                             |
| `grow`      | `SystemStyleObject["flexGrow"]`       | `flexGrow`        | —       | Grow factor.                                   |
| `shrink`    | `SystemStyleObject["flexShrink"]`     | `flexShrink`      | —       | Shrink factor.                                 |
| `inline`    | `boolean`                             | `display`         | `false` | `inline-flex` when `true`, else `flex`.        |
| `as`        | `ValidComponent`                      | —                 | `"div"` | Element/component to render.                   |
| `render`    | `(props) => JSX.Element`              | —                 | —       | Render-prop override.                          |
| style props | `JsxStyleProps` (`p`, `gap`, `bg`, `css`, …) | atomic classes | — | Any Box style prop; forwarded through.         |
| `class`     | `string`                              | —                 | —       | Merged **after** the style-prop classes.       |

`display` is always emitted (Chakra parity), so a consumer's own `display` is ignored — use `inline`
for `inline-flex`.

## How it works

1. The shorthands are handed to Panda's pure `flex.raw({...})` → a canonical style object
   (`{ display: "flex", alignItems, justifyContent, … }`); `inline` overrides `display`.
2. That object is passed to `renderStyled` as the `css` escape hatch, merged **after** the
   consumer's own style props and **before** their explicit `css` (so the consumer's `css` still
   wins). `css()` emits the atomic classes (`d_flex`, `flex-d_column`, `ai_center`, …).
3. The class string is byte-stable across server and client, so `<Flex>` hydrates in place.

## Example

```tsx
import { Flex } from "@hope-ui/components/flex";

<Flex justify="space-between" align="center" gap="4">…</Flex>
<Flex direction="column" gap="2" p="4">…</Flex>
<Flex inline align="center">inline row</Flex>
```

## Notes

- **CSS comes from the consumer's `panda codegen`; hope-ui ships zero CSS.** The shorthands are
  extractable because the `flex` pattern (jsxName `Flex`) ships in every `@hope-ui/themes/*` preset
  (via `@pandacss/preset-base`). Remove/replace that pattern and `<Flex align="center">` produces
  no rule.
- **`inline` needs the preset's `staticCss`.** `inline` is a runtime toggle Panda can't see in your
  JSX, so `@hope-ui/themes/base` pre-generates `d_flex`/`d_inline-flex` in `staticCss`. Without a
  hope-ui theme preset, `inline` won't resolve.
- **Values must be static literals** for extraction — a runtime-computed `align={signal()}` hits
  Panda's dynamic-styling limit (use `staticCss`), same as every style prop on `Box`.
