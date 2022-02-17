import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from "./modal";
import { modalHeaderStyles } from "./modal.styles";

const hopeModalHeaderClass = "hope-modal__header";

/**
 * ModalHeader houses the title of the modal.
 */
export function ModalHeader<C extends ElementType = "header">(props: HopeComponentProps<C>) {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalHeaderClass, modalHeaderStyles());

  /**
   * Notify the modal context if this component was rendered or used
   * so we can append `aria-labelledby` automatically
   */
  onMount(() => modalContext.setHeaderMounted(true));
  onCleanup(() => modalContext.setHeaderMounted(false));

  return <Box class={classes()} id={modalContext.state.headerId} {...others} />;
}

ModalHeader.toString = () => createClassSelector(hopeModalHeaderClass);
