import { Property } from "csstype";

import { SpaceScaleValue } from "@/styled-system/types";
import { ElementType, HTMLHopeProps } from "../types";
import { classNames, createClassSelector } from "@/utils/css";
import { children, createMemo, mergeProps, splitProps } from "solid-js";
import { isArray } from "@/utils/assertion";

interface AvatarGroupOptions {
  /**
   * The space between the avatars in the group.
   */
  spacing?: Property.Margin<SpaceScaleValue>;

  /**
   * The maximum number of visible avatars
   */
  max?: number;
}

export type AvatarGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, AvatarGroupOptions>;

const hopeAvatarGroupClass = "hope-avatar__group";

/**
 * AvatarGroup displays a number of avatars grouped together in a stack.
 */
export function AvatarGroup<C extends ElementType = "div">(props: AvatarGroupProps<C>) {
  const defaultProps: AvatarGroupProps<"div"> = {
    spacing: "-0.75rem",
    borderRadius: "$full",
  };

  const propsWithDefaults: AvatarGroupProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, [
    "class",
    "children",
    "max",
    "spacing",
    "borderColor",
    "borderRadius",
  ]);

  const classes = () => classNames(local.class, hopeAvatarGroupClass);

  const resolvedChildren = children(() => local.children);
  const childrenElements = () => resolvedChildren() as Element[];

  // Get the avatars within the max
  const childrenWithinMax = createMemo(() => {
    return local.max ? childrenElements().slice(0, local.max) : childrenElements();
  });

  /**
   * Reversing the children is a great way to avoid using zIndex
   * to overlap the avatars
   */
  const reversedChildren = createMemo(() => childrenWithinMax().reverse());

  // Get the remaining avatar count
  const excess = createMemo(() => {
    local.max != null && childrenElements().length - local.max;
  });
}

AvatarGroup.toString = () => createClassSelector(hopeAvatarGroupClass);
