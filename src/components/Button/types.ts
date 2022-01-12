import type { JSX } from "solid-js";

import type { ElementType, PolymorphicComponentProps } from "@/components";
import type { HopeColor, HopeSize, HopeXPosition } from "@/theme";

export type ButtonVariant = "filled" | "light" | "outline" | "dashed" | "text" | "default";

export type ThemeableButtonOptions = {
  variant?: ButtonVariant;
  color?: HopeColor;
  size?: HopeSize;
  radius?: HopeSize | "none" | "full";
  loaderPosition?: HopeXPosition;
  compact?: boolean;
  uppercase?: boolean;
};

export type ButtonOptions = ThemeableButtonOptions & {
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  children?: JSX.Element;
};

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;
