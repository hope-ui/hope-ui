import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { utilityStyleProps } from "@/theme/utilityStyles";

import { baseFlexStyleProps, commonFlexboxAndGridStyleProps } from "../Flex/Flex.styles";
import { baseTextStyleProps } from "../Text/Text.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { boxStyles, BoxVariants } from "./Box.styles";

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<C, BoxVariants>;

const hopeBoxClass = "hope-box";

/**
 * Box is the most abstract component of Hope UI.
 * By default, it renders a div element.
 */
export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [
    ...utilityStyleProps,
    ...commonFlexboxAndGridStyleProps,
    ...baseFlexStyleProps,
    ...baseTextStyleProps,
    "css",
    "display",
  ]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeBoxClass,
      baseClass: boxStyles(styleProps),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}

Box.toString = () => createCssSelector(hopeBoxClass);
