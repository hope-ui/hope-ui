import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { isFunction } from "@/utils/assertion";

import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";

/**
 * PopoverAnchor is the element used as the positioning reference for the popover.
 */
export function PopoverAnchor<C extends ElementType>(props: HTMLHopeProps<C>) {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props as HTMLHopeProps<ElementType>, ["ref", "as"]);

  const assignRef = (el: HTMLElement) => {
    popoverContext.assignAnchorRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return <Dynamic component={local.as} ref={assignRef} {...others} />;
}
