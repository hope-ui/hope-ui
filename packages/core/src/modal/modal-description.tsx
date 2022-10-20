import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { useModalContext } from "./modal-context";

/**
 * `ModalDescription` renders a description in a modal dialog.
 * This component must be wrapped with `Modal`,
 * so the `aria-describedby` prop is properly set on the modal dialog element.
 *
 * It renders a `p` by default.
 */
export const ModalDescription = createHopeComponent<"p">(props => {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  createEffect(() => {
    modalContext.setDescriptionId(`${modalContext.contentId()}-description`);
    onCleanup(() => modalContext.setDescriptionId(undefined));
  });

  return (
    <hope.p
      id={modalContext.descriptionId()}
      class={clsx(modalContext.baseClasses().description, local.class)}
      __css={modalContext.styleOverrides().description}
      {...others}
    />
  );
});
