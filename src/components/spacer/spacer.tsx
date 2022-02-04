import { splitProps } from "solid-js";

import { HopeComponentProps } from "@/components/types";
import { classNames, createCssSelector } from "@/utils/css";
import { ElementType } from "@/utils/types";

import { Box } from "../box/box";
import { spacerStyles } from "./spacer.styles";

const hopeSpacerClass = "hope-spacer";

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export function Spacer<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSpacerClass, spacerStyles());

  return <Box class={classes()} {...others} />;
}

Spacer.toString = () => createCssSelector(hopeSpacerClass);
