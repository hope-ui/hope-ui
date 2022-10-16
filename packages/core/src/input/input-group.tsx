import {
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { createSignal, splitProps } from "solid-js";

import { InputGroupStyleConfigProps, useInputGroupStyleConfig } from "./input-group.styles";
import { InputGroupContext, InputGroupContextValue } from "./input-group-context";
import { InputSharedProps } from "./types";

export interface InputGroupProps
  extends Omit<
      InputGroupStyleConfigProps,
      "hasLeftSection" | "hasRightSection" | "hasLeftAddon" | "hasRightAddon"
    >,
    InputSharedProps {}

export const InputGroup = createHopeComponent<"div", InputGroupProps>(props => {
  props = mergeThemeProps("InputGroup", {}, props);

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "isRequired", "isDisabled", "isReadOnly", "isInvalid"],
    [...STYLE_CONFIG_PROP_NAMES, "variant", "size"]
  );

  const [hasLeftSection, setHasLeftSection] = createSignal(false);
  const [hasRightSection, setHasRightSection] = createSignal(false);
  const [hasLeftAddon, setHasLeftAddon] = createSignal(false);
  const [hasRightAddon, setHasRightAddon] = createSignal(false);

  const { baseClasses, styleOverrides } = useInputGroupStyleConfig("InputGroup", {
    get variant() {
      return styleConfigProps.variant;
    },
    get size() {
      return styleConfigProps.size;
    },
    get hasLeftSection() {
      return hasLeftSection();
    },
    get hasRightSection() {
      return hasRightSection();
    },
    get hasLeftAddon() {
      return hasLeftAddon();
    },
    get hasRightAddon() {
      return hasRightAddon();
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
    get unstyled() {
      return styleConfigProps.unstyled;
    },
  });

  const context: InputGroupContextValue = {
    isRequired: () => props.isRequired,
    isDisabled: () => props.isDisabled,
    isReadOnly: () => props.isReadOnly,
    isInvalid: () => props.isInvalid,
    variant: () => styleConfigProps.variant,
    size: () => styleConfigProps.size,
    unstyled: () => styleConfigProps.unstyled,
    baseClasses,
    styleOverrides,
    setHasLeftSection,
    setHasRightSection,
    setHasLeftAddon,
    setHasRightAddon,
  };

  return (
    <InputGroupContext.Provider value={context}>
      <hope.div
        data-required={context.isRequired() || undefined}
        data-disabled={context.isDisabled() || undefined}
        data-readonly={context.isReadOnly() || undefined}
        data-invalid={context.isInvalid() || undefined}
        class={clsx(baseClasses().root, local.class)}
        __css={styleOverrides().root}
        {...others}
      />
    </InputGroupContext.Provider>
  );
});
