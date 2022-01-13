import { JSX } from "solid-js";

import { ChildrenProp, ElementType, PolymorphicComponentProps } from "@/components";
import { HopeColor, HopeSize, HopeXPosition } from "@/theme";

export type ButtonVariant = "filled" | "light" | "outline" | "dashed" | "text" | "default";

export type ThemeableButtonOptions = {
  variant?: ButtonVariant;
  color?: HopeColor;
  size?: HopeSize;
  radius?: HopeSize | "none" | "full";
  loaderPosition?: HopeXPosition;
  compact?: boolean;
  uppercase?: boolean;
  fullWidth?: boolean;
};

export type ButtonOptions = ThemeableButtonOptions &
  ChildrenProp & {
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
  };

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;
