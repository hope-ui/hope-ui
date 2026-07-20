import { createComponentContext } from "@hope-ui/primitives/internal";
import type { AlertSlot } from "@hope-ui/theming";

/**
 * The shared state every Alert part reads. `slots` is the ready-to-call class fn per slot; `setOpen`
 * drives dismissal (used by `Alert.CloseTrigger`); the `register*` setters let a compound `Alert.Title`/
 * `Alert.Description` publish its id so `Alert.Root` can point `aria-labelledby`/`aria-describedby` at
 * it (SSR-linked directly in the auto-compose path, registered post-hydration in the compound path).
 */
export interface AlertContextValue {
  slots: Record<AlertSlot, () => string>;
  setOpen: (open: boolean) => void;
  registerTitleId: (id: string | undefined) => void;
  registerDescriptionId: (id: string | undefined) => void;
}

export const [AlertContext, useAlertContext] = createComponentContext<AlertContextValue>("Alert");
