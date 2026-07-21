// The `render/` barrel: the render-prop / `as`-polymorphism primitive `renderElement` (and the
// owner of ref merging), exported as the single subpath `@hope-ui/primitives/render`. It sits in
// its own top-level folder rather than under `utils/` because it is the marquee composition
// primitive — every public component routes its parts through it — not a bare utility.
export { type RenderElementOptions, type RenderProp, renderElement } from "./render";
