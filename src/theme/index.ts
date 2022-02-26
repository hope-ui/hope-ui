import { HopeThemeConfig, StitchesThemeConfig } from "./types";

export * from "./provider";
export * from "./types";

/**
 * Create a theme configuration to be passed to `HopeProvider`.
 */
export function extendTheme<T extends StitchesThemeConfig>(config: HopeThemeConfig<T>) {
  return config;
}
