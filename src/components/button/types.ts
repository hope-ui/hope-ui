import { VariantProps } from "@stitches/core";
import { JSX } from "solid-js";

import { HopeXPosition } from "@/theme/types";

import { ElementType, ExtendableProps, HopeComponentProps } from "../types";
import { BaseButton } from "./Button";

type ButtonVariants = VariantProps<typeof BaseButton>;

export type ButtonOptions = ButtonVariants & {
  disabled?: boolean;
  loaderPosition?: HopeXPosition;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
};

export type ThemeableButtonOptions = Omit<
  ButtonOptions,
  "loading" | "disabled" | "leftIcon" | "rightIcon"
>;

export type ButtonProps<C extends ElementType> = ExtendableProps<
  HopeComponentProps<C>,
  ButtonOptions
>;
