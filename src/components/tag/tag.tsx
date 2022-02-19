import { mergeProps, splitProps } from "solid-js";

import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useTheme } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tagStyles, TagVariants } from "./tag.styles";
import { TagProvider } from "./tag-provider";

export type ThemeableTagOptions = Pick<TagVariants, "variant" | "colorScheme" | "size">;

export type TagProps<C extends ElementType = "span"> = HopeComponentProps<C, TagVariants>;

const hopeTagClass = "hope-tag";

/**
 * Tag component is used for items that need to be labeled, categorized,
 * or organized using keywords that describe them.
 */
export function Tag<C extends ElementType = "span">(props: TagProps<C>) {
  const theme = useTheme().components.Tag;

  const defaultProps: TagProps<"span"> = {
    as: "span",
    variant: theme?.defaultProps?.variant ?? "subtle",
    colorScheme: theme?.defaultProps?.colorScheme ?? "neutral",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: TagProps<"span"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "colorScheme", "size", "dotPosition"]
  );

  const classes = () => classNames(local.class, hopeTagClass, tagStyles(variantProps));

  const borderRadius = () =>
    others.borderRadius ??
    (theme?.baseStyle?.borderRadius as ResponsiveValue<RadiiProps["borderRadius"]>);

  return (
    <TagProvider borderRadius={borderRadius()}>
      <Box class={classes()} __baseStyle={theme?.baseStyle} {...others} />
    </TagProvider>
  );
}

Tag.toString = () => createClassSelector(hopeTagClass);
