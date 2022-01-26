import {
  createContext,
  createSignal,
  mergeProps,
  onMount,
  PropsWithChildren,
  useContext,
} from "solid-js";

import { applyGlobalBaseStyles } from "@/stitches/baseStyles";
import { defaultTheme } from "@/theme/defaultTheme";
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
  const [theme] = createSignal(propsWithDefault.theme);

  onMount(() => {
    // Apply the customized stitches theme and css reset
    document.body.classList.add(theme().tokens);
    applyGlobalBaseStyles(theme().tokens);
  });

  return <HopeContext.Provider value={{ theme: theme() }}>{props.children}</HopeContext.Provider>;
}

export function useHopeTheme() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: HopeTheme not found, did you wrap your App with HopeProvider ?");
  }

  return context.theme;
}
