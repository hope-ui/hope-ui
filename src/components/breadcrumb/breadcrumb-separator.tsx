import { splitProps } from "solid-js";

import { MarginProps } from "@/styled-system/props/margin";
import { ResponsiveValue } from "@/styled-system/types";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { breadcrumbSeparatorStyles } from "./breadcrumb.styles";

export interface BreadcrumbSeparatorOptions {
  /**
   * The left and right margin applied to the separator
   */
  spacing?: ResponsiveValue<MarginProps["mx"]>;
}

export type BreadcrumbSeparatorProps<C extends ElementType = "span"> = HTMLHopeProps<C, BreadcrumbSeparatorOptions>;

const hopeBreadcrumbSeparatorClass = "hope-breadcrumb__separator";

/**
 * Component that separates each breadcrumb link.
 */
export function BreadcrumbSeparator<C extends ElementType = "span">(props: BreadcrumbSeparatorProps<C>) {
  const theme = useComponentStyleConfigs().Breadcrumb;

  const [local, others] = splitProps(props, ["class", "spacing"]);

  const classes = () => {
    return classNames(local.class, hopeBreadcrumbSeparatorClass, breadcrumbSeparatorStyles());
  };

  return (
    <Box
      as="span"
      role="presentation"
      class={classes()}
      __baseStyle={theme?.baseStyle?.separator}
      mx={local.spacing}
      {...others}
    />
  );
}

BreadcrumbSeparator.toString = () => createClassSelector(hopeBreadcrumbSeparatorClass);
