import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from "./modal";
import { modalBodyStyles } from "./modal.styles";

const hopeModalBodyClass = "hope-modal__body";

/**
 * ModalBody houses the main content of the modal.
 */
export function ModalBody<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () =>
    classNames(
      local.class,
      hopeModalBodyClass,
      modalBodyStyles({
        scrollBehavior: modalContext.state.scrollBehavior,
      })
    );

  /**
   * Notify the modal context if this component was rendered or used
   * so we can append `aria-describedby` automatically
   */
  onMount(() => modalContext.setBodyMounted(true));
  onCleanup(() => modalContext.setBodyMounted(false));

  return <Box class={classes()} id={modalContext.state.bodyId} {...others} />;
}

ModalBody.toString = () => createClassSelector(hopeModalBodyClass);
