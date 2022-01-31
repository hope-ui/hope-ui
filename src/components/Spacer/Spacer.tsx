import { splitProps } from "solid-js";

import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Box } from "../Box/Box";
import { ElementType, HopeComponentProps } from "../types";
import { spacerStyles } from "./Spacer.styles";

export type SpacerProps<C extends ElementType> = HopeComponentProps<C>;

const hopeSpacerClass = "hope-spacer";

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export function Spacer<C extends ElementType = "div">(props: SpacerProps<C>) {
  const [local, others] = splitProps(props, classPropsKeys);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeSpacerClass,
      baseClass: spacerStyles(),
      classProps: local,
    });
  };

  return <Box classList={classList()} {...others} />;
}

Spacer.toString = () => createCssSelector(hopeSpacerClass);
