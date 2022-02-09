import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { HopeComponentProps } from "../types";
import { checkboxStyles, CheckboxVariants } from "./checkbox.styles";

export type ThemeableCheckboxOptions = CheckboxVariants;

interface CheckboxOptions extends ThemeableCheckboxOptions {
  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;
}

export type CheckboxProps = Omit<HopeComponentProps<"input", CheckboxOptions>, "as">;

const hopeCheckboxClass = "hope-checkbox";

export function Checkbox(props: CheckboxProps) {
  const [local, variantProps, others] = splitProps(
    props,
    ["class", "invalid"],
    ["variant", "size"]
  );

  const classes = () => classNames(local.class, hopeCheckboxClass, checkboxStyles(variantProps));

  return (
    <Box
      as="input"
      type="checkbox"
      class={classes()}
      aria-invalid={local.invalid ? true : undefined}
      {...others}
    />
  );
}

Checkbox.toString = () => createCssSelector(hopeCheckboxClass);
