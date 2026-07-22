// hope's built-in glyph set — the icons the components render by default (nav chevrons, the selection
// check, the close `x`, the button loader arc, and the four Alert status glyphs). Each is a
// self-contained, hand-inlined Lucide `<svg>` (so the library ships **no icon-library dependency**):
// `currentColor` stroke so it adopts its host's text color, `aria-hidden` (the accessible name comes
// from the component around it), and no width/height — the consuming recipe sizes the bare `<svg>` via
// `[&_svg]:size-*`. These are internal resources (no package subpath export): a component imports the
// one it needs and offers it as the overridable default for its themeable icon prop.
export { CheckIcon } from "./check-icon";
export { ChevronLeftIcon } from "./chevron-left-icon";
export { ChevronRightIcon } from "./chevron-right-icon";
export { CircleCheckIcon } from "./circle-check-icon";
export { CircleXIcon } from "./circle-x-icon";
export { InfoIcon } from "./info-icon";
export { LoaderCircleIcon } from "./loader-circle-icon";
export { TriangleAlertIcon } from "./triangle-alert-icon";
export { XIcon } from "./x-icon";
