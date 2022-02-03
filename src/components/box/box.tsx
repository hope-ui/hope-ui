import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createStyledSystemClass, getUsedStylePropNames } from "@/styled-system/system";
import { classNames } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { HopeComponentProps } from "../types";

/**
 * Box is the most abstract component on top of which all other Hope UI components are built.
 * By default, it renders a div element.
 */
export function Box<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const usedStylePropNames = getUsedStylePropNames(props);

  const [local, styleProps, others] = splitProps(
    props,
    ["as", "class", "className", "classList"],
    usedStylePropNames
  );

  const classList = () => ({
    [classNames(local.class, local.className, createStyledSystemClass(styleProps))]: true,
    ...local.classList,
  });

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
