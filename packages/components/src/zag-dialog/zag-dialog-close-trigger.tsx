import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import { cx } from "@hope-ui/theming";
import { type Component, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

// A `CloseButton` with the machine's close wiring — so it inherits `size`/`icon`/`render`/`class`/
// `slotClasses`/native attrs for free, and shows the themed X by default. Because it renders a
// recipe-styled `CloseButton`, it **requires a `<ThemeProvider>`** ancestor.
export interface ZagDialogCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<ZagDialogCloseTriggerProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "class", "id");

  const elementProps = mergePartProps(
    () => ctx.api().getCloseTriggerProps(),
    () => rest,
    {
      get class(): string {
        // Placement from the dialog recipe's `closeTrigger` slot, merged with any consumer `class`
        // (which wins via tailwind-merge inside CloseButton's own `class` seam), over CloseButton's
        // chrome.
        return cx(ctx.slots.closeTrigger(), props.class) ?? "";
      },
      // Re-scope CloseButton's root marker to this part (overrides its `close-button` default).
      "data-slot": "zag-dialog-close-trigger",
    },
  );

  // `render` is passed to `CloseButton` directly (not through the spread) — it is read synchronously
  // to build the element, so a reactive spread-read would trip `STRICT_READ_UNTRACKED`.
  return <CloseButton {...(elementProps as CloseButtonProps)} render={props.render} />;
};
