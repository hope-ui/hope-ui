import { MaybeAccessor } from "@solid-primitives/utils";

export type ValidationState = "valid" | "invalid";

export interface Validation {
  /**
   * Whether the input should display its "valid" or "invalid" visual styling.
   */
  validationState?: MaybeAccessor<ValidationState | undefined>;

  /**
   * Whether user input is required on the input before form submission.
   * Often paired with the `necessityIndicator` prop to add a visual indicator to the input.
   */
  isRequired?: MaybeAccessor<boolean | undefined>;
}

export interface InputBase {
  /**
   * Whether the input is disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the input can be selected but not changed by the user.
   */
  isReadOnly?: MaybeAccessor<boolean | undefined>;
}
