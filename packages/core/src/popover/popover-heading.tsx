import { createHopeComponent, hope } from "@hope-ui/styles";
import { createEffect, onCleanup } from "solid-js";

import { usePopoverContext } from "./popover-context";

/**
 * PopoverHeading renders a heading in a popover.
 * This component must be wrapped with `Popover`,
 * so the `aria-labelledby` prop is properly set on the popover element.
 *
 * It renders an `h2` by default.
 */
export const PopoverHeading = createHopeComponent<"h2">(props => {
  const popoverContext = usePopoverContext();

  createEffect(() => {
    popoverContext.setHeadingId(`${popoverContext.popoverId()}-heading`);
    onCleanup(() => popoverContext.setHeadingId(undefined));
  });

  return <hope.h2 id={popoverContext.headingId()} {...props} />;
});
