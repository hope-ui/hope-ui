import { Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { anchorStyles } from "../anchor/anchor.styles";
import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";

interface BreadcrumbLinkOptions {
  currentPage?: boolean;
}

export type BreadcrumbLinkProps<C extends ElementType = "a"> = HopeComponentProps<
  C,
  BreadcrumbLinkOptions
>;

const hopeBreadcrumbLinkClass = "hope-breadcrumb__link";

/**
 * Breadcrumb link.
 *
 * It renders a `span` when it matches the current link.
 * Otherwise, it renders an anchor tag.
 */
export function BreadcrumbLink<C extends ElementType = "a">(props: BreadcrumbLinkProps<C>) {
  const [local, others] = splitProps(props as BreadcrumbLinkProps<"a">, [
    "class",
    "currentPage",
    "href",
  ]);

  const classes = () => classNames(local.class, hopeBreadcrumbLinkClass, anchorStyles());

  return (
    <Show
      when={local.currentPage}
      fallback={<Box as="a" href={local.href} class={classes()} {...others} />}
    >
      <Box as="span" aria-current="page" class={classes()} {...others} />
    </Show>
  );
}

BreadcrumbLink.toString = () => createClassSelector(hopeBreadcrumbLinkClass);
