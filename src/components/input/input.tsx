import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { createFormControl } from "../form-control/create-form-control";
import { ElementType, HopeComponentProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";

export type ThemeableInputOptions = Pick<InputVariants, "variant" | "size">;

export type InputProps<C extends ElementType> = HopeComponentProps<C, InputVariants> & {
  /**
   * The native HTML `size` attribute to be passed to the `input`
   */
  htmlSize?: string | number;
};

const hopeInputClass = "hope-input";

export function Input<C extends ElementType = "input">(props: InputProps<C>) {
  const theme = useTheme().components.Input;

  const defaultProps: InputProps<"input"> = {
    as: "input",
    variant: theme?.defaultProps?.variant ?? "outline",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: InputProps<"input"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class", "htmlSize"],
    ["variant", "size"]
  );

  // should be spread last in order to override same props from `others`
  const formControlProps = createFormControl<HTMLInputElement>(others);

  const classes = () => classNames(local.class, hopeInputClass, inputStyles(variantProps));

  return (
    <Box
      class={classes()}
      size={local.htmlSize}
      __baseStyle={theme?.baseStyle}
      {...others}
      {...formControlProps()}
    />
  );
}

Input.toString = () => createCssSelector(hopeInputClass);
