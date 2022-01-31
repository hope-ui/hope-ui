import { createContext, createSignal, PropsWithChildren, useContext } from "solid-js";

import { resetStyles } from "@/theme/reset";
import { HopeTheme } from "@/theme/types";

import { ColorModeProvider } from "../color-mode/ColorModeProvider";
import { createDefaultTheme } from "./stitches.config";

export const HopeContext = createContext<HopeTheme>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeTheme;
}>;

export function HopeProvider(props: HopeProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const [theme] = createSignal(props.theme ?? createDefaultTheme());

  // Apply css reset
  resetStyles();

  return (
    <HopeContext.Provider value={theme()}>
      <ColorModeProvider initialColorMode={theme().initialColorMode}>
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
