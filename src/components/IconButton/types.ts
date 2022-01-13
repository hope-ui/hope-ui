import { JSX } from "solid-js";

import { ElementType, PolymorphicComponentProps, ThemeableButtonOptions } from "@/components";

export type ThemeableIconButtonOptions = Omit<
  ThemeableButtonOptions,
  "loaderPosition" | "uppercase" | "fullWidth"
>;

export type IconButtonOptions = ThemeableIconButtonOptions & {
  "aria-label": string;
  icon?: JSX.Element;
  loading?: boolean;
  disabled?: boolean;
};

export type IconButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  IconButtonOptions
>;
