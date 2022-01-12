import merge from "lodash.merge";

import type { ThemeableButtonOptions } from "@/components";

export type HopeColor = "primary" | "dark" | "neutral" | "success" | "info" | "warning" | "danger";

export type HopeSize = "xs" | "sm" | "md" | "lg" | "xl";

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";

export interface ComponentsDefaultProps {
  Button?: ThemeableButtonOptions;
}

export interface HopeTheme {
  components?: ComponentsDefaultProps;
}

export const defaultTheme: HopeTheme = {};

export function extendTheme(themeOverride: HopeTheme): HopeTheme {
  return merge(defaultTheme, themeOverride);
}
