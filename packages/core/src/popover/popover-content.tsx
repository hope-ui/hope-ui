import { createHopeComponent, useStyleConfigContext } from "@hope-ui/styles";
import { callHandler, mergeRefs } from "@hope-ui/utils";
import { clsx } from "clsx";
import { JSX, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { FocusTrapRegion } from "../focus-trap";
import { PopoverParts } from "./popover.styles";
import { usePopoverContext } from "./popover-context";

/**
 * The popover content wrapper.
 */
export const PopoverContent = createHopeComponent<"section">(props => {
  const popoverContext = usePopoverContext();

  const { baseClasses, styleOverrides } = useStyleConfigContext<PopoverParts>();

  const [local, others] = splitProps(props, [
    "ref",
    "class",
    "onKeyDown",
    "onFocusOut",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const triggerOnHover = () => popoverContext.triggerMode() === "hover";

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (popoverContext.closeOnEsc() && event.key === "Escape") {
      popoverContext.closeWithDelay();
    }

    callHandler(local.onKeyDown, event);
  };

  const onMouseEnter: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseEnter, event);
    popoverContext.onContentMouseEnter();
  };

  const onMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseLeave, event);
    popoverContext.onContentMouseLeave();
  };

  const onFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callHandler(local.onFocusOut, event);
    callHandler(popoverContext.onContentFocusOut, event);
  };

  return (
    <Show when={popoverContext.isOpen()}>
      <Portal>
        <FocusTrapRegion
          as="section"
          ref={mergeRefs(popoverContext.setContentRef, local.ref)}
          id={popoverContext.contentId()}
          role={triggerOnHover() ? "tooltip" : "dialog"}
          aria-labelledby={popoverContext.hasHeading() ? popoverContext.headingId() : undefined}
          aria-describedby={
            popoverContext.hasDescription() ? popoverContext.descriptionId() : undefined
          }
          isDisabled={!popoverContext.trapFocus()}
          initialFocusSelector={popoverContext.initialFocusSelector()}
          finalFocusSelector={popoverContext.finalFocusSelector()}
          autoFocus={popoverContext.autoFocus()}
          restoreFocus={popoverContext.restoreFocus()}
          class={clsx(baseClasses().root, local.class)}
          __css={styleOverrides().root}
          onKeyDown={onKeyDown}
          onFocusOut={onFocusOut}
          onMouseEnter={triggerOnHover() ? onMouseEnter : undefined}
          onMouseLeave={triggerOnHover() ? onMouseLeave : undefined}
          {...others}
        />
      </Portal>
    </Show>
  );
});
