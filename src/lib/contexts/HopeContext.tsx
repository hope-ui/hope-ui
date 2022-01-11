import { createContext, JSX, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { defaultTheme } from "../theme";
import type { Theme } from "../theme/types";

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

  return <HopeContext.Provider value={state}>{props.children}</HopeContext.Provider>;
}

export function useTheme() {
  return useContext(HopeContext).theme;
}
