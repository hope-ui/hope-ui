import { JSX, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { callAllHandlers, callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";

export type PopoverTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

/**
 * PopoverTrigger opens the popover's content.
 * It must be an interactive element.
 * It renders a `button` by edfault.
 */
export function PopoverTrigger<C extends ElementType = "button">(props: PopoverTriggerProps<C>) {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props as PopoverTriggerProps<ElementType>, [
    "ref",
    "onClick",
    "onKeyDown",
    "onFocus",
    "onBlur",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const assignTriggerRef = (el: HTMLElement) => {
    popoverContext.assignTriggerRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onClick)(event);

    popoverContext.state.opened ? popoverContext.closeWithDelay() : popoverContext.openWithDelay();
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    callHandler(local.onKeyDown)(event);

    if (event.key === "Escape") {
      popoverContext.closeWithDelay();
    }
  };

  const onFocus: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callHandler(local.onFocus)(event);

    popoverContext.openWithDelay();
  };

  const onBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callAllHandlers(local.onBlur, popoverContext.onTriggerBlur)(event);
  };

  const onMouseEnter: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseEnter)(event);

    popoverContext.setIsHovering(true);
    popoverContext.openWithDelay();
  };

  const onMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseLeave)(event);

    popoverContext.onTriggerMouseLeave();
  };

  return (
    <hope.button
      ref={assignTriggerRef}
      id={popoverContext.state.triggerId}
      aria-haspopup="dialog"
      aria-controls={popoverContext.state.contentId}
      aria-expanded={popoverContext.state.opened}
      onClick={popoverContext.state.triggerOnClick ? onClick : undefined}
      onKeyDown={popoverContext.state.triggerOnHover ? onKeyDown : undefined}
      onFocus={popoverContext.state.triggerOnHover ? onFocus : undefined}
      onBlur={popoverContext.state.triggerOnHover ? onBlur : undefined}
      onMouseEnter={popoverContext.state.triggerOnHover ? onMouseEnter : undefined}
      onMouseLeave={popoverContext.state.triggerOnHover ? onMouseLeave : undefined}
      {...others}
    />
  );
}
