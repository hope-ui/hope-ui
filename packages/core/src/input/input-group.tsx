import {
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { dataAttr } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createSignal, splitProps } from "solid-js";

import { useFormControlContext } from "../form-control";
import { InputGroupStyleConfigProps, useInputGroupStyleConfig } from "./input-group.styles";
import { InputGroupLeftAddon, InputGroupRightAddon } from "./input-group-addon";
import { InputGroupContext, InputGroupContextValue } from "./input-group-context";
import { InputGroupLeftSection, InputGroupRightSection } from "./input-group-section";
import { InputSharedProps } from "./types";

export interface InputGroupProps
  extends Omit<
      InputGroupStyleConfigProps,
      "hasLeftSection" | "hasRightSection" | "hasLeftAddon" | "hasRightAddon"
    >,
    InputSharedProps {}

type InputGroupComposite = {
  LeftAddon: typeof InputGroupLeftAddon;
  RightAddon: typeof InputGroupRightAddon;
  LeftSection: typeof InputGroupLeftSection;
  RightSection: typeof InputGroupRightSection;
};

export const InputGroup = createHopeComponent<"div", InputGroupProps, InputGroupComposite>(
  props => {
    const formControlContext = useFormControlContext();

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
      isRequired: () => props.isRequired ?? formControlContext?.isRequired(),
      isDisabled: () => props.isDisabled ?? formControlContext?.isDisabled(),
      isReadOnly: () => props.isReadOnly ?? formControlContext?.isReadOnly(),
      isInvalid: () => props.isInvalid ?? formControlContext?.isInvalid(),
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
          data-required={dataAttr(context.isRequired())}
          data-disabled={dataAttr(context.isDisabled())}
          data-readonly={dataAttr(context.isReadOnly())}
          data-invalid={dataAttr(context.isInvalid())}
          class={clsx(baseClasses().root, local.class)}
          __css={styleOverrides().root}
          {...others}
        />
      </InputGroupContext.Provider>
    );
  }
);

InputGroup.LeftAddon = InputGroupLeftAddon;
InputGroup.RightAddon = InputGroupRightAddon;
InputGroup.LeftSection = InputGroupLeftSection;
InputGroup.RightSection = InputGroupRightSection;
