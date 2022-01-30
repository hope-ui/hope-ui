import { createContext, createSignal, mergeProps, PropsWithChildren, useContext } from "solid-js";

import { defaultTheme } from "@/theme/defaultTheme";
import { resetStyles } from "@/theme/reset";
import { HopeTheme } from "@/theme/types";

export interface HopeContextValue {
  theme: HopeTheme;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = PropsWithChildren<{
  theme?: HopeTheme;
}>;

export function HopeProvider(props: HopeProviderProps) {
  const propsWithDefault = mergeProps({ theme: defaultTheme }, props);

  // eslint-disable-next-line solid/reactivity
  const [theme] = createSignal(propsWithDefault.theme);

  // Apply css reset
  resetStyles();

  // Apply the customized stitches theme
  // eslint-disable-next-line solid/reactivity
  document.documentElement.classList.add(theme().tokens);

  return <HopeContext.Provider value={{ theme: theme() }}>{props.children}</HopeContext.Provider>;
}

export function useTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: HopeTheme not found, did you wrap your App with HopeProvider ?");
  }

  return context.theme;
}
