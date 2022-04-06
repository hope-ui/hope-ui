import { Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
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
  const theme = useComponentStyleConfigs().Breadcrumb;

  const [local, others] = splitProps(props as BreadcrumbLinkProps<"a">, ["class", "currentPage", "href"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeBreadcrumbLinkClass,
      breadcrumbLinkStyles({
        currentPage: local.currentPage === true ? true : false, // ensure a boolean is passed so the `true/false` values works correctly
      })
    );
  };

  return (
    <Show
      when={local.currentPage}
      fallback={<hope.a href={local.href} class={classes()} __baseStyle={theme?.baseStyle?.link} {...others} />}
    >
      <hope.span aria-current="page" class={classes()} __baseStyle={theme?.baseStyle?.link} {...others} />
    </Show>
  );
}

BreadcrumbLink.toString = () => createClassSelector(hopeBreadcrumbLinkClass);
