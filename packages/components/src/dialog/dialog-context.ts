import type { CreateDialogReturn } from "@hope-ui/primitives/dialog";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { DialogSlot, SlotClassAccessor } from "@hope-ui/theming";

/**
 * The value every Dialog part reads. **Composition, not inheritance**: it *holds* the primitive
 * state as `state` (open/modal/role/ids/spared registry, the content-element ref, and the shared
 * `contentPresence`) rather than extending `CreateDialogReturn`, so the styling layer never
 * masquerades as the primitive return. A part passes `ctx.state` into its `createDialogX(state, …)`
 * hook, and reads recipe classes off `ctx.slots`. All a11y/behavior (including `role`) lives on
 * `ctx.state`; the component layer contributes only `slots`.
 */
export interface DialogContextValue {
  /** The primitive dialog state — open/modal/role/ids/spared registry, the content-element ref, and
   * the shared overlay `contentPresence`. Passed straight into each part's `createDialogX(state, …)`. */
  state: CreateDialogReturn;
  /** One ready-to-call class fn per Dialog slot, resolved once on `Root` and shared here. Each takes
   * the part's own `class`, folded in last through the recipe's tailwind-merge seam. */
  slots: Record<DialogSlot, SlotClassAccessor>;
}

export const [DialogContext, useDialogContext] =
  createComponentContext<DialogContextValue>("Dialog");
