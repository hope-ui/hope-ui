import { createComponentContext } from "@hope-ui/primitives/internal";
import type { CreatePopoverReturn } from "@hope-ui/primitives/popover";
import type { PopoverSlot, SlotClassAccessor } from "@hope-ui/theming";

/**
 * The value every Popover part reads. It *holds* the headless state under `state` rather than
 * extending it, so the styling layer never masquerades as the primitive's return value. All
 * accessibility and behavior live on `state`; this layer contributes only `slots`.
 */
export interface PopoverContextValue {
  /** The `createPopover` return — open/role/ids, the trigger/anchor/positioner/content/arrow refs,
   * the positioning layer, and the shared enter/exit animation state. Each part passes this straight
   * into its own `createPopoverX(state, …)` hook. */
  state: CreatePopoverReturn;
  /** One class function per named slot of the theme's `popover` recipe, resolved once on `Root`. Each
   * takes the part's own `class` and folds it in last, through tailwind-merge, so a consumer's
   * utility wins over the recipe's. */
  slots: Record<PopoverSlot, SlotClassAccessor>;
}

export const [PopoverContext, usePopoverContext] =
  createComponentContext<PopoverContextValue>("Popover");
