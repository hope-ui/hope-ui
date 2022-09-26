import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { ModalParts } from "./modal.styles";
import { useModalContext } from "./modal-context";

export interface ModalOverlayProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * `ModalOverlay` renders a backdrop that is typically displayed behind a modal.
 */
export const ModalOverlay = createHopeComponent<"div", ModalOverlayProps>(props => {
  const modalContext = useModalContext();

  const { baseClasses, styleOverrides } = useStyleConfigContext<ModalParts>();

  const [local, others] = splitProps(props, ["class", "style", "children"]);

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...modalContext.overlayTransition.style(),
  }));

  return (
    <hope.div
      role="presentation"
      class={clsx(baseClasses().overlay, local.class)}
      style={computedStyle()}
      __css={styleOverrides().overlay}
      {...others}
    />
  );
});
