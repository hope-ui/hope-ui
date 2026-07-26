import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreatePopoverReturn } from "@hope-ui/primitives/popover";
import type { PopoverSlot, SlotClassAccessor } from "@hope-ui/theming";

/**
 * The value every Popover part reads. **Composition, not inheritance**: it *holds* the primitive
 * state as `state` (open/role/ids, every shared element ref, the positioning layer and the shared
 * `contentPresence`) rather than extending `CreatePopoverReturn`, so the styling layer never
 * masquerades as the primitive return. A part passes `ctx.state` into its `createPopoverX(state, …)`
 * hook, and reads recipe classes off `ctx.slots`. All a11y/behavior — including `role` and every
 * positioning option — lives on `ctx.state`; the component layer contributes only `slots`.
 */
export interface PopoverContextValue {
  /** The primitive popover state — open/role/ids, the trigger/anchor/positioner/content/arrow refs,
   * `floating` and the shared overlay `contentPresence`. Passed straight into each part's
   * `createPopoverX(state, …)`. */
  state: CreatePopoverReturn;
  /** One ready-to-call class fn per Popover slot, resolved once on `Root` and shared here. Each takes
   * the part's own `class`, folded in last through the recipe's tailwind-merge seam. */
  slots: Record<PopoverSlot, SlotClassAccessor>;
}

export const [PopoverContext, usePopoverContext] =
  createComponentContext<PopoverContextValue>("Popover");
