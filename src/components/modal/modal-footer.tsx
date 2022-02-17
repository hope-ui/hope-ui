import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { modalFooterStyles } from "./modal.styles";

const hopeModalFooterClass = "hope-modal__footer";

/**
 * ModalFooter houses the action buttons of the modal.
 */
export function ModalFooter<C extends ElementType = "footer">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalFooterClass, modalFooterStyles());

  return <Box class={classes()} {...others} />;
}

ModalFooter.toString = () => createClassSelector(hopeModalFooterClass);
