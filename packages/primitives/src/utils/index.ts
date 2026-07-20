// The `utils/` barrel: the non-`createX` composition helpers, exported as the single subpath
// `@hope-ui/primitives/utils`. Subfolders have no barrel of their own — only the top-level
// `src/` folders do.
export { type WithDefaults, withDefaults } from "./defaults";
export { compareByIdOrReference, type ValueComparator } from "./equality";
export { composeEventHandlers, type EventHandlerEvent } from "./events";
export {
  createKeyboardHandler,
  type KeyboardEventFor,
  type KeyboardHandler,
} from "./keymap";
export { type RenderElementOptions, type RenderProp, renderElement } from "./render";
export { runIfFunction } from "./run-if-function";
