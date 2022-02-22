import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { breadcrumbItemStyles } from "./breadcrumb.styles";

export type BreadcrumbItemProps<C extends ElementType = "li"> = HTMLHopeProps<C>;

const hopeBreadcrumbItemClass = "hope-breadcrumb__item";

/**
 * BreadcrumbItem is used to group a breadcrumb link.
 * It renders a `li` element to denote it belongs to an order list of links.
 */
export function BreadcrumbItem<C extends ElementType = "li">(props: BreadcrumbItemProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeBreadcrumbItemClass, breadcrumbItemStyles());
  };

  return <Box as="li" class={classes()} {...others} />;
}

BreadcrumbItem.toString = () => createClassSelector(hopeBreadcrumbItemClass);
