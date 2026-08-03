import { createComponentContext } from "@hope-ui/primitives/internal";
import type { AlertSlot, SlotClassAccessor } from "@hope-ui/theming";

/**
 * What every Alert part reads. `slots` holds one ready-to-call class function per slot; `setOpen`
 * drives dismissal; the `register*` setters let `Alert.Title`/`Alert.Description` publish their
 * generated ids so `Alert.Root` can point `aria-labelledby`/`aria-describedby` at them.
 */
export interface AlertContextValue {
  slots: Record<AlertSlot, SlotClassAccessor>;
  setOpen: (open: boolean) => void;
  registerTitleId: (id: string | undefined) => void;
  registerDescriptionId: (id: string | undefined) => void;
}

export const [AlertContext, useAlertContext] = createComponentContext<AlertContextValue>("Alert");
