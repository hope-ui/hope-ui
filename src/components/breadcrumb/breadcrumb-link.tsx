import { Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { breadcrumbLinkStyles } from "./breadcrumb.styles";

export interface BreadcrumbLinkOptions {
  currentPage?: boolean;
}

export type BreadcrumbLinkProps<C extends ElementType = "a"> = HTMLHopeProps<C, BreadcrumbLinkOptions>;

const hopeBreadcrumbLinkClass = "hope-breadcrumb__link";

/**
 * Breadcrumb link.
 *
 * It renders a `span` when it matches the current link.
 * Otherwise, it renders an anchor tag.
 */
export function BreadcrumbLink<C extends ElementType = "a">(props: BreadcrumbLinkProps<C>) {
  const [local, others] = splitProps(props as BreadcrumbLinkProps<"a">, ["class", "currentPage", "href"]);

  const classes = () =>
    classNames(local.class, hopeBreadcrumbLinkClass, breadcrumbLinkStyles({ currentPage: local.currentPage }));

  return (
    <Show when={local.currentPage} fallback={<Box as="a" href={local.href} class={classes()} {...others} />}>
      <Box as="span" aria-current="page" class={classes()} {...others} />
    </Show>
  );
}

BreadcrumbLink.toString = () => createClassSelector(hopeBreadcrumbLinkClass);
