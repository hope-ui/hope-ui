import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers, withDefaults } from "../../utils";
import type { CreateDialogReturn } from "../root/dialog-root";

export interface CreateDialogCloseReturn {
  /** Spread onto the close button. `type` defaults to `"button"`, plus an `onClick` that closes
   * (composed in front of the consumer's, so their `preventDefault()` cancels). */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The close part: a button that closes the dialog. As on the trigger, the consumer's `onClick`
 * runs first and `event.preventDefault()` cancels the close.
 */
export function createDialogClose(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateDialogCloseReturn {
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        state.setOpen(false),
      );
    },
  });

  return { props: elementProps };
}
