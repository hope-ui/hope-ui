import {
  ThemeableButtonOptions,
  ThemeableContainerOptions,
  ThemeableIconButtonOptions,
  ThemeablePaperOptions,
  ThemeableTagOptions,
} from "@/components";

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type HopeColor = "primary" | "dark" | "neutral" | "success" | "info" | "warning" | "danger";

export type HopeSize = "xs" | "sm" | "md" | "lg" | "xl";

export type HopeXPosition = "left" | "right";

export type HopeYPosition = "top" | "bottom";

export interface ComponentsDefaultProps {
  Button: Required<ThemeableButtonOptions>;
  Container: Required<ThemeableContainerOptions>;
  IconButton: Required<ThemeableIconButtonOptions>;
  Paper: Required<ThemeablePaperOptions>;
  Tag: Required<ThemeableTagOptions>;
}

export interface HopeTheme {
  components: ComponentsDefaultProps;
}
