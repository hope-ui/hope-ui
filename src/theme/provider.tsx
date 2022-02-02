import { createContext, createSignal, JSX, useContext } from "solid-js";

import { ColorMode } from "@/color-mode/types";

import { ColorModeProvider } from "../color-mode/provider";
import { resetStyles } from "./reset";

interface HopeContextValue {
  initialColorMode: ColorMode;
}

export const HopeContext = createContext<HopeContextValue>();

export function HopeProvider(props: { children?: JSX.Element }) {
  // eslint-disable-next-line solid/reactivity
  const [context] = createSignal<HopeContextValue>({ initialColorMode: "light" });

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
