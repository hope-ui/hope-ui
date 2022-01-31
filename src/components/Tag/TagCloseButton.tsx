import { mergeProps, splitProps } from "solid-js";

import { IconCross } from "@/icons";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { tagCloseButtonIconStyles, tagCloseButtonStyles } from "./Tag.styles";
import { useTag } from "./TagProvider";

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
    borderRadius: tagContext.borderRadius,
  };

  const propsWithDefault: TagCloseButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [...classPropsKeys, "children"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTagCloseButtonClass,
      baseClass: tagCloseButtonStyles(),
      classProps: local,
    });
  };

  return (
    <Box classList={classList()} {...others}>
      <IconCross class={tagCloseButtonIconStyles()} />
    </Box>
  );
}

TagCloseButton.toString = () => createCssSelector(hopeTagCloseButtonClass);
