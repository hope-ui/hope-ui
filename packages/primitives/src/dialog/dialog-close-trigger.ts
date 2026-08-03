import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogCloseTriggerReturn {
  /** Spread onto the close button: the consumer's props unchanged, plus an `onClick` that closes
   * the dialog, composed in **front** of theirs so their `preventDefault()` cancels the close. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The close-trigger part: injects the dialog's close behavior onto a button, and nothing else.
 *
 * Deliberately minimal — it owns only the `onClick`. The accessible name and the `type="button"`
 * default belong to the `CloseButton` component that `Dialog.CloseTrigger` renders, so each has a
 * single owner. A headless consumer wiring this onto a bare `<button>` supplies both itself.
 */
export function createDialogCloseTrigger(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateDialogCloseTriggerReturn {
  const rest = omit(props, "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () =>
        state.setOpen(false),
      );
    },
  });

  return { props: elementProps };
}
