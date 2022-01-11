import type { ThemeableButtonOptions } from "../components/Button/Button";

export interface ThemeableComponents {
  Button?: ThemeableButtonOptions;
}

export interface Theme {
  components?: ThemeableComponents;
}

export type SemanticColor =
  | "primary"
  | "dark"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger";

export type SemanticSize = "xs" | "sm" | "md" | "lg" | "xl";

export type SemanticPosition = "left" | "right";
