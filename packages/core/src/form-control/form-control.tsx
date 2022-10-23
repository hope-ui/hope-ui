import {
  ComponentTheme,
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { createSignal, createUniqueId, splitProps } from "solid-js";

import { FormControlStyleConfigProps, useFormControlStyleConfig } from "./form-control.styles";
import { FormControlContext, FormControlContextValue } from "./form-control-context";

export interface FormControlProps extends FormControlStyleConfigProps {
  /** The `id` to use for the form control element (e.g, Input, TextArea). */
  id?: string;

  /** Whether the form control is required. */
  isRequired?: boolean;

  /** Whether the form control is disabled. */
  isDisabled?: boolean;

  /** Whether the form control is read only. */
  isReadOnly?: boolean;

  /** Whether the form control is invalid. */
  isInvalid?: boolean;
}

export type FormControlTheme = ComponentTheme<FormControlProps, "withRequiredIndicator">;

export const FormControl = createHopeComponent<"div", FormControlProps>(props => {
  props = mergeThemeProps(
    "FormControl",
    {
      id: `hope-form-control-${createUniqueId()}`,
    },
    props
  );

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["id", "class", "isRequired", "isDisabled", "isReadOnly", "isInvalid"],
    [...STYLE_CONFIG_PROP_NAMES, "withRequiredIndicator"]
  );

  const [hasDescription, setHasDescription] = createSignal(false);
  const [hasErrorMessage, setHasErrorMessage] = createSignal(false);

  const { baseClasses, styleOverrides } = useFormControlStyleConfig(
    "FormControl",
    styleConfigProps
  );

  const descriptionId = () => `${props.id!}-description`;
  const errorMessageId = () => `${props.id!}-error-message`;

  const isInvalid = () => props.isInvalid;

  const mergeAriaDescribedBy = (elementAriaDescribedBy?: string) => {
    const ids = elementAriaDescribedBy ? [elementAriaDescribedBy] : [];

    // Error message must be described first in all scenarios.
    if (hasErrorMessage() && isInvalid()) {
      ids.push(errorMessageId());
    }

    if (hasDescription()) {
      ids.push(descriptionId());
    }

    return ids.join(" ") || undefined;
  };

  const context: FormControlContextValue = {
    id: () => props.id!,
    labelId: () => `${props.id!}-label`,
    descriptionId,
    errorMessageId,
    isRequired: () => props.isRequired,
    isDisabled: () => props.isDisabled,
    isReadOnly: () => props.isReadOnly,
    isInvalid,
    unstyled: () => styleConfigProps.unstyled,
    baseClasses,
    styleOverrides,
    hasDescription,
    setHasDescription,
    hasErrorMessage,
    setHasErrorMessage,
    mergeAriaDescribedBy,
  };

  return (
    <FormControlContext.Provider value={context}>
      <hope.div
        role="group"
        data-required={context.isRequired() || undefined}
        data-disabled={context.isDisabled() || undefined}
        data-readonly={context.isReadOnly() || undefined}
        data-invalid={context.isInvalid() || undefined}
        class={clsx(baseClasses().root, local.class)}
        __css={styleOverrides().root}
        {...others}
      />
    </FormControlContext.Provider>
  );
});
