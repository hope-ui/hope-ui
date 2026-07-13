import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useLocale } from "../../i18n";
import { composeEventHandlers, withDefaults } from "../../utils";
import type { CreateDialogReturn } from "../root/dialog-root";

export interface CreateDialogCloseReturn {
  /** Spread onto the close button. `type` defaults to `"button"`, `aria-label` to the localized
   * `dialog.close` message (consumer `aria-label` wins), plus an `onClick` that closes (composed in
   * front of the consumer's, so their `preventDefault()` cancels). */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The close part: a button that closes the dialog. As on the trigger, the consumer's `onClick`
 * runs first and `event.preventDefault()` cancels the close. Defaults `aria-label` to the localized
 * `dialog.close` message (so an icon-only close button is labelled); a consumer `aria-label` wins.
 */
export function createDialogClose(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateDialogCloseReturn {
  const i18n = useLocale();
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get "aria-label"() {
      return props["aria-label"] ?? i18n.t("dialog.close");
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        state.setOpen(false),
      );
    },
  });

  return { props: elementProps };
}
