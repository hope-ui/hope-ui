import { isEmptyObject } from "@hope-ui/utils";
import { clsx } from "clsx";

import { css } from "../stitches.config";
import { SystemStyleObject, Theme } from "../types";
import { toCSSObject } from "./to-css-object";

/** Compute system style object and return the generated className with the additional static class if provided. */
export function computeStyle(style: SystemStyleObject, theme: Theme): string {
  const { __staticClass = "", ...runtimeStyles } = style;

  if (isEmptyObject(runtimeStyles)) {
    return __staticClass;
  }

  return clsx(__staticClass, css(toCSSObject(runtimeStyles, theme))().className);
}
