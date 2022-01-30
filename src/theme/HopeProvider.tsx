import { createContext, createSignal, mergeProps, PropsWithChildren, useContext } from "solid-js";

import { defaultTheme } from "@/theme/defaultTheme";
import { resetStyles } from "@/theme/reset";
import { HopeTheme } from "@/theme/types";

import { ColorModeProvider } from "../color-mode/ColorModeProvider";

export const HopeContext = createContext<HopeTheme>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeTheme;
}>;

export function HopeProvider(props: HopeProviderProps) {
  const defaultProps: Required<Pick<HopeProviderProps, "theme">> = {
    theme: defaultTheme,
  };

  const propsWithDefault = mergeProps(defaultProps, props);

  // eslint-disable-next-line solid/reactivity
  const [theme] = createSignal(propsWithDefault.theme);

  // Apply css reset
  resetStyles();

  // Apply the customized stitches theme
  // eslint-disable-next-line solid/reactivity
  document.body.classList.add(theme().tokens);

  return (
    <HopeContext.Provider value={theme()}>
      <ColorModeProvider initialColorMode={theme().initialColorMode}>
        {propsWithDefault.children}
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
