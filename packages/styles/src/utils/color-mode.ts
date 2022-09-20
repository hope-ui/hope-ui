import { Dict } from "@hope-ui/utils";

import { SystemStyleColorModeValue } from "../types";

export const COLOR_MODE_CLASSNAMES = {
  light: "hope-theme-light",
  dark: "hope-theme-dark",
};

/** Return whether an object is a valid system style color mode object. */
export function isColorModeObjectLike(obj: Dict): obj is SystemStyleColorModeValue<any> {
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every(key => ["light", "dark"].includes(key));
}
