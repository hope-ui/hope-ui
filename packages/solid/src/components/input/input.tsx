import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { useFormControl } from "../form-control/use-form-control";
import { HTMLHopeProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";
import { ThemeableInputGroupOptions, useInputGroupContext } from "./input-group";

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
  const theme = useStyleConfig().Input;

  const inputGroup = useInputGroupContext();

  const formControlProps = useFormControl<HTMLInputElement>(props);

  const [local, others] = splitProps(props, ["class", "htmlSize", "variant", "size"]);

  const classes = () =>
    classNames(
      local.class,
      hopeInputClass,
      inputStyles({
        variant: local.variant ?? inputGroup?.state.variant ?? theme?.defaultProps?.input?.variant ?? "outline",
        size: local.size ?? inputGroup?.state.size ?? theme?.defaultProps?.input?.size ?? "md",
        withLeftElement: inputGroup?.state.hasLeftElement ?? false,
        withRightElement: inputGroup?.state.hasRightElement ?? false,
        withLeftAddon: inputGroup?.state.hasLeftAddon ?? false,
        withRightAddon: inputGroup?.state.hasRightAddon ?? false,
      })
    );

  return (
    <hope.input
      type="text"
      class={classes()}
      size={local.htmlSize}
      __baseStyle={theme?.baseStyle?.input}
      {...formControlProps}
      {...others}
    />
  );
}

Input.toString = () => createClassSelector(hopeInputClass);
