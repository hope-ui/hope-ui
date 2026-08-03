import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { createPopoverCloseTrigger } from "@hope-ui/primitives/popover";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

// A `CloseButton` with the popover's close wiring, so it inherits `size`/`icon`/`render`/`class`/
// `slotClasses`/native attributes for free and shows the themed X by default. **Opt-in**: unlike
// `Dialog.Content`, `Popover.Content` never auto-renders one. Rendering a recipe-styled `CloseButton`
// means this **requires a `<ThemeProvider>`** ancestor.
export interface PopoverCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<PopoverCloseTriggerProps> = (props) => {
  const ctx = usePopoverContext();
  // The primitive owns only the close `onClick`, composed *behind* the consumer's so their
  // `preventDefault()` cancels the close. Label, visual and `type` come from `CloseButton`.
  const close = createPopoverCloseTrigger(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(close.props, {
    get class(): string {
      // Placement from the popover recipe's `closeTrigger` slot; the consumer's `class` goes *into*
      // the slot function so tailwind-merge can let it win, never concatenated outside it.
      return ctx.slots.closeTrigger(props.class);
    },
    // Re-scopes CloseButton's own `data-slot="close-button"` marker to this part.
    "data-slot": "popover-close-trigger",
  });

  // `close.props` is typed as plain `JSX.ButtonHTMLAttributes` (a primitive cannot reference a
  // component's props without a dependency cycle), which widens `disabled` to Solid's `boolean | ""`.
  // At runtime it still carries the consumer's `size`/`icon`/…, hence the cast back.
  //
  // `render` is handed to `CloseButton` as its own prop rather than through the spread: it is read
  // synchronously while building the element, and a reactive read there trips Solid 2.0's
  // `STRICT_READ_UNTRACKED` guard.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
