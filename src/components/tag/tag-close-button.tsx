import { mergeProps, splitProps } from "solid-js";

import { IconClose } from "@/components/icons/IconClose";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tagCloseButtonStyles } from "./tag.styles";

export type TagCloseButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, { "aria-label"?: string }>;

const hopeTagCloseButtonClass = "hope-tag-close-button";

/**
 * TagCloseButton is used to close "remove" the tag
 */
export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const theme = useComponentStyleConfigs().Tag;

  const defaultProps: TagCloseButtonProps<"button"> = {
    as: "button",
    type: "button",
    role: "button",
    "aria-label": "Close",
  };

  const propsWithDefault: TagCloseButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children", "borderRadius"]);

  const classes = () => classNames(local.class, hopeTagCloseButtonClass, tagCloseButtonStyles());

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle?.closeButton} {...others}>
      <IconClose />
    </Box>
  );
}

TagCloseButton.toString = () => createClassSelector(hopeTagCloseButtonClass);
