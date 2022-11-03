import { hope } from "@hope-ui/styles";

import { visuallyHiddenStyles } from "./visually-hidden.css";

/**
 * `VisuallyHidden` hides its children visually but keeps content visible to assistive technology.
 */
export const VisuallyHidden = hope("span", {
  baseStyle: {
    __staticClass: visuallyHiddenStyles.root,
  },
});

/**
 * A `VisuallyHidden` input used to create custom input components like checkbox, radio and switch.
 */
export const VisuallyHiddenInput = hope("input", {
  baseStyle: {
    __staticClass: visuallyHiddenStyles.root,
  },
});
