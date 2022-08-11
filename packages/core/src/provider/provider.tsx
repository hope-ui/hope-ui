import { ThemeProvider, ThemeProviderProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { ColorModeProvider, ColorModeProviderProps } from "../color-mode";

export function HopeProvider(props: ColorModeProviderProps & ThemeProviderProps) {
  const [local, others] = splitProps(props, [
    "initialColorMode",
    "storageManager",
    "disableTransitionOnChange",
  ]);

  return (
    <ColorModeProvider
      initialColorMode={local.initialColorMode}
      storageManager={local.storageManager}
      disableTransitionOnChange={local.disableTransitionOnChange}
    >
      <ThemeProvider {...others} />
    </ColorModeProvider>
  );
}
