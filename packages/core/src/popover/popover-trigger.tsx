import { createHopeComponent, hope } from "@hope-ui/styles";
import { callHandler, mergeRefs } from "@hope-ui/utils";
import { JSX, splitProps } from "solid-js";

import { usePopoverContext } from "./popover-context";

/**
 * PopoverTrigger opens the popover's content, it renders a `button` by default.
 * It must be an interactive element.
 */
export const PopoverTrigger = createHopeComponent<"button">(props => {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, [
    "ref",
    "onClick",
    "onKeyDown",
    "onFocus",
    "onBlur",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const triggerOnClick = () => popoverContext.triggerMode() === "click";
  const triggerOnHover = () => popoverContext.triggerMode() === "hover";

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    callHandler(local.onClick, event);
    popoverContext.onTriggerClick();
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = event => {
    callHandler(local.onKeyDown, event);
    callHandler(popoverContext.onTriggerKeyDown, event);
  };

  const onMouseEnter: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    callHandler(local.onMouseEnter, event);
    popoverContext.onTriggerMouseEnter();
  };

  const onMouseLeave: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    callHandler(local.onMouseLeave, event);
    popoverContext.onTriggerMouseLeave();
  };

  const onFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    callHandler(local.onFocus, event);
    popoverContext.onTriggerFocus();
  };

  const onBlur: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    callHandler(local.onBlur, event);
    callHandler(popoverContext.onTriggerBlur, event);
  };

  return (
    <hope.button
      ref={mergeRefs(popoverContext.setTriggerRef, local.ref)}
      id={popoverContext.triggerId()}
      type="button"
      aria-haspopup="dialog"
      aria-controls={popoverContext.contentId()}
      aria-expanded={popoverContext.isOpen()}
      onClick={triggerOnClick() ? onClick : undefined}
      onKeyDown={triggerOnHover() ? onKeyDown : undefined}
      onFocus={triggerOnHover() ? onFocus : undefined}
      onBlur={triggerOnHover() ? onBlur : undefined}
      onMouseEnter={triggerOnHover() ? onMouseEnter : undefined}
      onMouseLeave={triggerOnHover() ? onMouseLeave : undefined}
      {...others}
    />
  );
});
