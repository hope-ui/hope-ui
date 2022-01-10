import { createContext, JSX, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { defaultTheme, setColorsCSSVariables, Theme } from "../theme/theme";

export interface UIPieceContextValue {
  theme: Theme;
}

export const UIPieceContext = createContext<UIPieceContextValue>({ theme: defaultTheme });

export type UIPieceProviderProps = {
  theme?: Theme;
  children: JSX.Element;
};

export function UIPieceProvider(props: UIPieceProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);
  const [state] = createStore({ theme: propsWithDefault.theme });

  setColorsCSSVariables(state.theme.colors);

  return <UIPieceContext.Provider value={state}>{props.children}</UIPieceContext.Provider>;
}

export function useTheme() {
  return useContext(UIPieceContext).theme;
}
