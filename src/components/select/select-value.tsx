import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { selectValueStyles } from "./select.styles";

const hopeSelectValueClass = "hope-select__value";

export type SelectValueProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * The part that reflects the selected value.
 */
export function SelectValue<C extends ElementType = "span">(props: SelectValueProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSelectValueClass, selectValueStyles());

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.value} {...others} />;
}

SelectValue.toString = () => createClassSelector(hopeSelectValueClass);
