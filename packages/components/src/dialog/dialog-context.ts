import type { CreateDialogReturn } from "@hope-ui/primitives/dialog";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { DialogSlot, SlotClassAccessor } from "@hope-ui/theming";

/**
 * What every Dialog part reads. It *holds* the headless state rather than extending it, so the
 * styling layer can never be mistaken for the hook's own return value: a part passes `ctx.state`
 * into its `createDialogX(state, …)` hook for behavior, and reads `ctx.slots` for classes.
 */
export interface DialogContextValue {
  /** Open/modal/role, the generated ids, the content element, and the shared enter/exit state. */
  state: CreateDialogReturn;
  /** One ready-to-call class function per slot, resolved once on `Root`. Each takes the part's own
   * `class` and folds it in last, so a consumer utility wins a Tailwind conflict. */
  slots: Record<DialogSlot, SlotClassAccessor>;
}

export const [DialogContext, useDialogContext] =
  createComponentContext<DialogContextValue>("Dialog");
