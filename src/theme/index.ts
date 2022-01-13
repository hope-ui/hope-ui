import merge from "lodash.merge";

import {
  ThemeableButtonOptions,
  ThemeableContainerOptions,
  ThemeablePaperOptions,
} from "@/components";
import { ThemeableIconButtonOptions } from "@/components/IconButton";

export type HopeColor = "primary" | "dark" | "neutral" | "success" | "info" | "warning" | "danger";

export type HopeSize = "xs" | "sm" | "md" | "lg" | "xl";

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";

export interface ComponentsDefaultProps {
  Button?: ThemeableButtonOptions;
  Container?: ThemeableContainerOptions;
  IconButton?: ThemeableIconButtonOptions;
  Paper?: ThemeablePaperOptions;
}

export interface HopeTheme {
  components?: ComponentsDefaultProps;
}

// For this moment it's an empty object because default component props are defined inside components.
export const defaultTheme: HopeTheme = {};

export function extendTheme(themeOverride: HopeTheme): HopeTheme {
  const defaultThemeCopy = merge({}, defaultTheme);
  return merge(defaultThemeCopy, themeOverride);
}
