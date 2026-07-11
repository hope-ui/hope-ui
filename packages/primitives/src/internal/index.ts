// The `internal/` barrel: the library's `createX` behavior primitives, exported as the single
// subpath `@solid-zero/primitives/internal`. Subfolders have no barrel of their own — only the
// top-level `src/` folders do.
export { createComponentContext } from "./context/context";
export {
  type CreateControllableStateOptions,
  createControllableState,
} from "./controllable/controllable";
export { type CreateDismissableOptions, createDismissable } from "./dismissable/dismissable";
export {
  type CreateFocusRestoreOptions,
  createFocusRestore,
} from "./focus-restore/focus-restore";
export { type CreateFocusTrapOptions, createFocusTrap } from "./focus-trap/focus-trap";
export { type CreateHideOutsideOptions, createHideOutside } from "./hide-outside/hide-outside";
export {
  type CreatePresenceItemOptions,
  type CreatePresenceOptions,
  createPresence,
  createPresenceItem,
  type PresenceItemState,
  type PresenceState,
  type PresenceStatus,
} from "./presence/presence";
export {
  type CreateRegisteredElementOptions,
  createRegisteredElement,
} from "./registered-element/registered-element";
export { type CreateRegisteredIdOptions, createRegisteredId } from "./registered-id/registered-id";
export { type CreateScrollLockOptions, createScrollLock } from "./scroll-lock/scroll-lock";
