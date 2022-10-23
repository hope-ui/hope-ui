import { SystemStyleObject } from "@hope-ui/styles";
import { Accessor, createContext, Setter, useContext } from "solid-js";

import { InputGroupParts, InputGroupStyleConfigProps } from "./input-group.styles";
import { useFormControlContext } from "../form-control";

export interface InputGroupContextValue {
  /** Whether the input is required. */
  isRequired: Accessor<boolean | undefined>;

  /** Whether the input is disabled. */
  isDisabled: Accessor<boolean | undefined>;

  /** Whether the input is read only. */
  isReadOnly: Accessor<boolean | undefined>;

  /** Whether the input is invalid. */
  isInvalid: Accessor<boolean | undefined>;

  /** The visual style of the input. */
  variant: Accessor<InputGroupStyleConfigProps["variant"]>;

  /** The size of the input. */
  size: Accessor<InputGroupStyleConfigProps["size"]>;

  /** Whether the base styles should be applied or not. */
  unstyled: Accessor<InputGroupStyleConfigProps["unstyled"]>;

  /** The style config base class names. */
  baseClasses: Accessor<Record<InputGroupParts, string>>;

  /** The style config style overrides. */
  styleOverrides: Accessor<Record<InputGroupParts, SystemStyleObject>>;

  /** Setter for whether the input has a left section. */
  setHasLeftSection: Setter<boolean>;

  /** Setter for whether the input has a right section. */
  setHasRightSection: Setter<boolean>;

  /** Setter for whether the input has a left addon. */
  setHasLeftAddon: Setter<boolean>;

  /** Setter for whether the input has a right addon. */
  setHasRightAddon: Setter<boolean>;
}

export const InputGroupContext = createContext<InputGroupContextValue>();

export function useInputGroupContext() {
  return useContext(InputGroupContext);
}

export function useRequiredInputGroupContext() {
  const context = useInputGroupContext();

  if (!context) {
    throw new Error(
      "[hope-ui]: `useRequiredInputGroupContext` must be used within a `InputGroup` component"
    );
  }

  return context;
}
