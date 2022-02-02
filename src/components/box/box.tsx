import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { css } from "@/styled-system/stitches.config";
import { getUsedStylePropNames } from "@/styled-system/system";
import { toCss } from "@/styled-system/utils";
import { classPropNames, toClassList } from "@/utils/style";
import { ElementType } from "@/utils/types";

import { HopeComponentProps } from "../types";

const boxStyles = css();

/**
 * Box is the most abstract component of Hope UI.
 * By default, it renders a div element.
 */
export function Box<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const usedStylePropNames = getUsedStylePropNames(props);

  const [local, styleProps, others] = splitProps(
    props,
    [...classPropNames, "as"],
    usedStylePropNames
  );

  const classList = () => {
    const boxClass = boxStyles({ css: toCss(styleProps) });
    return toClassList(local, boxClass);
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
