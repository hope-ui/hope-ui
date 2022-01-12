import { createContext, JSX, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import type { HopeTheme } from "@/theme";
import { defaultTheme } from "@/theme";

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
  return useContext(HopeContext).theme;
}
