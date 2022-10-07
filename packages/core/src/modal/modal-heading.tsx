import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { ModalParts } from "./modal.styles";
import { useModalContext } from "./modal-context";

/**
 * `ModalHeading` renders a heading in a modal dialog.
 * This component must be wrapped with `Modal`,
 * so the `aria-labelledby` prop is properly set on the modal dialog element.
 *
 * It renders an `h2` by default.
 */
export const ModalHeading = createHopeComponent<"h2">(props => {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const { baseClasses, styleOverrides } = useStyleConfigContext<ModalParts>();

  createEffect(() => {
    modalContext.setHeadingId(`${modalContext.contentId()}-heading`);
    onCleanup(() => modalContext.setHeadingId(undefined));
  });

  return (
    <hope.h2
      id={modalContext.headingId()}
      class={clsx(baseClasses().heading, local.class)}
      __css={styleOverrides().heading}
      {...others}
    />
  );
});
