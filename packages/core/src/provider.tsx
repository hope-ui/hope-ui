import merge from "lodash.merge";
import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  FlowProps,
  useContext,
} from "solid-js";

import {
  ColorMode,
  getDefaultColorMode,
  saveColorModeToLocalStorage,
  toggleBodyDarkModeClass,
} from "./color-mode";
import { defaultHopeConfig, HopeComponentNames, HopeConfig, OverrideHopeConfig } from "./theme";

export interface HopeContextValue {
  config: HopeConfig;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}

export const HopeContext = createContext<HopeContextValue>();

export type HopeProviderProps = FlowProps<{
  /**
   * The Hope UI overriden configuration.
   */
  config?: OverrideHopeConfig;
}>;

export function HopeProvider(props: HopeProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const defaultColorMode = getDefaultColorMode(props.config?.initialColorMode ?? "system");

  // eslint-disable-next-line solid/reactivity
  const config = merge({}, defaultHopeConfig, props.config);

  // Create context signals
  const [colorMode, rawSetColorMode] = createSignal(defaultColorMode);

  const setColorMode = (value: ColorMode) => {
    rawSetColorMode(value);
    saveColorModeToLocalStorage(value);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode() === "dark" ? "light" : "dark");
  };

  // When color mode changes update `document.body` dark mode class.
  createEffect(() => toggleBodyDarkModeClass(colorMode()));

  const context: HopeContextValue = {
    config,
    colorMode,
    setColorMode,
    toggleColorMode,
  };

  return <HopeContext.Provider value={context}>{props.children}</HopeContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Configuration - primitives
 * -----------------------------------------------------------------------------------------------*/

/**
 * Primitive for accessing the configuration of a component in the `HopeProvider` context.
 * @returns The configuration of the component.
 */
export function useComponentConfig<T extends HopeComponentNames>(
  componentName: T
): HopeConfig["components"][T] {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useComponentConfig must be used within a HopeProvider");
  }

  return context.config.components[componentName];
}

/* -------------------------------------------------------------------------------------------------
 * ColorMode - primitives
 * -----------------------------------------------------------------------------------------------*/

/**
 * Primitive for accessing color mode related properties of the `HopeProvider` context.
 * @returns An accessor for the color mode and function to toggle it
 */
export function useColorMode() {
  const context = useContext(HopeContext);

  if (!context) {
    throw new Error("[Hope UI]: useColorMode must be used within a HopeProvider");
  }

  return {
    colorMode: context.colorMode,
    setColorMode: context.setColorMode,
    toggleColorMode: context.toggleColorMode,
  };
}

/**
 * Change value based on color mode.
 *
 * @param light The light mode value
 * @param dark The dark mode value
 * @return A memoized value based on the color mode.
 */
export function useColorModeValue<T = any>(light: T, dark: T) {
  const { colorMode } = useColorMode();

  const value = createMemo(() => (colorMode() === "dark" ? dark : light));

  return value;
}
