import { Accessor, JSX } from "solid-js";

export type RawColorMode = "light" | "dark";
export type ColorMode = RawColorMode | "system";

export interface ColorModeContextValue {
  colorMode: Accessor<RawColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}

export interface ColorModeProviderProps {
  /**
   * The default color mode used in the application.
   * If not provided, system preference will be used.
   */
  initialColorMode?: ColorMode;

  children?: JSX.Element;
}
