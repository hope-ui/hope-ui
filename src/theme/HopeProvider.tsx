import merge from "lodash.merge";
import { createContext, createSignal, PropsWithChildren, useContext } from "solid-js";

import { ColorModeProvider } from "../color-mode/ColorModeProvider";
import { resetStyles } from "./reset";
import { extendBaseTheme, themeClassNames } from "./stitches.config";
import { darkColors } from "./tokens/colors";
import {
  ColorMode,
  ComponentConfigs,
  HopeTheme,
  HopeThemeContext,
  HopeThemeContextConfig,
} from "./types";

export const HopeContext = createContext<HopeThemeContext>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeThemeContextConfig;
}>;

function createThemeContext(themeConfig?: HopeThemeContextConfig): HopeThemeContext {
  const initialColorMode: ColorMode = themeConfig?.initialColorMode ?? "light";

  const lightTheme: HopeTheme = extendBaseTheme(
    themeClassNames.light,
    merge({}, themeConfig?.lightTheme ?? {})
  );

  const darkTheme: HopeTheme = extendBaseTheme(
    themeClassNames.dark,
    merge({}, { colors: darkColors }, themeConfig?.darkTheme ?? {})
  );

  const components: ComponentConfigs = themeConfig?.components ?? {};

  return {
    initialColorMode,
    lightTheme,
    darkTheme,
    components,
  };
}

export function HopeProvider(props: HopeProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const [context] = createSignal(createThemeContext(props.theme));

  // Apply css reset
  resetStyles();

  return (
    <HopeContext.Provider value={context()}>
      <ColorModeProvider initialColorMode={context().initialColorMode}>
        {props.children}
      </ColorModeProvider>
    </HopeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useTheme must be used within a HopeProvider");
  }

  return context;
}
