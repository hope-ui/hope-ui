import { DefaultProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

/** Styles API props that are commonly split from component props. */
const STYLES_API_PROPS: Array<keyof DefaultProps> = ["styles", "unstyled"];

/** Split `keys` and specific Styles API props from `props`. */
export function splitStylesProps<T extends DefaultProps>(props: T, keys: Array<keyof T> = []) {
  return splitProps(props, [...STYLES_API_PROPS, ...keys]);
}
