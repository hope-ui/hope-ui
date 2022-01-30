import { JSX, mergeProps, splitProps } from "solid-js";
import { Dynamic, Show } from "solid-js/web";

import { useTheme } from "@/contexts/HopeContext";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { tagStyles, TagVariants } from "./Tag.styles";
import { TagContextProvider, TagContextValue } from "./TagContext";

export interface TagOptions extends Omit<TagVariants, "withLeftSection" | "withRightSection"> {
  leftSection?: JSX.Element;
  rightSection?: JSX.Element;
}

export type ThemeableTagOptions = Pick<
  TagOptions,
  "variant" | "colorScheme" | "size" | "borderRadius"
>;

export type TagProps<C extends ElementType = "span"> = PolymorphicComponentProps<C, TagOptions>;

const hopeTagClass = "hope-tag";

/**
 * Tag component is used for items that need to be labeled, categorized,
 * or organized using keywords that describe them.
 */
export function Tag<C extends ElementType = "span">(props: TagProps<C>) {
  const theme = useTheme().components.Tag;

  const defaultProps: TagProps<"span"> = {
    as: "span",
    variant: theme?.defaultProps?.variant ?? "light",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    borderRadius: theme?.defaultProps?.borderRadius ?? "full",
  };

  const propsWithDefault: TagProps<C> = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    propsWithDefault,
    [...commonProps, "leftSection", "rightSection", "children"],
    [...boxPropNames, "css", "variant", "colorScheme", "size"]
  );

  const classList = () => {
    return generateClassList({
      hopeClass: hopeTagClass,
      baseClass: tagStyles({
        ...styleProps,
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
    borderRadius: styleProps.borderRadius ?? defaultProps.borderRadius,
  });

  return (
    <TagContextProvider contextValue={tagContextValue()}>
      <Dynamic component={local.as} classList={classList()} {...others}>
        <Show when={local.leftSection}>{local.leftSection}</Show>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
        <Show when={local.rightSection}>{local.rightSection}</Show>
      </Dynamic>
    </TagContextProvider>
  );
}

Tag.toString = () => createCssSelector(hopeTagClass);
