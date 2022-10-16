import {
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { InputStyleConfigProps, useInputStyleConfig } from "./input.styles";
import { useInputGroupContext } from "./input-group-context";
import { InputSharedProps } from "./types";

export interface InputProps extends InputStyleConfigProps, InputSharedProps {
  /** The native HTML `size` attribute to be passed to the `input`. */
  htmlSize?: string | number;
}

export const Input = createHopeComponent<"input", InputProps>(props => {
  const context = useInputGroupContext();

  props = mergeThemeProps("Input", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "__css", "isRequired", "isDisabled", "isReadOnly", "isInvalid", "htmlSize"],
    [...STYLE_CONFIG_PROP_NAMES, "variant", "size"]
  );

  const { baseClasses, styleOverrides } = useInputStyleConfig("Input", {
    get variant() {
      return context?.variant() ?? styleConfigProps.variant;
    },
    get size() {
      return context?.size() ?? styleConfigProps.size;
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
    get unstyled() {
      return context?.unstyled() ?? styleConfigProps.unstyled;
    },
  });

  return (
    <hope.input
      type="text"
      required={local.isRequired ?? context?.isRequired()}
      disabled={local.isDisabled ?? context?.isDisabled()}
      readOnly={local.isReadOnly ?? context?.isReadOnly()}
      aria-invalid={local.isInvalid ?? context?.isInvalid()}
      size={local.htmlSize}
      class={clsx(context?.baseClasses().input, baseClasses().root, local.class)}
      __css={{
        ...context?.styleOverrides().input,
        ...styleOverrides().root,
        ...local.__css,
      }}
      {...others}
    />
  );
});
