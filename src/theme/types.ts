import { defaulThemeTokens } from "../stitches/tokens";
import { SystemTokens } from "../stitches/types";

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface ComponentsDefaultProps {
  Button: any; //Required<ThemeableButtonOptions>;
}

/**
 * The Hope UI theme interface.
 */
export interface HopeTheme {
  tokens: SystemTokens;
  components: ComponentsDefaultProps;
}

/**
 * The Hope UI theme tokens override interface.
 */
export type ThemeTokensOverride = {
  [Scale in keyof typeof defaulThemeTokens]?: {
    [Token in keyof typeof defaulThemeTokens[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

/**
 * The Hope UI theme override interface.
 */
export interface HopeThemeOverride {
  tokens?: Pick<ThemeTokensOverride, "colors" | "fonts">;
  components?: DeepPartial<ComponentsDefaultProps>;
}

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";
