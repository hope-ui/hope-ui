import { HopeThemeConfig, ThemeConfig } from "./types";

export * from "./provider";
export * from "./types";

/**
 * Create a theme configuration to be passed to `HopeProvider`.
 */
export function extendTheme<T extends ThemeConfig>(config: HopeThemeConfig<T>) {
  return config;
}
