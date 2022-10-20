import { createHopeComponent, hope } from "@hope-ui/styles";
import { callHandler } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { FocusTrapRegion } from "../focus-trap";
import { useDrawerContext } from "./drawer-context";

export interface DrawerContentProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * The drawer content wrapper.
 */
export const DrawerContent = createHopeComponent<"section", DrawerContentProps>(props => {
  const drawerContext = useDrawerContext();

  const [local, others] = splitProps(props, ["class", "style", "onClick"]);

  const onContentClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    event.stopPropagation();
    callHandler(local.onClick, event);
  };

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...drawerContext.contentTransition.style(),
  }));

  return (
    <FocusTrapRegion
      autoFocus
      restoreFocus
      trapFocus={drawerContext.trapFocus()}
      initialFocusSelector={drawerContext.initialFocusSelector()}
      restoreFocusSelector={drawerContext.restoreFocusSelector()}
      class={drawerContext.baseClasses().root}
      __css={drawerContext.styleOverrides().root}
      onMouseDown={drawerContext.onContainerMouseDown}
      onKeyDown={drawerContext.onContainerKeyDown}
      onClick={drawerContext.onContainerClick}
    >
      <hope.section
        id={drawerContext.contentId()}
        //tabIndex={-1}
        role="dialog"
        data-ismodal="true"
        aria-modal="true"
        aria-labelledby={drawerContext.headingId()}
        aria-describedby={drawerContext.descriptionId()}
        class={clsx(drawerContext.baseClasses().content, local.class)}
        style={computedStyle()}
        __css={drawerContext.styleOverrides().content}
        onClick={onContentClick}
        {...others}
      />
    </FocusTrapRegion>
  );
});
