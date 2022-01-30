import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createCssSelector, generateClassList } from "@/utils/function";
import { commonProps } from "@/utils/object";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { centerStyles, CenterVariants } from "./Center.styles";

export type CenterProps<C extends ElementType> = PolymorphicComponentProps<C, CenterVariants>;

const hopeCenterClass = "hope-center";

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: CenterProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [...boxPropNames, "css"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeCenterClass,
      baseClass: centerStyles(styleProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}

Center.toString = () => createCssSelector(hopeCenterClass);
