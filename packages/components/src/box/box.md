# Box

The foundational styled primitive — hope-ui's `<Box>`, and the end-to-end proof of the
Panda toolchain. Accepts every Panda style prop directly on the JSX (`p`, `bg`, `mt`,
`rounded`, `_hover`, `colorPalette`, `css`, …), maps them to atomic classes at render, and
renders through the shared `renderElement` — a `<div>` by default, or any element via `as` /
`render` (that's what `renderElement` is for: `as`/render-prop polymorphism). No inline
styles; the class names come from the pure, deterministic `css()` mapper, so it works in
SolidStart — server render and client render produce identical markup and it hydrates in
place.

hope-ui ships **zero CSS**: the atomic rules these classes reference are emitted by the
consumer's own `panda codegen` over their source (add `@hope-ui/preset` to their
`panda.config.ts`). The runtime only maps props → class names.

## API

| Prop         | Type                                                                  | Default | Description                                                        |
| ------------ | --------------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `as`         | `ValidComponent`                                                      | `"div"` | Element/component to render.                                       |
| `render`     | `(props) => JSX.Element`                                              | —       | Render-prop override; receives Box's computed DOM props.          |
| style props  | `JsxStyleProps` — `p`, `bg`, `mt`, `rounded`, `_hover`, `colorPalette`, `css`, … | —       | Mapped to atomic classes via Panda `css()`.                       |
| `class`      | `string`                                                             | —       | Merged **after** the style-prop classes (consumer wins on ties).  |
| `...rest`    | `JSX.HTMLAttributes`                                                 | —       | Forwarded to the rendered element.                                |

## How it works

1. Incoming keys are partitioned with Panda's own `isCssProperty`.
2. The style props become a class string via the pure, deterministic `css()` mapper
   (identical on server and client → hydration stays byte-for-byte stable).
3. `cx(css(styleProps), consumerClass)` merges the classes; the element renders via
   `renderElement` → `<Dynamic>`.

## Example

```tsx
import { Box } from "@hope-ui/components/box";

<Box p="4" bg="primary" color="primary.foreground" rounded="lg">Card</Box>
<Box as="section" display="flex" gap="2" borderWidth="1px" borderColor="border" />
```

## Notes

- **Style props are constrained to token-scale values** — that is the design system. The
  atomic CSS is generated from the consumer's source, so an off-scale one-off (`p="17px"`)
  requires that the consumer's own `panda codegen` sees it.
- `class` composes with the style-prop classes via `cx`; it does not resolve equal-specificity
  atomic conflicts (order-dependent). For a guaranteed override, use the `css` prop.
