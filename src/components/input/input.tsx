import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl } from "../form-control/use-form-control";
import { ElementType, HopeComponentProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";
import { useInputGroupContext } from "./input-group";

interface InputOptions extends Omit<InputVariants, "withElement"> {
  /**
   * The native HTML `size` attribute to be passed to the `input`
   */
  htmlSize?: string | number;
}

export type ThemeableInputOptions = Pick<InputOptions, "variant" | "size">;

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
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class", "htmlSize"],
    ["variant", "size"]
  );

  // should be spread last in order to override same props from `others`
  const formControlProps = useFormControl<HTMLInputElement>(others);

  const classes = () =>
    classNames(
      local.class,
      hopeInputClass,
      inputStyles({
        variant: variantProps.variant,
        size: inputGroup?.state.size ?? variantProps.size,
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
      {...others}
      {...formControlProps()}
    />
  );
}

Input.toString = () => createCssSelector(hopeInputClass);
