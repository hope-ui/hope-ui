import { ComponentTheme, HopeComponent, ResponsiveValue } from "@hope-ui/styles";
import { ComponentProps } from "solid-js";

import { DividerStyleConfigProps } from "./divider.styles";

export interface DividerProps extends Omit<DividerStyleConfigProps, "withLabel"> {
  /** The visual style of the divider. */
  variant?: "solid" | "dashed" | "dotted";

  /** The thickness of the divider (in px). */
  thickness?: ResponsiveValue<number | string>;

  /** Props to be spread on the label component. */
  labelProps?: ComponentProps<HopeComponent<"span">>;
}

export type DividerTheme = ComponentTheme<
  DividerProps,
  "variant" | "thickness" | "orientation" | "labelPlacement" | "labelProps"
>;
