import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "../types";
import { classPropNames, generateClassList } from "../utils";
import { centerStyles, CenterVariants } from "./Center.styles";

export type CenterProps<C extends ElementType> = PolymorphicComponentProps<C, CenterVariants>;

/**
 * Center is a layout component that centers its child within itself.
 */
export function Center<C extends ElementType = "div">(props: CenterProps<C>) {
  const [local, styleProps, classProps, others] = splitProps(
    props,
    ["as"],
    ["css", "fullWidth", "fullHeight", "fullSize"],
    classPropNames
  );

  const classList = () => {
    return generateClassList({
      baseClass: centerStyles(styleProps),
      ...classProps,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}
