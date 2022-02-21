import { splitProps } from "solid-js";

import { MarginProps } from "@/styled-system/props/margin";
import { ResponsiveValue } from "@/styled-system/types";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { breadcrumbSeparatorStyles } from "./breadcrumb.styles";

export interface BreadcrumbSeparatorOptions {
  /**
   * The left and right margin applied to the separator
   */
  spacing?: ResponsiveValue<MarginProps["mx"]>;
}

export type BreadcrumbSeparatorProps<C extends ElementType = "span"> = HopeComponentProps<
  C,
  BreadcrumbSeparatorOptions
>;

const hopeBreadcrumbSeparatorClass = "hope-breadcrumb__separator";

/**
 * Component that separates each breadcrumb link.
 */
export function BreadcrumbSeparator<C extends ElementType = "span">(props: BreadcrumbSeparatorProps<C>) {
  const [local, others] = splitProps(props, ["class", "spacing"]);

  const classes = () => {
    return classNames(local.class, hopeBreadcrumbSeparatorClass, breadcrumbSeparatorStyles());
  };

  return <Box as="span" role="presentation" class={classes()} mx={local.spacing} {...others} />;
}

BreadcrumbSeparator.toString = () => createClassSelector(hopeBreadcrumbSeparatorClass);
