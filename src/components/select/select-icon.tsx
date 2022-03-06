import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { IconProps } from "../icon/icon";
import { IconSelector } from "../icons/IconSelector";
import { ElementType } from "../types";
import { selectIconStyles } from "./select.styles";

const hopeSelectIconClass = "hope-select__trigger__icon";

/**
 * A small icon often displayed next to the value as a visual affordance for the fact it can be open.
 */
export function SelectIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class", "children", "as"]);

  const classes = () => classNames(local.class, hopeSelectIconClass, selectIconStyles());

  const as = () => (local.as as ElementType) ?? IconSelector;

  return <Box as={as()} aria-hidden="true" class={classes()} color="$neutral10" {...others} />;
}

SelectIcon.toString = () => createClassSelector(hopeSelectIconClass);
