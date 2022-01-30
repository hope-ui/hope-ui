import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { IconCross } from "@/icons";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import {
  tagCloseButtonIconStyles,
  tagCloseButtonStyles,
  TagCloseButtonVariants,
} from "./Tag.styles";
import { useTagContext } from "./TagContext";

export interface TagCloseButtonOptions extends TagCloseButtonVariants {
  "aria-label": string;
}

export type TagCloseButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  TagCloseButtonOptions
>;

const hopeTagCloseButtonClass = "hope-tag-close-button";

export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const tagContext = useTagContext();

  const defaultProps: TagCloseButtonProps<"button"> = {
    as: "button",
    type: "button",
    role: "button",
    "aria-label": "Close",
    borderRadius: tagContext.borderRadius,
  };

  const propsWithDefault: TagCloseButtonProps<C> = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    propsWithDefault,
    [...commonProps, "children"],
    [...boxPropNames, "css"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTagCloseButtonClass,
      baseClass: tagCloseButtonStyles(styleProps),
      classProps: local,
    });
  };

  return (
    <Dynamic component={local.as} classList={classList()} {...others}>
      <IconCross class={tagCloseButtonIconStyles()} />
    </Dynamic>
  );
}

TagCloseButton.toString = () => createCssSelector(hopeTagCloseButtonClass);
