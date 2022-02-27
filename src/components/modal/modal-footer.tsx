import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { modalFooterStyles } from "./modal.styles";
import { useComponentStyleConfigs } from "@/theme/provider";

export type ModalFooterProps<C extends ElementType = "footer"> = HTMLHopeProps<C>;

const hopeModalFooterClass = "hope-modal__footer";

/**
 * ModalFooter houses the action buttons of the modal.
 */
export function ModalFooter<C extends ElementType = "footer">(props: ModalFooterProps<C>) {
  const theme = useComponentStyleConfigs().Modal;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalFooterClass, modalFooterStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.footer} {...others} />;
}

ModalFooter.toString = () => createClassSelector(hopeModalFooterClass);
