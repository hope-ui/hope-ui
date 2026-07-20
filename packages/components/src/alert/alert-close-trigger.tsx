import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { composeEventHandlers } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

// `Alert.CloseTrigger` is a `CloseButton` with the alert's dismiss wiring — so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses`/native attrs for free and shows the themed X by
// default. Because it renders a recipe-styled `CloseButton`, any closable Alert **requires a
// `<ThemeProvider>`** ancestor (see `Alert.md`).
export interface AlertCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<AlertCloseTriggerProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get onClick() {
      // Composed in FRONT of the consumer's, so their `event.preventDefault()` cancels the close (the
      // cancel channel in `composeEventHandlers`). Mirrors `createDialogCloseTrigger`.
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () =>
        ctx.setOpen(false),
      );
    },
    get class(): string {
      // Placement from the alert recipe's `closeTrigger` slot, merged with any consumer `class` (which
      // wins via tailwind-merge inside CloseButton's own `class` seam), over CloseButton's own chrome.
      return cx(ctx.slots.closeTrigger(), props.class) ?? "";
    },
    // Re-scope CloseButton's root marker to this part (overrides its `close-button` default).
    "data-slot": "alert-close-trigger",
  });

  // `render` is passed to `CloseButton` directly (not through the spread) — it is read synchronously to
  // build the element, so a reactive spread-read would trip `STRICT_READ_UNTRACKED`. Mirrors `Dialog.CloseTrigger`.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
