import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box, ElementType, HopeComponentProps } from "..";
import { modalOverlayStyles } from "./modal.styles";

const hopeModalOverlayClass = "hope-modal__overlay";

/**
 * ModalOverlay renders a backdrop behind the modal.
 */
export function ModalOverlay<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalOverlayClass, modalOverlayStyles());

  return <Box class={classes()} {...others} />;
}

ModalOverlay.toString = () => createCssSelector(hopeModalOverlayClass);
