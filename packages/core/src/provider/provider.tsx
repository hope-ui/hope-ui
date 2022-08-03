import { ThemeOverride, ThemeProvider } from "@hope-ui/styles";
import { createMemo, mergeProps, ParentProps } from "solid-js";

import { ColorModeProvider, ColorModeProviderProps, useColorMode } from "../color-mode";

type HopeThemeOverride = Omit<ThemeOverride, "colorMode">;

interface ThemeProviderWithColorModeProps extends ParentProps {
  /** The custom theme to use. */
  theme?: HopeThemeOverride;
}

function ThemeProviderWithColorMode(props: ThemeProviderWithColorModeProps) {
  const { colorMode } = useColorMode();

  const theme = createMemo(() => mergeProps(props.theme, { colorMode: colorMode() }));

  return <ThemeProvider theme={theme()}>{props.children}</ThemeProvider>;
}

export function HopeProvider(props: ColorModeProviderProps & ThemeProviderWithColorModeProps) {
  return (
    <ColorModeProvider
      initialColorMode={props.initialColorMode}
      storageManager={props.storageManager}
      disableTransitionOnChange={props.disableTransitionOnChange}
    >
      <ThemeProviderWithColorMode theme={props.theme}>{props.children}</ThemeProviderWithColorMode>
    </ColorModeProvider>
  );
}
