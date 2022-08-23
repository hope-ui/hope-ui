import { mapResponsive, ResponsiveValue, SystemStyleObject } from "@hope-ui/styles";

/** Provide the styles for line clamp. */
export function lineClamp(value: ResponsiveValue<number> | undefined): SystemStyleObject {
  if (value == null) {
    return {};
  }

  return {
    overflow: mapResponsive(value, value => (value != null ? "hidden" : undefined)),
    textOverflow: mapResponsive(value, value => (value != null ? "ellipsis" : undefined)),
    display: mapResponsive(value, value => (value != null ? "-webkit-box" : undefined)),
    WebkitLineClamp: mapResponsive(value, value => (value != null ? value : undefined)),
    WebkitBoxOrient: mapResponsive(value, value => (value != null ? "vertical" : undefined)),
  };
}
