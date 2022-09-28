import { ComponentTheme, ResponsiveValue } from "@hope-ui/styles";
import { DividerStyleConfigProps } from "./divider.styles";

export interface DividerProps extends DividerStyleConfigProps {
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
  "labelPlacement" | "orientation" | "variant" | "thickness"
>;
