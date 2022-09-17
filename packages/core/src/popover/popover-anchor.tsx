import { createHopeComponent, hope } from "@hope-ui/styles";
import { mergeRefs } from "@hope-ui/utils";
import { splitProps } from "solid-js";

import { usePopoverContext } from "./popover-context";

/**
 * PopoverAnchor is the element used as the positioning reference for the popover.
 * It renders a `div` by default.
 */
export const PopoverAnchor = createHopeComponent<"div">(props => {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["ref"]);

  return <hope.div ref={mergeRefs(popoverContext.setAnchorRef, local.ref)} {...others} />;
});
