import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  PropsWithChildren,
  useContext,
} from "solid-js";

import { ColorMode } from "@/color-mode/types";

import { ColorModeProvider } from "../color-mode/provider";
import { resetStyles } from "./reset";

interface HopeContextValue {
  theme: Accessor<string>;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = PropsWithChildren<{
  initialColorMode?: ColorMode;
}>;

export function HopeProvider(props: HopeProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const [theme] = createSignal("theme");

  // Apply css reset
  resetStyles();

  const context: HopeContextValue = {
    theme,
  };

  return (
    <HopeContext.Provider value={context}>
      <ColorModeProvider initialColorMode={props.initialColorMode}>
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
