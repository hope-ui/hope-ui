import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers, withDefaults } from "../utils";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogTriggerReturn {
  /** Spread onto the trigger element. `type` defaults to `"button"`, plus
   * `aria-haspopup`/`aria-expanded`/`aria-controls` and an `onClick` that opens (composed in
   * front of the consumer's, so their `preventDefault()` cancels). */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The trigger part: opens the dialog and advertises it to assistive technology. The consumer's own
 * `onClick` runs first, so `event.preventDefault()` cancels the open. It only ever opens, never
 * toggles: close through `createDialogCloseTrigger` or by controlling `open` yourself.
 */
export function createDialogTrigger(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateDialogTriggerReturn {
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get "aria-haspopup"() {
      return "dialog" as const;
    },
    get "aria-expanded"() {
      return state.open() ? ("true" as const) : ("false" as const);
    },
    get "aria-controls"() {
      // Only while open. `aria-controls` naming an element that isn't in the DOM is an invalid
      // IDREF (axe `aria-valid-attr-value`), so it's omitted when closed.
      return state.open() ? state.popupId() : undefined;
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        state.setOpen(true),
      );
    },
  });

  return { props: elementProps };
}
