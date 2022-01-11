import { createContext, JSX, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { addColorCSSVariablesToStyleSheet, defaultTheme, Theme } from "../theme/theme";

interface HopeContextValue {
  theme: Theme;
}

const HopeContext = createContext<HopeContextValue>({ theme: defaultTheme });

export type HopeProviderProps = {
  theme?: Theme;
  children: JSX.Element;
};

export function HopeProvider(props: HopeProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);
  const [state] = createStore({ theme: propsWithDefault.theme });

  addColorCSSVariablesToStyleSheet(state.theme.colors);

  return <HopeContext.Provider value={state}>{props.children}</HopeContext.Provider>;
}

export function useTheme() {
  return useContext(HopeContext).theme;
}
