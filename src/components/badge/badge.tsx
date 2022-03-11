import { mergeProps, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { badgeStyles, BadgeVariants } from "./badge.styles";

type ThemeableBadgeOptions = Pick<BadgeVariants, "variant" | "colorScheme">;

export interface BadgeStyleConfig {
  baseStyle?: SystemStyleObject;
  defaultProps?: ThemeableBadgeOptions;
}

export type BadgeProps<C extends ElementType = "span"> = HTMLHopeProps<C, BadgeVariants>;

const hopeBadgeClass = "hope-badge";

/**
 * Badges are used to highlight an item's status for quick recognition.
 */
export function Badge<C extends ElementType = "span">(props: BadgeProps<C>) {
  const theme = useComponentStyleConfigs().Badge;

  const defaultProps: BadgeProps<"span"> = {
    as: "span",
    variant: theme?.defaultProps?.variant ?? "subtle",
    colorScheme: theme?.defaultProps?.colorScheme ?? "neutral",
  };

  const propsWithDefault: BadgeProps<"span"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(propsWithDefault, ["class"], ["variant", "colorScheme"]);

  const classes = () => classNames(local.class, hopeBadgeClass, badgeStyles(variantProps));

  return <Box class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

Badge.toString = () => createClassSelector(hopeBadgeClass);
