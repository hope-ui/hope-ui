import merge from "lodash.merge";

import type { ThemeableButtonOptions } from "@/components";
import type { ThemeableContainerOptions } from "@/components/Container/types";

export type HopeColor = "primary" | "dark" | "neutral" | "success" | "info" | "warning" | "danger";

export type HopeSize = "xs" | "sm" | "md" | "lg" | "xl";

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";

export interface ComponentsDefaultProps {
  Button?: ThemeableButtonOptions;
  Container?: ThemeableContainerOptions;
}

export interface HopeTheme {
  components?: ComponentsDefaultProps;
}

export const defaultTheme: HopeTheme = {};

export function extendTheme(themeOverride: HopeTheme): HopeTheme {
  return merge(defaultTheme, themeOverride);
}
