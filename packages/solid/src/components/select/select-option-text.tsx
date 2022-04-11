import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptionTextStyles } from "./select.styles";

export type SelectOptionTextProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSelectOptionTextClass = "hope-select__option-text";

/**
 * The textual part of the option.
 */
export function SelectOptionText<C extends ElementType = "span">(props: SelectOptionTextProps<C>) {
  const theme = useStyleConfig().Select;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSelectOptionTextClass, selectOptionTextStyles());

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.optionText} {...others} />;
}

SelectOptionText.toString = () => createClassSelector(hopeSelectOptionTextClass);
