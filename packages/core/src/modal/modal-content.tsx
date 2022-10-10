import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { callHandler } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { FocusTrapRegion } from "../focus-trap";
import { ModalParts } from "./modal.styles";
import { useModalContext } from "./modal-context";

export interface ModalContentProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * The modal content wrapper.
 */
export const ModalContent = createHopeComponent<"section", ModalContentProps>(props => {
  const modalContext = useModalContext();

  const { baseClasses, styleOverrides } = useStyleConfigContext<ModalParts>();

  const [local, others] = splitProps(props, ["class", "style", "onClick"]);

  const onContentClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    event.stopPropagation();
    callHandler(local.onClick, event);
  };

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...modalContext.contentTransition.style(),
  }));

  return (
    <FocusTrapRegion
      autoFocus
      restoreFocus
      trapFocus={modalContext.trapFocus()}
      initialFocusSelector={modalContext.initialFocusSelector()}
      restoreFocusSelector={modalContext.restoreFocusSelector()}
      class={baseClasses().root}
      __css={styleOverrides().root}
      onMouseDown={modalContext.onContainerMouseDown}
      onKeyDown={modalContext.onContainerKeyDown}
      onClick={modalContext.onContainerClick}
    >
      <hope.section
        id={modalContext.contentId()}
        //tabIndex={-1}
        role="dialog"
        data-ismodal="true"
        aria-modal="true"
        aria-labelledby={modalContext.headingId()}
        aria-describedby={modalContext.descriptionId()}
        class={clsx(baseClasses().content, local.class)}
        style={computedStyle()}
        __css={styleOverrides().content}
        onClick={onContentClick}
        {...others}
      />
    </FocusTrapRegion>
  );
});
