import { ComponentTheme, ResponsiveValue } from "@hope-ui/styles";

import { DividerStyleConfigProps } from "./divider.styles";

export interface DividerProps extends Omit<DividerStyleConfigProps, "hasLabel"> {
  /** The visual style of the divider. */
  variant?: "solid" | "dashed" | "dotted";

  /** The thickness of the divider (in px). */
  thickness?: ResponsiveValue<number | string>;
}

export type DividerTheme = ComponentTheme<
  DividerProps,
  "variant" | "thickness" | "orientation" | "labelPlacement"
>;
