import { HopeThemeConfig } from "./types";

export * from "./provider";
export * from "./types";

/**
 * Create a theme configuration to be passed to `HopeProvider`.
 */
export function extendTheme(config: HopeThemeConfig) {
  return config;
}
