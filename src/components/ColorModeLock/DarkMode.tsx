import { createSignal, JSX } from "solid-js";

import { ColorModeContext, ColorModeContextValue } from "@/color-mode/ColorModeProvider";
import { ColorMode } from "@/theme/types";
import { noop } from "@/utils/function";

/**
 * Locks the color mode to `dark` without any way to change it.
 */
export function DarkMode(props: { children?: JSX.Element }) {
  const [colorMode] = createSignal<ColorMode>("dark");

  const context: ColorModeContextValue = {
    colorMode,
    setColorMode: noop,
    toggleColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}
