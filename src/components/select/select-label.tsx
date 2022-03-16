import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { selectLabelStyles } from "./select.styles";

export type SelectLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectLabelClass = "hope-select__label";

/**
 * Component used to render the label of a group.
 */
export function SelectLabel<C extends ElementType = "div">(props: SelectLabelProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const [local, others] = splitProps(props as SelectLabelProps<"div">, ["class"]);

  const classes = () => classNames(local.class, hopeSelectLabelClass, selectLabelStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.label} {...others} />;
}

SelectLabel.toString = () => createClassSelector(hopeSelectLabelClass);
