import { splitProps } from "solid-js";

import type { SystemStyleProps } from "../types";

const SYSTEM_STYLE_PROPS = [
  "m",
  "mx",
  "my",
  "mt",
  "mb",
  "ml",
  "mr",
  "p",
  "px",
  "py",
  "pt",
  "pb",
  "pl",
  "pr",
  "w",
  "minW",
  "maxW",
  "h",
  "minH",
  "maxH",
  "boxSize",
] as const;

/** Split props into system style props and others props. */
export function extractSystemStyleProps<T extends Record<string, any>>(
  props: SystemStyleProps & T
) {
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
