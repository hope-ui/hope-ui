import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { createDialogCloseTrigger } from "@hope-ui/primitives/dialog";
import { cx } from "@hope-ui/theming";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

// `Dialog.CloseTrigger` is a `CloseButton` with the dialog's close wiring — so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses`/native attrs for free, and shows the themed X by
// default. Because it renders a recipe-styled `CloseButton`, `Dialog.CloseTrigger` **requires a
// `<ThemeProvider>`** ancestor, like every other styled component (see the doc website).
export interface DialogCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<DialogCloseTriggerProps> = (props) => {
  const ctx = useDialogContext();
  // The primitive owns only the close `onClick` (composed in front of the consumer's, so their
  // `preventDefault()` cancels the close). The label + visual + `type` default come from `CloseButton`.
  const close = createDialogCloseTrigger(ctx, omit(props, "render", "class"));

  const elementProps = merge(close.props, {
    get class(): string {
      // Placement from the dialog recipe's `closeTrigger` slot, merged with any consumer `class`
      // (which wins via tailwind-merge inside CloseButton's own `class` seam), over CloseButton's chrome.
      return cx(ctx.slots.closeTrigger(), props.class) ?? "";
    },
    // Re-scope CloseButton's root marker to this part (overrides its `close-button` default).
    "data-slot": "dialog-close-trigger",
  });

  // `close.props` is typed as the primitive's `JSX.ButtonHTMLAttributes` (the hook can't reference the
  // component's `CloseButtonProps` without a layering cycle), which widens `disabled` to Solid's
  // `boolean | ""`. It still carries the consumer's `size`/`icon`/etc. at runtime, so cast back to the
  // component surface for the spread. `render` is passed to `CloseButton` directly (not through the
  // spread) — it is read synchronously to build the element, so a reactive spread-read would trip
  // `STRICT_READ_UNTRACKED`.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
