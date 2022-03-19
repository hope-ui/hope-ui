import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useBreadcrumbContext } from "./breadcrumb";
import { breadcrumbItemStyles } from "./breadcrumb.styles";

export type BreadcrumbItemProps<C extends ElementType = "li"> = HTMLHopeProps<C>;

const hopeBreadcrumbItemClass = "hope-breadcrumb__item";

/**
 * BreadcrumbItem is used to group a breadcrumb link and separator.
 * It renders a `li` element to denote it belongs to an order list of links.
 */
export function BreadcrumbItem<C extends ElementType = "li">(props: BreadcrumbItemProps<C>) {
  const theme = useComponentStyleConfigs().Breadcrumb;

  const breadcrumbContext = useBreadcrumbContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeBreadcrumbItemClass, breadcrumbItemStyles());
  };

  return (
    <hope.li class={classes()} __baseStyle={theme?.baseStyle?.item} gap={breadcrumbContext.state.spacing} {...others} />
  );
}

BreadcrumbItem.toString = () => createClassSelector(hopeBreadcrumbItemClass);
