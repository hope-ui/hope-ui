import { hope, SystemStyleObject } from "@hope-ui/styles";

const visuallyHiddenStyles: SystemStyleObject = {
  position: "absolute",
  overflow: "hidden",
  height: "1px",
  width: "1px",
  margin: "0 -1px -1px 0",
  border: 0,
  padding: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};

/**
 * `VisuallyHidden` hides its children visually but keeps content visible to assistive technology.
 */
export const VisuallyHidden = hope("span", {
  baseStyle: visuallyHiddenStyles,
});

/**
 * A `VisuallyHidden` input used to create custom input components like checkbox, radio and switch.
 */
export const VisuallyHiddenInput = hope("input", {
  baseStyle: visuallyHiddenStyles,
});
