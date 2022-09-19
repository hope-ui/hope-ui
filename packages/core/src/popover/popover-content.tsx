import { createHopeComponent, useStyleConfigContext } from "@hope-ui/styles";
import { callHandler, mergeRefs } from "@hope-ui/utils";
import { clsx } from "clsx";
import { JSX, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { FocusTrapRegion } from "../focus-trap";
import { PopoverParts } from "./popover.styles";
import { PopoverArrow } from "./popover-arrow";
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
    "children",
    "onKeyDown",
    "onFocusOut",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const triggerOnHover = () => popoverContext.triggerMode() === "hover";

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    event.stopPropagation();
    callHandler(local.onKeyDown, event);
    callHandler(popoverContext.onContentKeyDown, event);
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
          id={popoverContext.popoverId()}
          role={triggerOnHover() ? "tooltip" : "dialog"}
          aria-labelledby={popoverContext.headingId()}
          aria-describedby={popoverContext.descriptionId()}
          trapFocus={popoverContext.trapFocus()}
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
        >
          <Show when={popoverContext.withArrow()}>
            <PopoverArrow />
          </Show>
          {local.children}
        </FocusTrapRegion>
      </Portal>
    </Show>
  );
});
