import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { selectTagStyles } from "./select.styles";

export type SelectTagProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSelectTagClass = "hope-select__tag";

/**
 * Tag representing a selected value in a multi-select.
 */
export function SelectTag<C extends ElementType = "span">(props: SelectTagProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSelectTagClass, selectTagStyles());

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.tag} {...others} />;
}

SelectTag.toString = () => createClassSelector(hopeSelectTagClass);
