import { createHopeComponent, useStyleConfigContext } from "@hope-ui/styles";
import { callHandler, mergeRefs } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { FocusTrapRegion } from "../focus-trap";
import { PopoverParts } from "./popover.styles";
import { PopoverArrow } from "./popover-arrow";
import { usePopoverContext } from "./popover-context";

export interface PopoverContentProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * The popover content wrapper.
 */
export const PopoverContent = createHopeComponent<"section", PopoverContentProps>(props => {
  const popoverContext = usePopoverContext();

  const { baseClasses, styleOverrides } = useStyleConfigContext<PopoverParts>();

  const [local, others] = splitProps(props, [
    "ref",
    "class",
    "style",
    "children",
    "onKeyDown",
    "onFocusOut",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const triggerOnClick = () => popoverContext.triggerMode() === "click";
  const triggerOnHover = () => popoverContext.triggerMode() === "hover";

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    event.stopPropagation();
    callHandler(local.onKeyDown, event);
    callHandler(popoverContext.onContentKeyDown, event);
  };

  const onFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callHandler(local.onFocusOut, event);
    callHandler(popoverContext.onContentFocusOut, event);
  };

  const onMouseEnter: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseEnter, event);

    if (triggerOnHover()) {
      popoverContext.onContentMouseEnter();
    }
  };

  const onMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseLeave, event);

    if (triggerOnHover()) {
      callHandler(popoverContext.onContentMouseLeave, event);
    }
  };

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...popoverContext.popoverTransition.style(),
  }));

  return (
    <Show when={popoverContext.popoverTransition.keepMounted()}>
      <Portal>
        <FocusTrapRegion
          as="section"
          autoFocus
          restoreFocus={triggerOnClick()}
          ref={mergeRefs(popoverContext.setContentRef, local.ref)}
          id={popoverContext.popoverId()}
          role={triggerOnHover() ? "tooltip" : "dialog"}
          aria-labelledby={popoverContext.headingId()}
          aria-describedby={popoverContext.descriptionId()}
          trapFocus={popoverContext.trapFocus()}
          initialFocusSelector={popoverContext.initialFocusSelector()}
          restoreFocusSelector={popoverContext.restoreFocusSelector()}
          class={clsx(baseClasses().root, local.class)}
          style={computedStyle()}
          __css={styleOverrides().root}
          onKeyDown={onKeyDown}
          onFocusOut={onFocusOut}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
