import { JSX, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers, callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";

export type PopoverTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopePopoverTriggerClass = "hope-popover__trigger";

/**
 * PopoverTrigger opens the popover's content. It must be an interactive element
 * and renders a `button` by edfault.
 */
export function PopoverTrigger<C extends ElementType = "button">(props: PopoverTriggerProps<C>) {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props as PopoverTriggerProps<ElementType>, [
    "ref",
    "class",
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

  const classes = () => classNames(local.class, hopePopoverTriggerClass);

  return (
    <hope.button
      ref={assignTriggerRef}
      id={popoverContext.state.triggerId}
      aria-haspopup="dialog"
      aria-controls={popoverContext.state.contentId}
      aria-expanded={popoverContext.state.opened}
      class={classes()}
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

PopoverTrigger.toString = () => createClassSelector(hopePopoverTriggerClass);
