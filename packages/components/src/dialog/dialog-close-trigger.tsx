import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { createDialogCloseTrigger } from "@hope-ui/primitives/dialog";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

// A `CloseButton` with the dialog's close wiring bolted on, so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses` and the native attributes for free. Rendering a styled
// `CloseButton` is also why this part requires a `<ThemeProvider>` ancestor.
export interface DialogCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<DialogCloseTriggerProps> = (props) => {
  const ctx = useDialogContext();
  // The hook contributes only the close `onClick`, composed in *front* of the consumer's so their
  // `preventDefault()` cancels the close. Label, glyph and `type` all come from `CloseButton`.
  const close = createDialogCloseTrigger(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(close.props, {
    get class(): string {
      // The consumer's class goes *into* the slot function, never concatenated after it: only then
      // does tailwind-merge see both strings and let the consumer's utility win a conflict.
      return ctx.slots.closeTrigger(props.class);
    },
    // Overrides the `close-button` marker `CloseButton` sets on itself.
    "data-slot": "dialog-close-trigger",
  });

  // The hook types its props as plain `JSX.ButtonHTMLAttributes` — it cannot name `CloseButtonProps`
  // without the primitive depending on the component — which widens `disabled` to `boolean | ""`.
  // The consumer's `size`/`icon`/etc. are all still there at runtime, so cast back for the spread.
  //
  // `render` is handed over separately rather than through the spread: `CloseButton` reads it
  // synchronously to build the element, and Solid flags a reactive read outside a tracking scope
  // (`STRICT_READ_UNTRACKED`) when it comes from a spread.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
