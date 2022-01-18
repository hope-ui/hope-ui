import { createContext, mergeProps, PropsWithChildren, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { defaultTheme, HopeTheme } from "@/theme";

export interface HopeContextValue {
  theme: HopeTheme;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeTheme;
}>;

export function HopeProvider(props: HopeProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);
  const [state] = createStore({ theme: propsWithDefault.theme });

  return <HopeContext.Provider value={state}>{props.children}</HopeContext.Provider>;
}

export function useHopeTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: no HopeTheme found, did you wrap your App with HopeProvider ?");
  }

  return context.theme;
}
