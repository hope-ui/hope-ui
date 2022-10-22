import {
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { useFormControlContext } from "../form-control";
import { InputStyleConfigProps, useInputStyleConfig } from "./input.styles";
import { useInputGroupContext } from "./input-group-context";
import { InputSharedProps } from "./types";

export interface InputProps extends InputStyleConfigProps, InputSharedProps {
  /** The native HTML `size` attribute to be passed to the `input`. */
  htmlSize?: string | number;
}

export const Input = createHopeComponent<"input", InputProps>(props => {
  const formControlContext = useFormControlContext();
  const inputGroupContext = useInputGroupContext();

  props = mergeThemeProps("Input", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    [
      "id",
      "aria-describedby",
      "class",
      "__css",
      "isRequired",
      "isDisabled",
      "isReadOnly",
      "isInvalid",
      "htmlSize",
    ],
    [...STYLE_CONFIG_PROP_NAMES, "variant", "size"]
  );

  const { baseClasses, styleOverrides } = useInputStyleConfig("Input", {
    get variant() {
      return inputGroupContext?.variant() ?? styleConfigProps.variant;
    },
    get size() {
      return inputGroupContext?.size() ?? styleConfigProps.size;
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
    get unstyled() {
      return inputGroupContext?.unstyled() ?? styleConfigProps.unstyled;
    },
  });

  const isRequired = () => {
    return local.isRequired ?? inputGroupContext?.isRequired() ?? formControlContext?.isRequired();
  };

  const isDisabled = () => {
    return local.isDisabled ?? inputGroupContext?.isDisabled() ?? formControlContext?.isDisabled();
  };

  const isReadOnly = () => {
    return local.isReadOnly ?? inputGroupContext?.isReadOnly() ?? formControlContext?.isReadOnly();
  };

  const isInvalid = () => {
    return local.isInvalid ?? inputGroupContext?.isInvalid() ?? formControlContext?.isInvalid();
  };

  const ariaDescribedBy = () => {
    return formControlContext?.mergeAriaDescribedBy(local["aria-describedby"]);
  };

  return (
    <hope.input
      type="text"
      id={local.id ?? formControlContext?.id()}
      required={isRequired()}
      disabled={isDisabled()}
      readOnly={isReadOnly()}
      aria-invalid={isInvalid()}
      aria-describedby={ariaDescribedBy()}
      size={local.htmlSize}
      class={clsx(inputGroupContext?.baseClasses().input, baseClasses().root, local.class)}
      __css={{
        ...inputGroupContext?.styleOverrides().input,
        ...styleOverrides().root,
        ...local.__css,
      }}
      {...others}
    />
  );
});
