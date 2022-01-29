import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { boxPropNames } from "../Box/Box.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";
import { spacerStyles, SpacerVariants } from "./Spacer.styles";

export type SpacerProps<C extends ElementType> = PolymorphicComponentProps<C, SpacerVariants>;

const hopeSpacerClass = "hope-spacer";

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export function Spacer<C extends ElementType = "div">(props: SpacerProps<C>) {
  const [local, styleProps, others] = splitProps(props, commonProps, [...boxPropNames, "css"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeSpacerClass,
      baseClass: spacerStyles(styleProps),
      classProps: local,
    });
  };

  return <Dynamic component={local.as ?? "div"} classList={classList()} {...others} />;
}

Spacer.toString = () => createCssSelector(hopeSpacerClass);
