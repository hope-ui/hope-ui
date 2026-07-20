import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogCloseTriggerReturn {
  /** Spread onto the close button. Carries an `onClick` that closes the dialog — composed in **front**
   * of the consumer's, so their `preventDefault()` cancels the close — plus the consumer's other props
   * unchanged. The accessible name (`common.close`) and the `type="button"` default now come from the
   * `CloseButton` component (over `createButton`) this composes with, not from here. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The close-trigger part: injects the dialog's close behavior onto a button, and nothing else. The
 * consumer's `onClick` runs first and `event.preventDefault()` cancels the close (via
 * `composeEventHandlers`' cancel channel).
 *
 * This is deliberately **minimal**: it owns only the close `onClick`. The label default
 * (`common.close`) and `type="button"` are owned by the `CloseButton` component that `@hope-ui/components`'
 * `Dialog.CloseTrigger` renders (over the `createButton` primitive), so this hook no longer sets them — a
 * single source for each, no double-ownership. (This is a lower-level escape hatch than it once was; a
 * headless consumer wiring `createDialogCloseTrigger` onto a bare `<button>` supplies its own label/type.)
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
