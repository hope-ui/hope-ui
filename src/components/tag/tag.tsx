import { JSX, mergeProps, splitProps } from "solid-js";
import { Show } from "solid-js/web";

import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { tagStyles, TagVariants } from "./tag.styles";
import { TagProvider } from "./tag-provider";

export interface TagOptions extends Omit<TagVariants, "withLeftSection" | "withRightSection"> {
  leftSection?: JSX.Element;
  rightSection?: JSX.Element;
}

export type ThemeableTagOptions = Pick<TagOptions, "variant" | "colorScheme" | "size">;

export type TagProps<C extends ElementType> = HopeComponentProps<C, TagOptions>;

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
    ["class", "leftSection", "rightSection", "children"],
    ["variant", "colorScheme", "size"]
  );

  const classes = () =>
    classNames(
      local.class,
      hopeTagClass,
      tagStyles({
        ...variantProps,
        withLeftSection: !!local.leftSection,
        withRightSection: !!local.rightSection,
      })
    );

  const shouldWrapChildrenInSpan = () => {
    return !!local.leftSection || !!local.rightSection;
  };

  const borderRadius = () =>
    others.borderRadius ??
    (theme?.baseStyle?.borderRadius as ResponsiveValue<RadiiProps["borderRadius"]>);

  return (
    <TagProvider borderRadius={borderRadius()}>
      <Box class={classes()} __baseStyle={theme?.baseStyle} {...others}>
        <Show when={local.leftSection}>{local.leftSection}</Show>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
        <Show when={local.rightSection}>{local.rightSection}</Show>
      </Box>
    </TagProvider>
  );
}

Tag.toString = () => createCssSelector(hopeTagClass);
