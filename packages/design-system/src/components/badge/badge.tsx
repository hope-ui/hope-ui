import { mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { badgeStyles, BadgeVariants } from "./badge.styles";

type ThemeableBadgeOptions = Pick<BadgeVariants, "variant" | "colorScheme">;

export type BadgeStyleConfig = SinglePartComponentStyleConfig<ThemeableBadgeOptions>;

export type BadgeProps<C extends ElementType = "span"> = HTMLHopeProps<C, BadgeVariants>;

const hopeBadgeClass = "hope-badge";

/**
 * Badges are used to highlight an item's status for quick recognition.
 */
export function Badge<C extends ElementType = "span">(props: BadgeProps<C>) {
  const theme = useStyleConfig().Badge;

  const defaultProps: BadgeProps<"span"> = {
    variant: theme?.defaultProps?.variant ?? "subtle",
    colorScheme: theme?.defaultProps?.colorScheme ?? "neutral",
  };

  const propsWithDefault: BadgeProps<"span"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "colorScheme"]
  );

  const classes = () => classNames(local.class, hopeBadgeClass, badgeStyles(variantProps));

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

Badge.toString = () => createClassSelector(hopeBadgeClass);
