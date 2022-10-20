import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

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

  createEffect(() => {
    modalContext.setHeadingId(`${modalContext.contentId()}-heading`);
    onCleanup(() => modalContext.setHeadingId(undefined));
  });

  return (
    <hope.h2
      id={modalContext.headingId()}
      class={clsx(modalContext.baseClasses().heading, local.class)}
      __css={modalContext.styleOverrides().heading}
      {...others}
    />
  );
});
