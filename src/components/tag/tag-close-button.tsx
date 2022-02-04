import { mergeProps, splitProps } from "solid-js";

import { IconCross } from "@/icons";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tagCloseButtonIconStyles, tagCloseButtonStyles } from "./tag.styles";
import { useTag } from "./tag-provider";

export type TagCloseButtonProps<C extends ElementType> = HopeComponentProps<
  C,
  { "aria-label": string }
>;

const hopeTagCloseButtonClass = "hope-tag-close-button";

export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const tagContext = useTag();

  const defaultProps: TagCloseButtonProps<"button"> = {
    as: "button",
    type: "button",
    role: "button",
    "aria-label": "Close",
  };

  const propsWithDefault: TagCloseButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children", "borderRadius"]);

  const classes = () => classNames(local.class, hopeTagCloseButtonClass, tagCloseButtonStyles());

  const borderRadius = () => local.borderRadius ?? tagContext.borderRadius?.();

  return (
    <Box class={classes()} borderRadius={borderRadius()} {...others}>
      <IconCross class={tagCloseButtonIconStyles()} />
    </Box>
  );
}

TagCloseButton.toString = () => createCssSelector(hopeTagCloseButtonClass);
