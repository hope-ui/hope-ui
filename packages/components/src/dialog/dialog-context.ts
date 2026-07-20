import type { CreateDialogReturn } from "@hope-ui/primitives/dialog";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { DialogSlot } from "@hope-ui/theming";

/**
 * The value every Dialog part reads. An **intersection** of the primitive's `CreateDialogReturn`
 * (open/modal/ids/spared-element registry) with the styling layer `Dialog.Root` adds: `slots` (one
 * ready-to-call class fn per recipe slot, from `useSlots`) and `role` (the ARIA role lifted to
 * `Dialog.Root` and threaded to `Dialog.Content`). Because it extends `CreateDialogReturn`, a part
 * passes the whole context straight into its `createDialogX(state, …)` hook — the hook reads only the
 * `CreateDialogReturn` fields and ignores the two styling additions.
 */
export interface DialogContextValue extends CreateDialogReturn {
  /** One ready-to-call class fn per Dialog slot, resolved once on `Root` and shared here. */
  slots: Record<DialogSlot, () => string>;
  /** The ARIA role, set on `Root` and read by `Content` (`"dialog"` or `"alertdialog"`). */
  role: () => "dialog" | "alertdialog";
}

export const [DialogContext, useDialogContext] =
  createComponentContext<DialogContextValue>("Dialog");
