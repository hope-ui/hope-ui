import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { boxPropNames, boxStyles, BoxVariants } from "./Box.styles";

export type BoxProps<C extends ElementType> = PolymorphicComponentProps<C, BoxVariants>;

const hopeBoxClass = "hope-box";

/**
 * Box is the most abstract component of Hope UI.
 * By default, it renders a div element.
 */
export function Box<C extends ElementType = "div">(props: BoxProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [...boxPropNames, "css"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeBoxClass,
      baseClass: boxStyles(styleProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}

Box.toString = () => createCssSelector(hopeBoxClass);
