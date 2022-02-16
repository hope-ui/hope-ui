import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
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

ModalOverlay.toString = () => createClassSelector(hopeModalOverlayClass);
