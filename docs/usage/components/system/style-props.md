# `renderStyled` — the shared style-props mechanism

`renderStyled` is the single, reusable primitive that gives any `@hope-ui/components` component or
part the full style-props API — Chakra-style shorthands (`p`, `bg`, `mt`), conditionals (`_hover`),
responsive values (`sm`/`md`), the `css` escape hatch, and `as`/render-prop polymorphism — without
copying `Box`'s boilerplate into every part.

It lives at `packages/components/src/system/` as an **internal** helper: no `package.json#exports`
subpath, inlined into each component's bundle by tsdown. It is *not* a public API and is exempt from
the story / SSR / hydration Definition-of-Done requirements (a test is still required); its behavior
is covered end-to-end through `Box`.

## Why it lives in `@hope-ui/components`

It needs `css()` / `cx()` / `isCssProperty` from `@hope-ui/styled-system`, which only
`@hope-ui/components` depends on. It cannot move lower without breaking the dependency direction
`components → theming → primitives`:

- **Not `@hope-ui/primitives`** — the kernel is headless *behavior* only and must not gain a Panda
  dependency. `renderStyled` composes *with* the kernel's `renderElement`, it does not replace it.
- **Not `@hope-ui/theming`** — theming is the Panda-*agnostic* contract seam (`SlotRecipeFn`,
  `useRecipe`); importing `css`/`isCssProperty` there would bake Panda into the contract layer.

## API

```ts
interface RenderStyledOptions<Props extends { class?: unknown }, El extends Element = Element> {
  as: ValidComponent;                       // element/component to render (polymorphism via renderElement)
  props: Props;                             // DOM props + style props + class/style/css
  render?: RenderProp<Props>;               // consumer render-prop override
  ref?: JSX.RefCallback<El>;                // internal ref, merged with the consumer's by renderElement
  recipeClass?: Accessor<string | undefined>; // optional class(es) BELOW style props — the recipe seam
}

function renderStyled<Props extends { class?: unknown }, El extends Element = Element>(
  options: RenderStyledOptions<Props, El>,
): JSX.Element;
```

## Adopting it — one line

Because behavior hooks forward unknown consumer props through their returned `.props`, a part opts
in by swapping its `renderElement(...)` call for `renderStyled(...)`:

```ts
// A Dialog-style part:
const trigger = createDialogTrigger(state, omit(props, "render"));
return renderStyled<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
  as: "button",
  render: props.render,
  props: trigger.props,           // the consumer's style props + class arrived here untouched
});
```

`Box` is the reference consumer — a pure layout primitive (no recipe):

```ts
export const Box: Component<BoxProps> = (props) =>
  renderStyled<BoxElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    props: props as unknown as BoxElementProps,
  });
```

`renderStyled` strips `as` / `render` / `class` / the style-prop keys itself, so callers may hand it
a raw component props bag (Box) or a hook's output (`trigger.props`) with no ceremony.

## Precedence

`cx()` concatenates; the **effective** CSS precedence is decided by Panda's `@layer` cascade + source
order (both recipe and style-prop classes are atomic Panda classes). The `cx` argument order
reinforces the layer order and breaks same-layer/equal-specificity ties toward the consumer:

| Precedence (low → high) | Source | Mechanism |
| --- | --- | --- |
| 1. Recipe/variant classes | `recipeClass()` | `@layer recipes` |
| 2. Style props + `css` prop | `css(styleObject)` | `@layer utilities` (beats recipes) |
| 3. Consumer `class` | `props.class`, last in `cx` | unlayered user CSS beats all Panda layers; a Panda class breaks ties by being last |
| 4. Consumer inline `style` | untouched, spread by `renderElement` | inline style beats any class |

hope-ui ships zero CSS — the atomic rules are emitted by the consumer's own `panda codegen`, so this
relies on the standard hope-ui layer order being present in their generated stylesheet.

## SSR / hydration

The `class` getter is pure render-time computation: no DOM access, no effects, no ids, no `Portal`.
`css()` returns **unhashed**, stable class names (`hash: false`), byte-identical on server and
client, so there is no hydration mismatch. No new SSR rules are needed beyond what `Box` already
satisfies.

## Type-level DX

`as` is a loose `ValidComponent`, never a generic that re-types `Props` from the element, so
`renderStyled<Props>` is as cheap to type-check as `renderElement<Props>` — none of the deep
conditional polymorphic-type cost that degrades IntelliSense elsewhere. The tradeoff (already the
codebase's choice): `<Box as="a" href>` does not type-check `href`.

## The recipe seam (not wired yet)

`recipeClass` is a theming-free string accessor. When themed components land, the root will call
`useRecipe(key)`, resolve `recipe(variantProps)` to a `Record<Slot, string>`, share it via a small
`createStyleContext` helper, and each part will pass its slot class down:
`renderStyled({ …, recipeClass: () => slotClass() })`. Precedence is already correct (row 1 above).
No change to `renderStyled` is required to wire it; that is the point at which `@hope-ui/components`
gains its `@hope-ui/theming` dependency.
