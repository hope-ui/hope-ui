import { children, For, JSX, mergeProps, Show, splitProps } from "solid-js";

import { MarginProps } from "@/styled-system/props/margin";
import { ResponsiveValue } from "@/styled-system/types";
import { isArray } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { breadcrumbItemStyles, breadcrumbListStyles } from "./breadcrumb.styles";

export interface BreadcrumbOptions {
  /**
   * The visual separator between each breadcrumb item
   */
  separator?: string | JSX.Element;

  /**
   * The left and right margin applied to the separator
   */
  spacing?: ResponsiveValue<MarginProps["mx"]>;
}

export type BreadcrumbProps<C extends ElementType = "nav"> = HopeComponentProps<
  C,
  BreadcrumbOptions
>;

const hopeBreadcrumbClass = "hope-breadcrumb";
const hopeBreadcrumbListClass = "hope-breadcrumb__list";
const hopeBreadcrumbItemClass = "hope-breadcrumb__list-item";
const hopeBreadcrumbSeparatorClass = "hope-breadcrumb__separator";

/**
 * Breadcrumb is used to render a breadcrumb navigation landmark.
 * It renders a `nav` element with `aria-label` set to `breadcrumb`
 */
export function Breadcrumb<C extends ElementType = "nav">(props: BreadcrumbProps<C>) {
  const defaultProps: BreadcrumbProps<"nav"> = {
    as: "nav",
    separator: "/",
    spacing: "0.5rem",
  };

  const propsWithDefault: BreadcrumbProps<"nav"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "separator",
    "spacing",
  ]);

  const rootClasses = () => classNames(local.class, hopeBreadcrumbClass);

  const listClasses = () => classNames(hopeBreadcrumbListClass, breadcrumbListStyles());

  const itemClasses = () => classNames(hopeBreadcrumbItemClass, breadcrumbItemStyles());

  const links = () => {
    const items = children(() => local.children)();
    return isArray(items) ? items : [items];
  };

  const isLastLink = (index: number) => {
    return index + 1 === links().length;
  };

  return (
    <Box as="nav" aria-label="breadcrumb" class={rootClasses()} {...others}>
      <Box as="ol" class={listClasses()}>
        <For each={links()}>
          {(link, index) => (
            <li class={itemClasses()}>
              {link}
              <Show when={!isLastLink(index())}>
                <Box
                  as="span"
                  role="presentation"
                  class={hopeBreadcrumbSeparatorClass}
                  mx={local.spacing}
                >
                  {local.separator}
                </Box>
              </Show>
            </li>
          )}
        </For>
      </Box>
    </Box>
  );
}

Breadcrumb.toString = () => createClassSelector(hopeBreadcrumbClass);
