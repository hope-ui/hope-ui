import { createContext, JSX, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { defaultTheme, HopeTheme } from "@/theme";

export interface HopeContextValue {
  theme: HopeTheme;
}

export const HopeContext = createContext({} as HopeContextValue);

export type HopeProviderProps = {
  theme?: HopeTheme;
  children: JSX.Element;
};

export function HopeProvider(props: HopeProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);
  const [state] = createStore({ theme: propsWithDefault.theme });

  return <HopeContext.Provider value={state}>{props.children}</HopeContext.Provider>;
}

export function useHopeTheme() {
  const context = useContext(HopeContext);

  if (!context.theme) {
    console.warn("[Hope UI]: no HopeTheme found, did you wrap your components with HopeProvider ?");
  }

  return context.theme;
}
