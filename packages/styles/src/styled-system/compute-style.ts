import { css } from "../stitches.config";
import { SystemStyleObject, Theme } from "../types";
import { toCSSObject } from "./to-css-object";

/** Compute system style object and return the generated className. */
export function computeStyle(style: SystemStyleObject, theme: Theme): string {
  return css(toCSSObject(style, theme))().className;
}
