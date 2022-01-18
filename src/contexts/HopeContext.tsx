import { createContext, mergeProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { applyGlobalBaseStyles, ChildrenProp, defaultTheme, HopeTheme } from "@/styled-system";

export interface HopeContextValue {
  theme: HopeTheme;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = ChildrenProp & {
  theme?: HopeTheme;
};

export function HopeProvider(props: HopeProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);
  const [state] = createStore({ theme: propsWithDefault.theme }); //eslint-disable-line

  // Apply the customized stitches theme and css reset
  document.body.classList.add(state.theme.tokens); //eslint-disable-line
  applyGlobalBaseStyles(state.theme.tokens); //eslint-disable-line

  return <HopeContext.Provider value={state}>{props.children}</HopeContext.Provider>;
}

export function useHopeTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: no HopeTheme found, did you wrap your component with HopeProvider ?"
    );
  }

  return context.theme;
}
