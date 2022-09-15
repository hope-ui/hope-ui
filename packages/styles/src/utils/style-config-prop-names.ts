import { BaseUseStyleConfigOptions } from "../types";

/** Names of base UseStyleConfigOptions props, used in SolidJS `splitProps`. */
export const STYLE_CONFIG_PROP_NAMES: Array<keyof BaseUseStyleConfigOptions<any, any>> = [
  "styleConfigOverride",
  "unstyled",
];
