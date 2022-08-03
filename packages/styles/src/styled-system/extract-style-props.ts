import { SystemStyleProps } from "../types";
import { stylePropNames } from "./style-prop-names";

/** Take a props object and return only the keys that match a style prop. */
export function extractStyleProps(props: Record<string | number, any>) {
  return Object.keys(props).filter(key => key in stylePropNames) as Array<keyof SystemStyleProps>;
}
