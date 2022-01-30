import { createSignal, JSX } from "solid-js";

import { ColorModeContext, ColorModeContextValue } from "@/color-mode/ColorModeProvider";
import { ColorMode } from "@/theme/types";
import { noop } from "@/utils/function";

/**
 * Locks the color mode to `light` without any way to change it.
 */
export function LightMode(props: { children?: JSX.Element }) {
  const [colorMode] = createSignal<ColorMode>("light");

  const context: ColorModeContextValue = {
    colorMode,
    setColorMode: noop,
    toggleColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}
