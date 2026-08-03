import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverCloseTriggerReturn {
  /** Spread onto the close button. Carries an `onClick` that closes the popover — composed **behind**
   * the consumer's, so their `preventDefault()` cancels it — plus their other props unchanged. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The close-trigger part: injects the popover's close behavior onto a button, and nothing else.
 *
 * Deliberately **minimal** — no `type="button"`, no accessible name. Both belong to the
 * `CloseButton` component that `Popover.CloseTrigger` renders, so each default has one owner. A
 * headless consumer wiring this onto a bare `<button>` supplies them itself.
 */
export function createPopoverCloseTrigger(
  state: CreatePopoverReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreatePopoverCloseTriggerReturn {
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
