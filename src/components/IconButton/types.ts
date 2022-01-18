import { JSX } from "solid-js";

import { ElementType, PolymorphicComponentProps } from "@/utils";

import { ThemeableButtonOptions } from "..";

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
