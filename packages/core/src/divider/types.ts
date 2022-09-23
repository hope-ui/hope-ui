import { Box } from "../box";
import { ComponentProps } from "solid-js";
import { ComponentTheme, ResponsiveValue } from "@hope-ui/styles";

export interface DividerProps extends ComponentProps<typeof Box> {
  /** the style of dividing line */
  variant?: "solid" | "dashed" | "dotted";

  /** the thickness of dividing line */
  thickness?: ResponsiveValue<number | string>;

  /** Divider direction */
  orientation?: "vertical" | "horizontal";

  /** text position of Divider */
  labelPlacement?: "left" | "right" | "center";
}

export type DividerTheme = ComponentTheme<
  DividerProps,
  "labelPlacement" | "orientation" | "variant"
>;
