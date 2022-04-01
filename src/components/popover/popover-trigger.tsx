import { JSX, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";

export type PopoverTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopePopoverTriggerClass = "hope-popover__trigger";

/**
 * The trigger that toggles the popover.
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
    callHandler(local.onBlur)(event);

    //TODO: check if target is valid.

    if (popoverContext.state.opened && popoverContext.state.closeOnBlur) {
      popoverContext.closeWithDelay();
    }
  };

  // const onMouseEnter: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
  //   callAllHandlers(popoverContext.onTriggerMouseEnter, local.onMouseEnter)(event);
  // };

  // const onMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
  //   callAllHandlers(popoverContext.onTriggerMouseLeave, local.onMouseLeave)(event);
  // };

  const classes = () => classNames(local.class, hopePopoverTriggerClass);

  return (
    <hope.button
      ref={assignTriggerRef}
      id={popoverContext.state.triggerId}
      aria-haspopup="dialog"
      aria-controls={popoverContext.state.contentId}
      aria-expanded={popoverContext.state.opened}
      class={classes()}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      // onMouseEnter={onMouseEnter}
      // onMouseLeave={onMouseLeave}
      {...others}
    />
  );
}

PopoverTrigger.toString = () => createClassSelector(hopePopoverTriggerClass);
