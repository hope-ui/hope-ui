import { mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptionTextStyles } from "./select.styles";

const hopeSelectOptionTextClass = "hope-select__option__text";

export type SelectOptionTextProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * The textual part of the option.
 */
export function SelectOptionText<C extends ElementType = "span">(props: SelectOptionTextProps<C>) {
  const defaultProps: SelectOptionTextProps<"span"> = {
    as: "span",
  };

  const propsWithDefault: SelectOptionTextProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeSelectOptionTextClass, selectOptionTextStyles());

  return <Box class={classes()} {...others} />;
}

SelectOptionText.toString = () => createClassSelector(hopeSelectOptionTextClass);
