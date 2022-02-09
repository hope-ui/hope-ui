import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { ElementType, HopeComponentProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";
import { useInputGroupContext } from "./input-group";

export type ThemeableInputOptions = Pick<InputVariants, "variant" | "size">;

interface InputOptions extends ThemeableInputOptions {
  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * The native HTML `size` attribute to be passed to the `input`
   */
  htmlSize?: string | number;
}

export type InputProps<C extends ElementType> = HopeComponentProps<C, InputOptions>;

const hopeInputClass = "hope-input";

export function Input<C extends ElementType = "input">(props: InputProps<C>) {
  const inputGroup = useInputGroupContext();
  const theme = useTheme().components.Input;

  const defaultProps: InputProps<"input"> = {
    as: "input",
    variant: inputGroup?.state.variant ?? theme?.defaultProps?.variant ?? "outline",
    size: inputGroup?.state.size ?? theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: InputProps<"input"> = mergeProps(defaultProps, props);
  const [local, variantProps, useFormControlProps, others] = splitProps(
    propsWithDefault,
    ["class", "htmlSize"],
    ["variant", "size"],
    useFormControlPropNames
  );

  const formControlProps = useFormControl<HTMLInputElement>(useFormControlProps);

  const classes = () =>
    classNames(
      local.class,
      hopeInputClass,
      inputStyles({
        variant: variantProps.variant,
        size: variantProps.size,
        withLeftElement: inputGroup?.state.hasLeftElement ?? false,
        withRightElement: inputGroup?.state.hasRightElement ?? false,
        withLeftAddon: inputGroup?.state.hasLeftAddon ?? false,
        withRightAddon: inputGroup?.state.hasRightAddon ?? false,
      })
    );

  return (
    <Box
      class={classes()}
      size={local.htmlSize}
      __baseStyle={theme?.baseStyle}
      {...formControlProps()}
      {...others}
    />
  );
}

Input.toString = () => createCssSelector(hopeInputClass);
