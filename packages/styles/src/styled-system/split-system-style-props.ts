import { splitProps } from "solid-js";

import type { SystemStyleProps } from "../types";

const SYSTEM_STYLE_PROPS: Array<keyof SystemStyleProps> = [
  // margin
  "m",
  "mx",
  "my",
  "mt",
  "mb",
  "ml",
  "mr",
  // padding
  "p",
  "px",
  "py",
  "pt",
  "pb",
  "pl",
  "pr",
  // color
  "color",
  "bg",
  // size
  "w",
  "minW",
  "maxW",
  "h",
  "minH",
  "maxH",
  "boxSize",
];

/** Split props into system style props and others props. */
export function splitSystemStyleProps<T extends Record<string, any>>(props: SystemStyleProps & T) {
  const [systemProps, others] = splitProps(props, SYSTEM_STYLE_PROPS);

  /*
Object.keys(systemProps).forEach(key => {
  if (systemProps[key] === undefined) {
    delete systemProps[key];
  }
});
*/

  return { systemProps, others };
}
