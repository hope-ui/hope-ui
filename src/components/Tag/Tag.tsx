import { JSX, mergeProps, splitProps } from "solid-js";
import { Show } from "solid-js/web";

import { StyledSystemVariants } from "@/styled-system/system.styles";
import { useTheme } from "@/theme/HopeProvider";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { tagStyles, TagVariants } from "./Tag.styles";
import { TagContextValue, TagProvider } from "./TagProvider";

export interface TagOptions extends Omit<TagVariants, "withLeftSection" | "withRightSection"> {
  leftSection?: JSX.Element;
  rightSection?: JSX.Element;
}

export type ThemeableTagOptions = Pick<TagOptions, "variant" | "colorScheme" | "size"> &
  Pick<StyledSystemVariants, "borderRadius">;

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
    borderRadius: theme?.defaultProps?.borderRadius ?? "full",
  };

  const propsWithDefault: TagProps<C> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    [...classPropsKeys, "leftSection", "rightSection", "children"],
    ["variant", "colorScheme", "size"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTagClass,
      baseClass: tagStyles({
        ...variantProps,
        withLeftSection: !!local.leftSection,
        withRightSection: !!local.rightSection,
      }),
      classProps: local,
    });
  };

  const shouldWrapChildrenInSpan = () => {
    return !!local.leftSection || !!local.rightSection;
  };

  const tagContextValue: () => TagContextValue = () => ({
    borderRadius: others.borderRadius ?? defaultProps.borderRadius,
  });

  return (
    <TagProvider contextValue={tagContextValue()}>
      <Box classList={classList()} {...others}>
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
