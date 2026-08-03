import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { composeEventHandlers } from "@hope-ui/primitives/utils";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

// A `CloseButton` with the alert's dismiss wiring bolted on, so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses` and the native attributes for free. Rendering a styled
// `CloseButton` is also why any closable Alert requires a `<ThemeProvider>` ancestor.
export interface AlertCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<AlertCloseTriggerProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get onClick() {
      // The consumer's handler runs *first*, so their `event.preventDefault()` cancels the close.
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () =>
        ctx.setOpen(false),
      );
    },
    get class(): string {
      // The consumer's class goes *into* the slot function, never concatenated after it: only then
      // does tailwind-merge see both strings and let the consumer's utility win a conflict.
      return ctx.slots.closeTrigger(props.class);
    },
    // Overrides the `close-button` marker `CloseButton` sets on itself.
    "data-slot": "alert-close-trigger",
  });

  // `render` is handed over separately rather than through the spread: `CloseButton` reads it
  // synchronously to build the element, and Solid flags a reactive read outside a tracking scope
  // (`STRICT_READ_UNTRACKED`) when it comes from a spread.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
