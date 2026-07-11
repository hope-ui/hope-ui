// The `utils/` barrel: the non-`createX` composition helpers, exported as the single subpath
// `@solid-zero/primitives/utils`. Subfolders have no barrel of their own — only the top-level
// `src/` folders do.
export { type WithDefaults, withDefaults } from "./defaults/defaults";
export { composeEventHandlers, type EventHandlerEvent } from "./events/events";
export { type RenderElementOptions, type RenderProp, renderElement } from "./render/render";
