import { StitchesTheme } from "@/stitches/stitches.config";
import { DefaultThemeTokens } from "@/stitches/types";

/**
 * Interface of the default Hope UI design tokens.
 */
export type HopeThemeTokens = {
  [Scale in keyof DefaultThemeTokens]?: {
    [Token in keyof DefaultThemeTokens[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

/**
 * Globally set default props for Hope UI components.
 */
export interface HopeComponentsDefaultProps {
  Button?: string; //Omit<ButtonVariantProps, "loading">;
}

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  stitchesTheme: StitchesTheme;
  components: HopeComponentsDefaultProps;
}

/**
 * The Hope UI theme override interface.
 */
export interface HopeThemeOverride {
  tokens?: HopeThemeTokens;
  components?: HopeComponentsDefaultProps;
}
