import { mergeProps, splitProps } from "solid-js";

import { useThemeComponentStyles } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { HTMLHopeProps } from "../types";
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

export type InputProps = Omit<HTMLHopeProps<"input", InputOptions>, "as">;

const hopeInputClass = "hope-input";

export function Input(props: InputProps) {
  const inputGroup = useInputGroupContext();
  const theme = useThemeComponentStyles().Input;

  const defaultProps: InputProps = {
    type: "text",
    variant: inputGroup?.state.variant ?? theme?.defaultProps?.variant ?? "outline",
    size: inputGroup?.state.size ?? theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: InputProps = mergeProps(defaultProps, props);
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
      as="input"
      class={classes()}
      size={local.htmlSize}
      __baseStyle={theme?.baseStyle}
      {...formControlProps}
      {...others}
    />
  );
}

Input.toString = () => createClassSelector(hopeInputClass);
