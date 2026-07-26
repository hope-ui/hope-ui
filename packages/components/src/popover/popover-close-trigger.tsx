import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { createPopoverCloseTrigger } from "@hope-ui/primitives/popover";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

// `Popover.CloseTrigger` is a `CloseButton` with the popover's close wiring — so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses`/native attrs for free, and shows the themed X by
// default. **Opt-in**: unlike `Dialog.Content`, `Popover.Content` never auto-renders one. Because it
// renders a recipe-styled `CloseButton`, it **requires a `<ThemeProvider>`** ancestor, like every
// other styled component.
export interface PopoverCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<PopoverCloseTriggerProps> = (props) => {
  const ctx = usePopoverContext();
  // The primitive owns only the close `onClick` (composed behind the consumer's, so their
  // `preventDefault()` cancels the close). The label + visual + `type` default come from `CloseButton`.
  const close = createPopoverCloseTrigger(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(close.props, {
    get class(): string {
      // Placement from the popover recipe's `closeTrigger` slot, merged with any consumer `class`
      // (which wins via tailwind-merge inside CloseButton's own `class` seam), over CloseButton's chrome.
      return ctx.slots.closeTrigger(props.class);
    },
    // Re-scope CloseButton's root marker to this part (overrides its `close-button` default).
    "data-slot": "popover-close-trigger",
  });

  // `close.props` is typed as the primitive's `JSX.ButtonHTMLAttributes` (the hook can't reference the
  // component's `CloseButtonProps` without a layering cycle), which widens `disabled` to Solid's
  // `boolean | ""`. It still carries the consumer's `size`/`icon`/etc. at runtime, so cast back to the
  // component surface for the spread. `render` is passed to `CloseButton` directly (not through the
  // spread) — it is read synchronously to build the element, so a reactive spread-read would trip
  // `STRICT_READ_UNTRACKED`.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
