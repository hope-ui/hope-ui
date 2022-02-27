import { mergeProps, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tagStyles, TagVariants } from "./tag.styles";

type ThemeableTagOptions = Pick<TagVariants, "variant" | "colorScheme" | "size">;

export interface TagStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    icon?: SystemStyleObject;
    label?: SystemStyleObject;
    closeButton?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableTagOptions;
  };
}

export type TagProps<C extends ElementType = "span"> = HTMLHopeProps<C, TagVariants>;

const hopeTagClass = "hope-tag";

/**
 * Tag component is used for items that need to be labeled, categorized,
 * or organized using keywords that describe them.
 */
export function Tag<C extends ElementType = "span">(props: TagProps<C>) {
  const theme = useComponentStyleConfigs().Tag;

  const defaultProps: TagProps<"span"> = {
    as: "span",
    variant: theme?.defaultProps?.root?.variant ?? "subtle",
    colorScheme: theme?.defaultProps?.root?.colorScheme ?? "neutral",
    size: theme?.defaultProps?.root?.size ?? "md",
  };

  const propsWithDefault: TagProps<"span"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "colorScheme", "size", "dotPosition"]
  );

  const classes = () => classNames(local.class, hopeTagClass, tagStyles(variantProps));

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />;
}

Tag.toString = () => createClassSelector(hopeTagClass);
