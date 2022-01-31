import { createContext, createSignal, mergeProps, PropsWithChildren, useContext } from "solid-js";
import { isServer } from "solid-js/web";

import { defaultTheme } from "@/theme/defaultTheme";
import { resetStyles } from "@/theme/reset";
import { HopeTheme } from "@/theme/types";
import { mockBody } from "@/utils/object";

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

  const body = isServer ? mockBody : document.body;

  // Apply stitches theme, `tokens` is the stitches theme object
  // eslint-disable-next-line solid/reactivity
  body.classList.add(theme().tokens);

  // Apply css reset
  resetStyles();

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
