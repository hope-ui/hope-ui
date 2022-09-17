import { createHopeComponent, hope } from "@hope-ui/styles";
import { createEffect, onCleanup } from "solid-js";

import { usePopoverContext } from "./popover-context";

/**
 * PopoverDescription renders a description in a popover.
 * This component must be wrapped with `Popover`,
 * so the `aria-describedby` prop is properly set on the popover element.
 *
 * It renders a `p` by default.
 */
export const PopoverDescription = createHopeComponent<"p">(props => {
  const popoverContext = usePopoverContext();

  createEffect(() => {
    popoverContext.setDescriptionId(`${popoverContext.popoverId()}-description`);
    onCleanup(() => popoverContext.setDescriptionId(undefined));
  });

  return <hope.p id={popoverContext.descriptionId()} {...props} />;
});
