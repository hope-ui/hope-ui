import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { ModalParts } from "./modal.styles";
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

  const { baseClasses, styleOverrides } = useStyleConfigContext<ModalParts>();

  createEffect(() => {
    modalContext.setDescriptionId(`${modalContext.contentId()}-description`);
    onCleanup(() => modalContext.setDescriptionId(undefined));
  });

  return (
    <hope.p
      id={modalContext.descriptionId()}
      class={clsx(baseClasses().description, local.class)}
      __css={styleOverrides().description}
      {...others}
    />
  );
});
