import { ColorMode } from "@hope-ui/styles";
import { createEffect, createSignal, on, onCleanup, ParentProps } from "solid-js";

import { noop } from "../utils/function";
import { ColorModeContext } from "./context";
import { localStorageManager } from "./storage-manager";
import { ColorModeContextType, ColorModeProviderProps, ConfigColorMode } from "./types";
import {
  addColorModeListener,
  getInitialColorMode,
  getSystemColorMode,
  setColorModeClassName,
  setColorModeDataset,
} from "./utils";

/**
 * Provides context for the color mode based on config in `theme`
 * Returns the color mode and function to toggle the color mode
 */
export function ColorModeProvider(props: ColorModeProviderProps) {
  const colorModeManager = () => props.storageManager ?? localStorageManager;
  const fallbackColorMode = () => (props.initialColorMode === "dark" ? "dark" : "light");
  let colorModeListenerCleanupFn: (() => unknown) | undefined;

  const [colorMode, rawSetColorMode] = createSignal(
    getInitialColorMode(colorModeManager(), fallbackColorMode())
  );

  const applyColorMode = (value: ColorMode) => {
    rawSetColorMode(value);

    setColorModeClassName(value === "dark");
    setColorModeDataset(value, props.disableTransitionOnChange);
  };

  const setColorMode = (value: ConfigColorMode) => {
    if (colorModeListenerCleanupFn) {
      colorModeListenerCleanupFn();
      colorModeListenerCleanupFn = undefined;
    }

    const isSystem = value === "system";

    if (isSystem) {
      colorModeListenerCleanupFn = addColorModeListener(applyColorMode);
    }

    applyColorMode(isSystem ? getSystemColorMode() : value);
    colorModeManager().set(value);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode() === "dark" ? "light" : "dark");
  };

  createEffect(
    on(
      [colorModeManager, fallbackColorMode, () => props.initialColorMode],
      ([colorModeManager, fallbackColorMode, initialColorMode]) => {
        const managerValue = colorModeManager.get();

        if (managerValue) {
          setColorMode(managerValue);
          return;
        }

        if (initialColorMode === "system") {
          setColorMode("system");
          return;
        }

        setColorMode(fallbackColorMode);
      }
    )
  );

  onCleanup(() => {
    // ensure listener is always cleaned when component is destroyed.
    colorModeListenerCleanupFn?.();
  });

  const context: ColorModeContextType = {
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
}

/** Locks the color mode to `dark`, without any way to change it. */
export const DarkMode = (props: ParentProps) => {
  const context: ColorModeContextType = {
    colorMode: () => "dark",
    toggleColorMode: noop,
    setColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
};

/** Locks the color mode to `light` without any way to change it. */
export const LightMode = (props: ParentProps) => {
  const context: ColorModeContextType = {
    colorMode: () => "light",
    toggleColorMode: noop,
    setColorMode: noop,
  };

  return <ColorModeContext.Provider value={context}>{props.children}</ColorModeContext.Provider>;
};
