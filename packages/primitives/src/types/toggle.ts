import { MaybeAccessor } from "@solid-primitives/utils";

import { AriaLabelingProps, AriaValidationProps } from "./aria";
import { FocusableDOMProps, FocusableProps } from "./focusable";
import { InputBase, Validation } from "./inputs";

export interface ToggleProps extends InputBase, Validation, FocusableProps {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: MaybeAccessor<boolean | undefined>;

  /**
   * The value of the input element, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: MaybeAccessor<string | undefined>;

  /**
   * The name of the input element, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: MaybeAccessor<string | undefined>;

  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
}

export interface AriaToggleProps
  extends ToggleProps,
    FocusableDOMProps,
    AriaLabelingProps,
    AriaValidationProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: MaybeAccessor<string | undefined>;
}
