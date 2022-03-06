import { mergeProps, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { HTMLHopeProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";
import { InputGroup, ThemeableInputGroupOptions, useInputGroupContext } from "./input-group";
import { InputLeftElement, InputRightElement } from "./input-element";
import { InputLeftAddon, InputRightAddon } from "./input-addon";

type ThemeableInputOptions = Pick<InputVariants, "variant" | "size">;

interface InputOptions extends ThemeableInputOptions {
  /**
   * If `true`, the input will have `aria-invalid` set to `true`.
   */
  invalid?: boolean;

  /**
   * The native HTML `size` attribute to be passed to the `input`.
   */
  htmlSize?: string | number;
}

export type InputProps = Omit<HTMLHopeProps<"input", InputOptions>, "as">;

export interface InputStyleConfig {
  baseStyle?: {
    input?: SystemStyleObject;
    group?: SystemStyleObject;
    element?: SystemStyleObject;
    addon?: SystemStyleObject;
  };
  defaultProps?: {
    input?: ThemeableInputOptions;
    group?: ThemeableInputGroupOptions;
  };
}

const hopeInputClass = "hope-input";

export function Input(props: InputProps) {
  const theme = useComponentStyleConfigs().Input;

  const inputGroup = useInputGroupContext();

  const defaultProps: InputProps = {
    type: "text",
    variant: inputGroup?.state.variant ?? theme?.defaultProps?.input?.variant ?? "outline",
    size: inputGroup?.state.size ?? theme?.defaultProps?.input?.size ?? "md",
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
      __baseStyle={theme?.baseStyle?.input}
      {...formControlProps}
      {...others}
    />
  );
}

Input.toString = () => createClassSelector(hopeInputClass);

Input.Group = InputGroup;
Input.LeftAddon = InputLeftAddon;
Input.RightAddon = InputRightAddon;
Input.LeftElement = InputLeftElement;
Input.RightElement = InputRightElement;
